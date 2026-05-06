import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/hooks/useAuth";
export function useSessionSync() {
    const { getAccessToken } = usePrivy();
    const { authenticate } = useAuth();

    const cookies = typeof document !== "undefined" ? document.cookie : "";
    const hasSession = cookies.split(";").some((c) => c.trim().startsWith("session="));
    const hasPrivyToken = cookies.split(";").some((c) => c.trim().startsWith("privy-token="));

    return useQuery({
        queryKey: ["session-sync"],
        queryFn: async () => {
            const accessToken = await getAccessToken();
            return authenticate(accessToken);
        },
        enabled: !hasSession && hasPrivyToken,
        retry: false,
        staleTime: Infinity,
    });
}
