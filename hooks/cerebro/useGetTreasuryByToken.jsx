import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { TreasuryByTokenRow } from "./types" */

/**
 * GET /fees/treasury/by-token — treasury inflows grouped by (chain, token), with
 * an operation-type breakdown per row.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @param {"user-fees" | "treasury-management" | "all"} [params.source] Inflow source.
 * API default "user-fees".
 * @param {boolean} [params.includeNonWhitelisted] Include tokens outside the whitelist
 * (dust and unknown tokens). API default false.
 * @return {import("@tanstack/react-query").UseQueryResult<TreasuryByTokenRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetTreasuryByToken = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days, source, includeNonWhitelisted } = params;

  return useQuery({
    queryKey: ["cerebro", "treasuryByToken", privyId, days, source, includeNonWhitelisted],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/treasury/by-token", {
        params: cleanParams({ days, source, includeNonWhitelisted }),
      });
      return response?.data?.rows ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
