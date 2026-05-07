import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to fetch all users from admin
 * @param {Object}
 * @return {Object}
 */
export const useSetRole = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/admin/setUserRole`,
        {
          email: data.email,
          role: data.role,
        },
      );
      return response?.data?.data;
    },
  });
};
