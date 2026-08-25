import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { FeeTotals } from "./types" */

/**
 * GET /fees/totals — lifetime, 30-day and 7-day treasury fee totals.
 * Counts user fees only (NFT sales are excluded; see `useGetNftFees` for those)
 * and adds Solana xStock fee income alongside the EVM numbers.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<FeeTotals>}
 */
export const useGetFeesTotals = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "feesTotals", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/totals");
      return response?.data ?? null;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
