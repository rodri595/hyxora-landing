import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CostByChainRow } from "./types" */

/**
 * GET /costs/by-chain — sponsored gas cost broken down by blockchain network.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<CostByChainRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetCostsByChain = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "costsByChain", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/by-chain", {
        params: cleanParams({ days }),
      });
      return response?.data?.rows ?? [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
