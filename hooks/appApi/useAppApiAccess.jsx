import { useIsAdmin } from "@/hooks/user/useIsAdmin";

/**
 * Gate shared by every app-api query, and by `hooks/monitoring/` too.
 *
 * Mirrors `useCerebroAccess` on purpose: the `/api/app-api` proxy and
 * `/api/monitoring/*` both authorise by replaying the caller's Privy token
 * against Cerebro's allowlist, so the same preconditions apply — Privy ready
 * and authenticated, a Hyxora session, and the `Admin` role on it.
 *
 * The role is our own filter on who asks, not the authorisation: a
 * non-allowlisted caller who passes it still gets a 401 with the reason in the
 * body, and that must be surfaced rather than pre-empted.
 *
 * @return {{ enabled: boolean, isResolving: boolean, privyId: string | null }}
 */
export const useAppApiAccess = () => {
  const { isAdmin, isResolving, privyId } = useIsAdmin();

  return { enabled: isAdmin, isResolving, privyId };
};
