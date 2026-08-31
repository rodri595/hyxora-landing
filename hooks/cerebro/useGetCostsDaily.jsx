import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CostDailyPoint } from "./types" */

/**
 * GET /costs/daily — daily cost / fee / margin time series for charts.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<CostDailyPoint[]>} `data` is the
 * unwrapped `series` array.
 */
export const useGetCostsDaily = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "costsDaily", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/daily", {
        params: cleanParams({ days }),
      });
      return response?.data?.series ?? [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
