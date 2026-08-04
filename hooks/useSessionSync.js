import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/hooks/useAuth";

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
    retry: 2,
    retryDelay: 500,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { isSessionReady: isSuccess };
}
