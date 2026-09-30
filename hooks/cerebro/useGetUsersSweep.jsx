import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** @import { CerebroUser } from "./types" */

/** What we ask for. The API caps it at 200 and may hand back fewer. */
const PAGE_SIZE = 200;

/** Stop sweeping rather than paging forever if the pager ever misbehaves. */
export const SWEEP_MAX_PAGES = 25;

const count = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Every `/users` row for one scope + search, in the server's order, keyed by
 * `privyId` so a repeated page cannot double-count anyone.
 *
 * The stop condition is an empty page and not a short one: the API is free to cap
 * `pageSize` below what we asked for, and treating a 50-row answer to a 200-row
 * request as "the end" is what made the first version of the activation funnel read
 * one page and report a fifth of it without a word.
 *
 * @param {Object} [params]
 * @param {"created" | "tvl" | "cost" | "fees" | "net" | "plan"} [params.sort]
 * @param {"asc" | "desc"} [params.dir]
 * @param {string} [params.search]
 * @param {"active" | "inactive"} [params.scope]
 * @return {Promise<{ rows: CerebroUser[], total: number | null, truncated: boolean }>}
 */
export const fetchAllUsers = async ({ sort = "tvl", dir = "desc", search, scope } = {}) => {
  const byId = new Map();
  let total = null;
  let page = 1;
  let truncated = false;

  while (page <= SWEEP_MAX_PAGES) {
    const response = await cerebroClient.get("/users", {
      params: cleanParams({ page, pageSize: PAGE_SIZE, sort, dir, search, scope }),
    });

    const body = response?.data ?? {};
    const users = Array.isArray(body.users) ? body.users : [];
    for (const user of users) byId.set(user?.privyId ?? `row-${byId.size}`, user);

    const reported = count(body.total);
    if (reported !== null) total = reported;

    if (users.length === 0) break;
    if (total !== null && byId.size >= total) break;

    page += 1;
    if (page > SWEEP_MAX_PAGES) truncated = true;
  }

  return { rows: [...byId.values()], total, truncated };
};

/**
 * GET /users, every page — for the filters `/users` has no parameter for.
 *
 * The endpoint filters on `scope` and `search` only, so «plan Premium» or «KYC en
 * revisión» can't be asked of it. Filtering the one page the browser holds would
 * pass for filtering the table, so the users table sweeps the lot instead, keeps the
 * server's order and search, and filters client-side. At ~450 accounts that is three
 * requests, made only while such a filter is on.
 *
 * It is the same fan-out CLAUDE.md warns about — a workaround for missing query
 * params, not an architecture. The day `/users` takes `plan`, `kyc`, `membership`,
 * `minTvl` and `since`, the table goes back to one page per request.
 *
 * @param {Object} [params] Same as `fetchAllUsers`.
 * @param {Object} [options]
 * @param {boolean} [options.enabled] On top of the Cerebro access gate.
 * @return {import("@tanstack/react-query").UseQueryResult<{ rows: CerebroUser[], total: number | null, truncated: boolean }>}
 */
export const useGetUsersSweep = (params = {}, { enabled: wanted = true } = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { sort, dir, search, scope } = params;

  return useQuery({
    queryKey: ["cerebro", "usersSweep", privyId, sort, dir, search, scope],
    queryFn: () => fetchAllUsers({ sort, dir, search, scope }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && wanted,
  });
};
