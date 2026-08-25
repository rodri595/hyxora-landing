import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { HoldersResult, DayString } from "./types" */

/**
 * GET /holdings/holders — which users hold a given token or vault.
 *
 * The one thing `/holdings` could never answer: it is an aggregate, with no way to
 * ask who is behind a number. Until this shipped we rebuilt the join ourselves in
 * `/api/monitoring/holdings-index`, fanning out over `/users` and `/users/{privyId}`
 * — one upstream request per user with a balance. This is that query done in SQL
 * where it belongs, so the sweep is gone.
 *
 * `query` matches on symbol / vault name, not on chain: asking for USDC returns a
 * holder once, with `chains` listing every network they hold it on and `valueUsd`
 * summed across them.
 *
 * Disabled until there is something to search for, so an unexpanded row costs
 * nothing — `query` is required and an empty one is a 400.
 *
 * @param {Object} [params]
 * @param {string} [params.query] Token symbol or vault name. Required by the API.
 * @param {number} [params.limit] Max holders. API default 100, max 500.
 * @param {DayString} [params.asOfDate] Snapshot date, "YYYY-MM-DD". Omit for each
 * user's latest, which is what `/holdings` aggregates.
 * @param {boolean} [params.enabled] Extra gate — pass `false` to hold the request
 * back until the row is actually open.
 * @return {import("@tanstack/react-query").UseQueryResult<HoldersResult>} `data.holders`.
 */
export const useGetHoldingsHolders = (params = {}) => {
  const { enabled: hasAccess, privyId } = useCerebroAccess();
  const { query, limit, asOfDate, enabled = true } = params;

  const term = typeof query === "string" ? query.trim() : "";

  return useQuery({
    queryKey: ["cerebro", "holdingsHolders", privyId, term, limit, asOfDate],
    queryFn: async () => {
      const response = await cerebroClient.get("/holdings/holders", {
        params: cleanParams({ query: term, limit, asOfDate }),
      });
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: hasAccess && enabled && term !== "",
  });
};
