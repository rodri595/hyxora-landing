import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserPnl } from "./types" */

/**
 * GET /users/{privyId}/pnl — what the user has *made*, EVM and Solana apart.
 *
 * The only source of performance in the whole API. Every other per-user figure is
 * a balance (`/users/{privyId}` → `tvl`) or a Hyxora ledger entry (`margin`, which
 * is our revenue on them, not their return); neither says whether the person is up
 * or down. Proxied from the app backend and **cached 4 hours** there, hence the
 * matching `staleTime`.
 *
 * Undocumented shape — admin.md names the endpoint and stops. `readPnl()` in
 * `usuarios/detail/normalize.js` reads it defensively and the panel renders nothing
 * rather than a zero when a figure doesn't arrive: on this endpoint a "$0.00" is
 * indistinguishable from a user who broke exactly even.
 *
 * @param {string} targetPrivyId The user's Privy DID, e.g. "did:privy:abc123".
 * @return {import("@tanstack/react-query").UseQueryResult<UserPnl>}
 */
export const useGetUserPnl = (targetPrivyId) => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "userPnl", privyId, targetPrivyId],
    queryFn: async () => {
      const response = await cerebroClient.get(`/users/${encodeURIComponent(targetPrivyId)}/pnl`);
      return response?.data ?? null;
    },
    staleTime: 4 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(targetPrivyId),
  });
};
