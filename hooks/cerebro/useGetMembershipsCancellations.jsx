import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { MembershipsCancellations } from "./types" */

/**
 * GET /memberships/cancellations — the cancellation pipeline as a list of users:
 * everyone `toCancel`, with a future effective date, in withdraw-only grace, or
 * finalised inside the window. Capped at 500 rows.
 *
 * Until migration #670 the answer is `lifecycleAvailable: false` with `rows: []` —
 * render that as "pending migration", never as an empty pipeline.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Lookback for *finalised* cancellations. API default
 * 90, max 365. Pending ones are always included.
 * @return {import("@tanstack/react-query").UseQueryResult<MembershipsCancellations>}
 */
export const useGetMembershipsCancellations = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "membershipsCancellations", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/memberships/cancellations", {
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
