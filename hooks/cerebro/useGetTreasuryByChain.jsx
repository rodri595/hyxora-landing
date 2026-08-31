import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { TreasuryByChainRow } from "./types" */

/**
 * GET /fees/treasury/by-chain — treasury inflows grouped by blockchain network.
 *
 * Note: unlike `useGetTreasuryByToken`, this endpoint has no `days` filter — it is
 * always all-time.
 *
 * @param {Object} [params]
 * @param {boolean} [params.includeNonWhitelisted] Include tokens outside the whitelist.
 * API default false.
 * @return {import("@tanstack/react-query").UseQueryResult<TreasuryByChainRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetTreasuryByChain = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { includeNonWhitelisted } = params;

  return useQuery({
    queryKey: ["cerebro", "treasuryByChain", privyId, includeNonWhitelisted],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/treasury/by-chain", {
        params: cleanParams({ includeNonWhitelisted }),
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
