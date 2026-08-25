import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "@/context/Web3Provider";

export const GetMyPayments = (props) => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  return useQuery({
    queryKey: ["myPayments", smartWalletAddress],
    refetchInterval: props?.refetchInterval,
    queryFn: async () => {
      const response = await apiClient.get("/payment/list");
      return response?.data?.data || [];
    },
    enabled: !!smartWalletAddress && authenticated && ready && isSessionReady,
  });
};
