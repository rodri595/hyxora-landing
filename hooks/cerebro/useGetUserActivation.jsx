import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserActivation } from "./types" */

/** Balance over this counts as funded — the threshold `/users/activation` uses. */
const FUNDED_USD = 0.5;

/** What we ask for. The API caps it at 200 and may hand back fewer. */
const PAGE_SIZE = 200;

/** Stop sweeping rather than paging forever if the pager ever misbehaves. */
const MAX_PAGES = 25;

/**
 * Cerebro serialises Postgres `numeric` as a quoted string on several endpoints,
 * so every figure here is coerced rather than type-checked. Reading `activation`
 * with a strict `typeof === "number"` is what left every bar on this panel at "—"
 * while the row-level counts underneath rendered fine.
 */
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Same coercion, but null for "the field never arrived" — no silent zeros. */
const count = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Which stage a user is in. Top to bottom, first match wins — the order
 * `/users/activation` documents, so every user lands in exactly one bucket and the
 * five sum to the sweep.
 *
 * Two of the five rules are proxies for something `/users` does not carry, and both
 * lean the same way — towards not calling someone active who isn't:
 *
 * - **Deployed** is a sponsorship bill (`costUsd` / `costOps`). We only ever pay gas
 *   for a Safe that exists, so a non-zero bill means the counterfactual address was
 *   deployed. Server-side the rule is "at least one sponsored UserOp", which is the
 *   same fact read from the other side.
 * - **Used** is a treasury fee, or more sponsored ops than the one that deployed the
 *   wallet. Server-side it is a row in `hyxora_activities` or `hyxora_ramp_orders`,
 *   neither of which `/users` exposes. So a user whose only product use was free and
 *   fee-less reads as never-used here.
 *
 * `last_active_at` is deliberately not the signal, and neither is `scope=inactive`,
 * which appears to be built on it: every indexer hook stamps that column, the
 * deployment op included, so it counts wallets that have only ever been created.
 * Filtering on it is what left this panel showing 5 parked users out of 16.
 */
const classify = (row) => {
  const safe = row?.safeAddress ?? row?.safe ?? null;
  if (!safe) return "noWallet";

  const ops = num(row?.costOps);
  if (num(row?.feesUsd) > 0 || num(row?.feeTxs) > 0 || ops > 1) return "active";

  if (num(row?.tvlUsd) > FUNDED_USD) return "balanceNeverUsed";
  if (num(row?.costUsd) > 0 || ops > 0) return "deployedNeverUsed";
  return "walletNotDeployed";
};

/**
 * Every user, a page at a time, keyed by `privyId` so a repeated page cannot
 * double-count anyone.
 *
 * The stop condition is an empty page and not a short one: the API is free to cap
 * `pageSize` below what we asked for, and treating a 50-row answer to a 200-row
 * request as "the end" is what made the first version of this read one page and
 * report a fifth of the funnel without a word.
 *
 * @return {Promise<{ rows: Object[], total: number | null, truncated: boolean }>}
 */
const fetchAllUsers = async () => {
  const byId = new Map();
  let total = null;
  let page = 1;
  let truncated = false;

  while (page <= MAX_PAGES) {
    const response = await cerebroClient.get("/users", {
      params: cleanParams({ page, pageSize: PAGE_SIZE, sort: "tvl", dir: "desc" }),
    });

    const body = response?.data ?? {};
    const users = Array.isArray(body.users) ? body.users : [];
    for (const user of users) byId.set(user?.privyId ?? `row-${byId.size}`, user);

    const reported = count(body.total);
    if (reported !== null) total = reported;

    if (users.length === 0) break;
    if (total !== null && byId.size >= total) break;

    page += 1;
    if (page > MAX_PAGES) truncated = true;
  }

  return { rows: [...byId.values()], total, truncated };
};

/**
 * The onboarding funnel, assembled here instead of read from `/users/activation`.
 *
 * That endpoint shipped on 2026-08-27 and answers **500 —
 * `a.createdAt.toISOString is not a function`**: its port kept the old dashboard's
 * consumer and dropped the `createdAt: new Date(row.created_at)` mapping
 * `getUsersOverview` ends with, so it calls a Date method on a raw string. Nothing
 * a caller can work around. Swap this body for a single GET the day it is fixed —
 * the shape returned here is deliberately the one that endpoint documents.
 *
 * It sweeps `/users` in full — three requests at today's ~450 accounts, more if the
 * API caps the page below 200 — and classifies each row with `classify()`. That is
 * the fan-out CLAUDE.md warns about, and it is a workaround, not an architecture.
 *
 * Counting per row rather than deriving one bucket by subtraction is what makes the
 * five sum to the sweep by construction. The cross-checks are therefore against
 * `/users/stats`, which counts the same population its own way: a gap there is
 * either a short sweep, which is a bug, or the activity proxy above, which is a
 * known approximation and says so in `notes` rather than in `warnings`.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<UserActivation>}
 */
export const useGetUserActivation = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "userActivation", privyId],
    queryFn: async () => {
      const [statsResponse, sweep] = await Promise.all([
        cerebroClient.get("/users/stats"),
        fetchAllUsers(),
      ]);

      const activation = statsResponse?.data?.activation ?? {};
      const statsTotal = count(activation.total) ?? count(statsResponse?.data?.totalUsers);
      const statsWithWallet = count(activation.withWallet);
      const statsActive = count(activation.active);

      const buckets = {
        noWallet: 0,
        walletNotDeployed: 0,
        deployedNeverUsed: 0,
        balanceNeverUsed: 0,
        active: 0,
      };
      const parked = [];

      for (const row of sweep.rows) {
        const stage = classify(row);
        buckets[stage] += 1;

        if (stage === "balanceNeverUsed") {
          parked.push({
            privyId: row?.privyId ?? null,
            email: row?.email ?? null,
            tvlUsd: num(row?.tvlUsd),
            // Not in admin.md's `/users` response, but `getUsersOverview` selects it
            // and the port kept the mapper's names. Absent is fine — the table drops
            // the column rather than showing one full of dashes.
            safe: row?.safeAddress ?? row?.safe ?? null,
            createdAt: row?.createdAt ?? null,
          });
        }
      }

      parked.sort((a, b) => b.tvlUsd - a.tvlUsd);

      const swept = sweep.rows.length;
      const total = statsTotal ?? swept;

      const warnings = [];
      if (sweep.truncated) {
        warnings.push(
          `El barrido paró en ${MAX_PAGES} páginas con ${swept} usuarios leídos, así que los tramos cuentan de menos.`
        );
      }
      if (statsTotal !== null && swept !== statsTotal) {
        warnings.push(
          `Se leyeron ${swept} usuarios y /users/stats cuenta ${statsTotal}: los tramos son de los ${swept} que llegaron, no del total.`
        );
      }

      const notes = [];
      if (statsActive !== null && statsActive !== buckets.active) {
        notes.push(
          `Cerebro cuenta ${statsActive} activos con su propia definición y aquí salen ${buckets.active}: /users no expone actividades ni órdenes de ramp, así que «usada» se aproxima con comisiones pagadas y operaciones patrocinadas.`
        );
      }
      if (
        statsWithWallet !== null &&
        statsTotal !== null &&
        statsTotal - statsWithWallet !== buckets.noWallet
      ) {
        notes.push(
          `Sin wallet: ${buckets.noWallet} aquí frente a ${statsTotal - statsWithWallet} según /users/stats.`
        );
      }

      return {
        total,
        buckets,
        balanceNeverUsed: parked,
        warnings,
        notes,
        sweptUsers: swept,
        fundedThresholdUsd: FUNDED_USD,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
