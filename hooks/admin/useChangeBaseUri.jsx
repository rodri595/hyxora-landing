import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to change NFT base URI (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useChangeBaseUri = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/changeBaseUri`,
        {
          baseUri: data.baseUri,
        },
      );
      return response?.data?.data;
    },
  });
};
