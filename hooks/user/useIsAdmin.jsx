import { roleNames } from "@/constants/roles";
import { useWeb3 } from "@/context/Web3Provider";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import { usePrivy } from "@privy-io/react-auth";

/**
 * The one place that answers "is the person at this screen an admin?".
 *
 * Being logged in with Privy is not the same as being an admin, and neither is
 * holding a Hyxora session: both are preconditions. The answer itself is the
 * `Admin` role on `/user/myInformation`, which is the same check the sidebar,
 * the header menu and every `hooks/admin/` query already make — this hook just
 * stops that line being copied a fourth time.
 *
 * `isResolving` exists because react-query reports a *disabled* query as
 * pending forever, so "not admin yet" and "not admin" are the same booleans.
 * A caller that gates a whole screen must show a spinner while this is true, or
 * a real admin sees "sin permiso" for the second it takes the smart wallet to
 * resolve and the session to be minted.
 *
 * Note this is a **client-side gate on our own UI**, not an authorisation
 * boundary: every backend still checks for itself. Cerebro in particular
 * authorises against its own `ADMIN_ALLOWLIST_PRIVY_IDS`, which is a different
 * list from this role — so a 401 from Cerebro is still possible for someone who
 * passes here, and must still be surfaced.
 *
 * @return {{ isAdmin: boolean, isResolving: boolean, privyId: string | null }}
 */
export const useIsAdmin = () => {
  const { ready, authenticated, user } = usePrivy();
  const { isSessionReady, isSessionSettled } = useWeb3();
  const { data: userInformation, isFetched } = useGetUserInformation();

  const signedIn = ready && authenticated && isSessionReady;
  const isAdmin =
    signedIn && (userInformation?.information?.role?.includes(roleNames?.admin ?? "") ?? false);

  // Still deciding while Privy boots, while the session is being minted, and
  // while the role query has not come back — including the stretch where it is
  // disabled waiting on `smartWalletAddress`.
  //
  // `isSessionSettled` rather than `isSessionReady` on the first leg: a rejected
  // Privy token settles the login as an error and never becomes ready, so
  // waiting on ready alone leaves the caller spinning for good.
  const isResolving =
    !ready || (authenticated && (!isSessionSettled || (isSessionReady && !isFetched)));

  return { isAdmin, isResolving, privyId: user?.id ?? null };
};
