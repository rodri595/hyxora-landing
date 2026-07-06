import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Fetch the visible tutorials for the academy page, grouped with their
 * categories and the featured tutorial.
 * @param {Object} params - { categoryId, q, sort }
 * @return {Object}
 */
export const useGetTutorials = (params = {}) => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { categoryId, q, sort } = params;

  return useQuery({
    queryKey: ["academyTutorials", categoryId, q, sort],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (categoryId) queryParams.append("categoryId", categoryId);
      if (q) queryParams.append("q", q);
      if (sort) queryParams.append("sort", sort);
      const url = `/academy/tutorials${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);
      return response?.data?.data || null;
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    enabled: Boolean(smartWalletAddress) && authenticated && ready,
  });
};
