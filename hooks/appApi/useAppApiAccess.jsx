import { usePrivy } from "@privy-io/react-auth";

/**
 * Gate shared by every app-api query.
 *
 * Mirrors `useCerebroAccess` on purpose: the `/api/app-api` proxy authorises by
 * replaying the caller's Privy token against Cerebro's allowlist, so the same
 * "Privy is ready and the user is logged in" precondition applies and there is
 * nothing further to verify client-side. A non-allowlisted user gets a 401 with
 * the reason in the body; surface it rather than pre-empting it here.
 *
 * @return {{ enabled: boolean, privyId: string | null }}
 */
export const useAppApiAccess = () => {
  const { ready, authenticated, user } = usePrivy();

  return {
    enabled: ready && authenticated,
    privyId: user?.id ?? null,
  };
};
