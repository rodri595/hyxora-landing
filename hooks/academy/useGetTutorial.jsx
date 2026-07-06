import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Fetch a single tutorial (player page) by its slug/id, along with the
 * caller's watch progress (null if never watched).
 * @param {string} slug - The tutorial id (e.g. "t-101")
 * @return {Object}
 */
export const useGetTutorial = (slug) => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["academyTutorial", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/academy/tutorials/${slug}`);
      return response?.data?.data || null;
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled:
      Boolean(slug) && Boolean(smartWalletAddress) && authenticated && ready,
  });
};
