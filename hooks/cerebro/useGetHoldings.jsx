import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { Holdings, DayString } from "./types" */

/**
 * GET /holdings — top tokens and vaults by aggregate USD exposure across all users.
 *
 * @param {Object} [params]
 * @param {number} [params.limit] Max rows per list. API default 25, max 100.
 * @param {DayString} [params.asOfDate] Snapshot date, "YYYY-MM-DD". Omit for the latest
 * snapshot — per-user snapshot dates differ, so the backend resolves the newest per user
 * rather than one global date.
 * @return {import("@tanstack/react-query").UseQueryResult<Holdings>} `data.tokens` and
 * `data.vaults`.
 */
export const useGetHoldings = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { limit, asOfDate } = params;

  return useQuery({
    queryKey: ["cerebro", "holdings", privyId, limit, asOfDate],
    queryFn: async () => {
      const response = await cerebroClient.get("/holdings", {
        params: cleanParams({ limit, asOfDate }),
      });
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
