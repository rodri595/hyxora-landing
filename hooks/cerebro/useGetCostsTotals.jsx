import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CostTotals } from "./types" */

/**
 * GET /costs/totals — lifetime, 30-day and 7-day sponsored gas cost totals plus
 * operation counts, split into `evm` and `solana`.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<CostTotals>}
 */
export const useGetCostsTotals = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "costsTotals", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/totals");
      return response?.data ?? null;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
