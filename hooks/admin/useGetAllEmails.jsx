import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch all emails from admin
 * @param {Object} params - Query parameters
 * @param {string} params.to - Filter by recipient email
 * @return {Object}
 */
export const useGetAllEmails = (params = {}) => {
  const { smartWalletAddress } = useWeb3();
  const { to } = params;

  return useQuery({
    queryKey: ["allEmails", smartWalletAddress],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (to) queryParams.append("to", to);

      const url = `${import.meta.env.VITE_HYXORA_API}/admin/listEmails${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);
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
