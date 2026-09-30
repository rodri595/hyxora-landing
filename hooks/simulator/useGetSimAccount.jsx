import { useWeb3 } from "@/context/Web3Provider";
import simulatorClient from "@/utils/simulatorApi";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetch the current simulator account (cash balance + holdings).
 * Auto-provisions the user with $10,000 on first call server-side.
 * @return {Object}
 */
export const useGetSimAccount = () => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready, user } = usePrivy();

  return useQuery({
    queryKey: ["simAccount"],
    queryFn: async () => {
      const response = await simulatorClient.get("/me", {
        headers: {
          "x-user-email": user?.email?.address ?? "",
          "x-user-wallet": smartWalletAddress ?? "",
        },
      });
      return response?.data?.data || null;
    },
    retry: false,
    // Whitelist changes made by an admin must reach open sessions without a
    // reload: poll every minute and refetch when the user returns to the tab.
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    enabled: authenticated && ready,
  });
};
