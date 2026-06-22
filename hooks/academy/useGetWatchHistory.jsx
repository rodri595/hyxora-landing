import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Fetch all watch-progress entries for the current user (for a
 * "Continue watching" rail / profile).
 * @return {Object}
 */
export const useGetWatchHistory = () => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["watchHistory", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get("/academy/watch-history");
      return response?.data?.data?.items || [];
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled: Boolean(smartWalletAddress) && authenticated && ready,
  });
};
