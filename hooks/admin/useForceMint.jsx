import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to force mint NFT (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useForceMint = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/force-mint`,
        {
          paymentId: data.paymentId,
        },
      );
      return response?.data?.data;
    },
  });
};
