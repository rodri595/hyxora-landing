import { usePrivy } from "@privy-io/react-auth";

/**
 * Gate shared by every Cerebro query.
 *
 * Cerebro authenticates with a raw Privy access token and checks the caller's
 * Privy ID against its own server-side allowlist, so there is nothing to verify
 * client-side beyond "Privy is ready and the user is logged in". Deliberately
 * does NOT depend on the Hyxora session (`isSessionReady` / `smartWalletAddress`) —
 * that cookie belongs to a different API.
 *
 * A non-allowlisted user simply gets a 401 from Cerebro; surface that in the UI
 * rather than trying to pre-empt it here.
 *
 * @return {{ enabled: boolean, privyId: string | null }} `enabled` feeds react-query's
 * `enabled` flag; `privyId` is the DID of the caller (useful as a query-key scope).
 */
export const useCerebroAccess = () => {
  const { ready, authenticated, user } = usePrivy();

  return {
    enabled: ready && authenticated,
    privyId: user?.id ?? null,
  };
};
