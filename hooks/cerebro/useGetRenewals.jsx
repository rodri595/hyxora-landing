import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { Renewals } from "./types" */

/**
 * GET /users/renewals — memberships expiring inside the next `days`, counted by plan.
 *
 * Counts only: the endpoint returns `total` and `byPlan`, not the users behind them,
 * so this answers "how much is up for renewal" and not "who to email".
 *
 * @param {Object} [params]
 * @param {number} [params.days] Lookahead window. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<Renewals>} `data.total` and
 * `data.byPlan`.
 */
export const useGetRenewals = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "renewals", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/users/renewals", {
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
