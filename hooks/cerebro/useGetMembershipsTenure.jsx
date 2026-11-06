import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { MembershipsTenure } from "./types" */

/**
 * GET /memberships/tenure — how long current members have been members: buckets
 * and medians per plan, plus monthly cohorts with how many are still active.
 *
 * Counts `active`, `toCancel` and `toDowngrade` only — a `toCancel` member is still
 * inside the period they paid for.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Cohort window. API default 365, max 730.
 * @return {import("@tanstack/react-query").UseQueryResult<MembershipsTenure>}
 */
export const useGetMembershipsTenure = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "membershipsTenure", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/memberships/tenure", {
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
