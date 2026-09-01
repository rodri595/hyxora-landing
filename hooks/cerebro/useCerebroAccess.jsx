import { useIsAdmin } from "@/hooks/user/useIsAdmin";

/**
 * Gate shared by every Cerebro query.
 *
 * Two conditions, and both matter. Cerebro authenticates with a raw Privy
 * access token and checks the caller's Privy ID against its own server-side
 * allowlist — that is the real authorisation and we cannot read it from here.
 * But "logged in with Privy" on its own is not a reason to ask: it let any
 * signed-in visitor who opened `/admin?tab=cerebro` fire the whole tab's worth
 * of requests, ~40 of them, every one answered 401. So the client-side gate is
 * `useIsAdmin()` — Privy ready and authenticated, a Hyxora session minted, and
 * the `Admin` role on it.
 *
 * That role is a *different* list from `ADMIN_ALLOWLIST_PRIVY_IDS`. It is a
 * filter on who bothers to ask, not a prediction of the answer: someone who
 * passes it can still get a 401 from Cerebro, and the UI must still surface
 * that rather than pre-empting it. Deliberately does NOT depend on
 * `smartWalletAddress` beyond what the role lookup itself needs.
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
