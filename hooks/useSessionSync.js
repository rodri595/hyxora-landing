import { useAuth } from "@/hooks/useAuth";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Exchanges the Privy access token for a backend session as soon as Privy is
 * authenticated. Never infers session state from `document.cookie`: the session
 * cookie is HttpOnly in production and a logged-out `session=` (empty value)
 * reads as "present". Every authenticated query must wait on `isSessionReady`.
 *
 * `isSessionSettled` is the other half of that: `isSessionReady` alone cannot
 * tell "the login is still in flight" from "the login failed and never will
 * succeed", so anything that shows a spinner until the session exists would
 * spin forever on a rejected token. Gate the *requests* on `isSessionReady` and
 * the *spinner* on `isSessionSettled`.
 *
 * @return {{ isSessionReady: boolean, isSessionSettled: boolean }}
 */
export function useSessionSync() {
  const { getAccessToken, authenticated, ready, user } = usePrivy();
  const { authenticate } = useAuth();

  const { isSuccess, isError } = useQuery({
    queryKey: ["session-sync", user?.id ?? null],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy access token unavailable");
      return authenticate(accessToken);
    },
    enabled: ready && authenticated,
    // A 4xx means the token itself was rejected — replaying it just triples the
    // failed calls. Only retry the transient (network / 5xx) case.
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: 500,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { isSessionReady: isSuccess, isSessionSettled: isSuccess || isError };
}
