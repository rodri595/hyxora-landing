import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { MembershipsChurn } from "./types" */

/**
 * GET /memberships/churn — daily membership movements from `membership_events`.
 *
 * History starts 2026-06-10: a window reaching further back has no rows for those
 * days, which is missing data, not zero. `renewalsPaid` is a proxy (each jump of
 * the renew date), not an invoice count.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Window. API default 90, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<MembershipsChurn>}
 */
export const useGetMembershipsChurn = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "membershipsChurn", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/memberships/churn", {
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
