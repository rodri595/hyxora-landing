import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CostByPlanRow } from "./types" */

/**
 * GET /costs/by-plan — cost, fees and margin broken down by membership plan.
 *
 * Takes no parameters (unlike the other /costs breakdowns, there is no `days`).
 *
 * @return {import("@tanstack/react-query").UseQueryResult<CostByPlanRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetCostsByPlan = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "costsByPlan", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/by-plan");
      return response?.data?.rows ?? [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
