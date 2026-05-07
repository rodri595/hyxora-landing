import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
/**
 * Custom hook to get poll results
 * @param {number} pollNumber - The poll number to fetch results for
 * @return {Object}
 */
export const useGetPollResults = (pollNumber) => {
  const { smartWalletAddress } = useWeb3();

  return useQuery({
    queryKey: ["getPollResults", pollNumber, smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/poll/${pollNumber}/results`,
      );
      return response?.data?.data || {};
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled: Boolean(smartWalletAddress && pollNumber),
  });
};
