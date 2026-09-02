import { useIsAdmin } from "@/hooks/user/useIsAdmin";

/**
 * Gate shared by every Cerebro query.
 *
 * Cerebro is now the gateway's `/admin` service and takes the same Hyxora
 * session as `/founders`, so the precondition is simply `useIsAdmin()` — Privy
 * ready and authenticated, a session minted, and the `Admin` role on it. That
 * gate exists to stop the ~40 requests an unprivileged visitor who opened
 * `/admin?tab=cerebro` would otherwise fire and have answered 401.
 *
 * That role is a *different* list from `ADMIN_ALLOWLIST_PRIVY_IDS`, which the
 * gateway checks server-side and we cannot read from here. It is a filter on who
 * bothers to ask, not a prediction of the answer: someone who passes it can
 * still be refused, and the UI must still surface that rather than pre-empting
 * it. Deliberately does NOT depend on `smartWalletAddress` beyond what the role
 * lookup itself needs.
 *
 * @return {{ enabled: boolean, isResolving: boolean, privyId: string | null }}
 * `enabled` feeds react-query's `enabled` flag; `privyId` is the DID of the
 * caller (useful as a query-key scope); `isResolving` is true while the role is
 * still being fetched, so a screen can show a spinner instead of "sin permiso".
 */
export const useCerebroAccess = () => {
  const { isAdmin, isResolving, privyId } = useIsAdmin();

  return { enabled: isAdmin, isResolving, privyId };
};
