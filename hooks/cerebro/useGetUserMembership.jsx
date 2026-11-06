import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserMembership } from "./types" */

/**
 * GET /users/{privyId}/membership — one user's membership state and every
 * transition it went through, newest first.
 *
 * Each `membership_renew_date` event is a renewal the backend's `invoice.paid`
 * webhook pushed, so the timeline doubles as the user's payment history — an
 * estimate, there is no mirrored Stripe ledger. 404 when the DID is unknown.
 *
 * Called only by the components that show it (the drawer's «Membresía» tab and an
 * expanded row in the cancellation pipeline), so it costs one request per user
 * somebody actually looks at. Cached 60 s upstream.
 *
 * @param {string} targetPrivyId The user's Privy DID, e.g. "did:privy:abc123".
 * @return {import("@tanstack/react-query").UseQueryResult<UserMembership>}
 */
export const useGetUserMembership = (targetPrivyId) => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "userMembership", privyId, targetPrivyId],
    queryFn: async () => {
      const response = await cerebroClient.get(
        `/users/${encodeURIComponent(targetPrivyId)}/membership`
      );
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: enabled && Boolean(targetPrivyId),
  });
};
