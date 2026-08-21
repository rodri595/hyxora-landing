import { useAuth } from "@/hooks/useAuth";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Exchanges the Privy access token for a backend session as soon as Privy is
 * authenticated. Never infers session state from `document.cookie`: the session
 * cookie is HttpOnly in production and a logged-out `session=` (empty value)
 * reads as "present". Every authenticated query must wait on `isSessionReady`.
 * @return {{ isSessionReady: boolean }}
 */
export function useSessionSync() {
  const { getAccessToken, authenticated, ready, user } = usePrivy();
  const { authenticate } = useAuth();

  const { isSuccess } = useQuery({
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

  return { isSessionReady: isSuccess };
}
