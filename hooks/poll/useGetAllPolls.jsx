import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Custom hook to fetch all polls from user
 * @param {Object}
 * @return {Object}
 */
export const useGetAllPolls = (props) => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();
  return useQuery({
    queryKey: ["allPolls"],
    queryFn: async () => {
      const response = await apiClient.get(`/poll/all`);
      return response?.data?.data?.polls || [];
    },
    staleTime: 1 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled:
      typeof props === "undefined"
        ? true
        : props?.enabled &&
          Boolean(smartWalletAddress && authenticated && ready),
  });
};
