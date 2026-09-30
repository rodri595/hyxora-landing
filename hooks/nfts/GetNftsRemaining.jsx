import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "@/context/Web3Provider";

export const GetNftsRemaining = (props) => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["nftsRemaining", smartWalletAddress],
    refetchInterval: props?.refetchInterval,
    queryFn: async () => {
      const response = await apiClient.get("/nft-remaining");
      return response?.data;
    },
    retry: false,
    enabled:
      !!smartWalletAddress &&
      authenticated &&
      ready &&
      isSessionReady &&
      (props?.enabled ?? true),
  });
};
