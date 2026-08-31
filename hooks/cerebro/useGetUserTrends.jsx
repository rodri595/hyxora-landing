import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserTrends } from "./types" */

/**
 * GET /users/trends — daily signups alongside the `daily_snapshots` series: users,
 * plan mix, TVL, gas cost, fees and margin, one row per day.
 *
 * The first TVL *history* the API exposes. Everything else that reports TVL —
 * `/overview`, `/holdings`, `/system/health` — is a snapshot of right now, which is
 * why the TVL curve was an ask rather than a chart.
 *
 * Read it as the chart cache it is: admin.md's own note says `daily_snapshots` is
 * never the source of truth for a current figure. The headline number stays on
 * `/overview`; this draws the shape behind it.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Window length. API default 90, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<UserTrends>} `data.signups`
 * and `data.snapshots`.
 */
export const useGetUserTrends = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "userTrends", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/users/trends", {
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
