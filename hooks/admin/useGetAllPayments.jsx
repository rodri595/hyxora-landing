import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch all payments from admin
 * @param {Object}
 * @return {Object}
 */
export const useGetAllPayments = () => {
  const { smartWalletAddress } = useWeb3();

  return useQuery({
    queryKey: ["allPayments", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/admin/getAllPayments`,
      );
      return response?.data?.data;
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: Boolean(smartWalletAddress),
  });
};
