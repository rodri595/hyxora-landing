import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to generate NFT image (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useGenNftImage = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/gen-nft-image`,
        {
          paymentId: data.paymentId,
        },
      );
      return response?.data?.data;
    },
  });
};
