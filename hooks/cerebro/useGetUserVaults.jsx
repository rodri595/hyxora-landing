import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserVaults } from "./types" */

/**
 * GET /users/{privyId}/vaults — Hyxora's own view of this user's vault positions,
 * proxied from the app backend's `/vault/positions/{wallet}` and fanned out over
 * their Safes server-side.
 *
 * Worth a second request next to `/users/{privyId}`, which already carries the
 * Zerion positions: this one names the product ("Gauntlet USDC Prime" rather than
 * a `gtUSDCp` ticker) and carries a per-vault **PnL**, which Zerion cannot give us
 * — it has no entry price. The old dashboard called the same backend directly and
 * anchored the result under its vault table for exactly that reason.
 *
 * **Cached 4 hours upstream**, so `staleTime` matches: this is the one per-user
 * endpoint whose figures do not move on a 5-minute tick.
 *
 * Undocumented shape — admin.md names the endpoint and stops. Read it through
 * `readVaultPositions()` in `usuarios/detail/normalize.js`, which coerces the
 * decimal *strings* the backend serialises USD fields as.
 *
 * @param {string} targetPrivyId The user's Privy DID, e.g. "did:privy:abc123".
 * @return {import("@tanstack/react-query").UseQueryResult<UserVaults>}
 */
export const useGetUserVaults = (targetPrivyId) => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "userVaults", privyId, targetPrivyId],
    queryFn: async () => {
      const response = await cerebroClient.get(
        `/users/${encodeURIComponent(targetPrivyId)}/vaults`
      );
      return response?.data ?? null;
    },
    staleTime: 4 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(targetPrivyId),
  });
};
