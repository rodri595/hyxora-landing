import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Custom hook to fetch user information based on their smart wallet address.
 * @param {Object}
 * @return {Object}
 */
export const useGetUserInformation = (props) => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["userInformation", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get("/user/myInformation");
      return response?.data?.data || null;
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: 2,
    enabled:
      typeof props === "undefined"
        ? true
        : props.enabled &&
          Boolean(smartWalletAddress) &&
          authenticated &&
          ready,
  });
};
