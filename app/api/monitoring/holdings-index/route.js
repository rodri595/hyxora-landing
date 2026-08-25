import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Who holds what — the one table Cerebro doesn't serve.
 *
 * The old dashboard answered this in SQL (`getHoldersOfToken()`, one query over
 * `daily_positions_by_user`). Cerebro exposes the same rows, but split in two:
 * `GET /users` has the identity half (email, plan, tvlUsd) and
 * `GET /users/{privyId}` the positions half. So this route rebuilds the join the
 * only way that's left — fan out, then group.
 *
 * It lives here rather than in the browser because that fan-out is one request
 * per user with a balance. From a panel it would be ~100 parallel XHRs on every
 * cold load; here it is one response the browser caches, and it doubles as the
 * index behind the search *and* the expandable holders rows, which would
 * otherwise each pay for their own sweep.
 *
 * It is not a credential holder like the rest of `/api/monitoring/*` — it forwards
 * the caller's own Privy bearer to Cerebro, so an allowlist miss still 401s from
 * Cerebro itself. `requireAdmin` runs first anyway to keep the gate uniform.
 */

const CEREBRO_API = process.env.NEXT_PUBLIC_CEREBRO_API || "https://admin.hyxora.com/api/v1";

/** Cerebro's own page maximum for GET /users. */
const USER_PAGE_SIZE = 200;

/**
 * Users swept per build, highest TVL first.
 *
 * A ceiling and not a "fetch everything" loop: the sweep costs one upstream
 * request per user, and `/users` counts every signup ever, most with no balance
 * at all. Cut-off users are reported in `truncated` so the panel can say the
 * index is partial instead of implying nobody else holds anything — the exact
 * failure mode that kept this section on `PendingEndpoint`.
 */
const MAX_USERS = 400;

/** Concurrent per-user requests. Enough to keep the sweep quick, low enough not to hammer Cerebro. */
const CONCURRENCY = 8;

/**
 * Cerebro caches for 5 minutes, so rebuilding faster than that buys nothing but
 * load.
 *
 * One entry, not one per admin: the index is the same table for everyone who gets
 * past `requireAdmin`, and Privy rotates access tokens, so keying by token would
 * miss on every refresh while growing without bound. The stored value is the
 * in-flight *promise*, so two admins opening the tab at once share one sweep
 * instead of racing two.
 */
const INDEX_TTL_MS = 5 * 60 * 1000;

/** @type {{ promise: Promise<Object>, expiresAt: number } | null} */
let cached = null;

/**
 * @param {string} path
 * @param {string} token Caller's Privy bearer, replayed upstream.
 * @return {Promise<any>}
 */
const cerebroGet = async (path, token) => {
  const response = await fetch(`${CEREBRO_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Cerebro respondió ${response.status} en ${path}`);
  return response.json();
};

/**
 * Run `worker` over `items` with a bounded number in flight.
 *
 * @template T, R
 * @param {T[]} items
 * @param {(item: T) => Promise<R>} worker
 * @return {Promise<R[]>}
 */
const mapWithConcurrency = async (items, worker) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, runner));
  return results;
};

/**
 * Normalise one position row.
 *
 * Both field sets are accepted on purpose. `admin.md` documents
 * `{ chainId, symbol, balance, usdValue }`, but `/holdings` — reading the same
 * snapshot table — actually sends the Zerion chain *slug*, and the old query
 * returned `name` / `valueUsd` / `positionType` besides. Reading only the
 * documented half is what left the «Redes» column blank, so read both and let
 * the missing one be null.
 *
 * @param {Object} position
 * @return {{ symbol: string, name: string | null, chain: string | null, chainId: number | null, valueUsd: number, positionType: string | null } | null}
 */
const normalisePosition = (position) => {
  if (!position) return null;

  const symbol = position.symbol ?? position.tokenSymbol ?? null;
  if (typeof symbol !== "string" || symbol.trim() === "") return null;

  const valueUsd = Number(position.usdValue ?? position.valueUsd ?? position.totalUsd ?? 0);

  return {
    symbol: symbol.trim(),
    name: typeof position.name === "string" ? position.name : null,
    chain: typeof position.chain === "string" ? position.chain : null,
    chainId: position.chainId ?? null,
    valueUsd: Number.isFinite(valueUsd) ? valueUsd : 0,
    positionType: position.positionType ?? position.protocol ?? null,
  };
};

/**
 * Every user with a balance, paged out of `GET /users` sorted by TVL.
 *
 * @param {string} token
 * @return {Promise<{ users: Object[], total: number, truncated: number }>}
 */
const fetchUsersWithBalance = async (token) => {
  const collected = [];
  let total = 0;

  for (let page = 1; collected.length < MAX_USERS; page++) {
    const body = await cerebroGet(
      `/users?page=${page}&pageSize=${USER_PAGE_SIZE}&sort=tvl&dir=desc`,
      token
    );

    const rows = Array.isArray(body?.users) ? body.users : [];
    total = Number(body?.total) || total;
    if (rows.length === 0) break;

    // Sorted by TVL descending, so the first zero ends the useful part of the list.
    const withBalance = rows.filter((user) => Number(user?.tvlUsd) > 0);
    collected.push(...withBalance);

    if (withBalance.length < rows.length) break;
    if (rows.length < USER_PAGE_SIZE) break;
  }

  return {
    users: collected.slice(0, MAX_USERS),
    total,
    truncated: Math.max(0, collected.length - MAX_USERS),
  };
};

/**
 * Sweep Cerebro and assemble the index. One call per user with a balance.
 *
 * @param {string} token Caller's Privy bearer, replayed upstream.
 * @return {Promise<Object>}
 */
const buildIndex = async (token) => {
  const { users, total: totalUsers, truncated } = await fetchUsersWithBalance(token);

  // Fail-soft per user: a portfolio that 500s costs that user's row, not the index.
  const failures = [];

  const holders = (
    await mapWithConcurrency(users, async (user) => {
      let detail;
      try {
        detail = await cerebroGet(`/users/${encodeURIComponent(user.privyId)}?pageSize=1`, token);
      } catch (error) {
        failures.push({ privyId: user.privyId, error: error?.message ?? "sin detalle" });
        return null;
      }

      const positions = (detail?.portfolio?.positions ?? [])
        .map(normalisePosition)
        .filter((position) => position && position.valueUsd > 0);

      if (positions.length === 0) return null;

      return {
        privyId: user.privyId,
        email: user.email ?? null,
        username: user.username ?? null,
        plan: user.plan ?? null,
        tvlUsd: Number(user.tvlUsd) || 0,
        refreshedAt: detail?.portfolio?.tvl?.refreshedAt ?? null,
        positions,
      };
    })
  ).filter(Boolean);

  return {
    holders,
    scannedUsers: users.length,
    totalUsers,
    truncated,
    failures,
    builtAt: new Date().toISOString(),
  };
};

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const token = (request.headers.get("authorization") ?? "").slice(7);

  const fresh = cached && cached.expiresAt > Date.now();
  if (!fresh) {
    cached = { promise: buildIndex(token), expiresAt: Date.now() + INDEX_TTL_MS };
  }

  try {
    const body = await cached.promise;
    return Response.json({ ...body, cached: fresh });
  } catch (error) {
    // Never cache a failure — the next admin gets a real attempt, not the error.
    cached = null;
    return Response.json({ error: error?.message ?? "Cerebro no respondió." }, { status: 502 });
  }
}
