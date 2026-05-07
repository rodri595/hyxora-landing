import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to initialize token count (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useInitTokenCount = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/initTokenCount`,
      );
      return response?.data?.data;
    },
  });
};
