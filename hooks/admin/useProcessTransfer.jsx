import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to process NFT transfer (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useProcessTransfer = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/process-transfer`,
        {
          paymentId: data.paymentId,
        },
      );
      return response?.data?.data;
    },
  });
};
