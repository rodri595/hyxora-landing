import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserStats } from "./types" */

/**
 * GET /users/stats — headline user counts, the daily signup series for the chart,
 * and the activation funnel (total → with wallet → active → with TVL).
 *
 * @param {Object} [params]
 * @param {number} [params.days] Window for `newUsers` and the `signups` series.
 * API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<UserStats>}
 */
export const useGetUserStats = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "userStats", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/users/stats", {
        params: cleanParams({ days }),
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
