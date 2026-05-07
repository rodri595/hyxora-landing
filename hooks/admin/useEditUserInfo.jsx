import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to edit user information (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useEditUserInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/editUserInfo`,
        {
          userId: data.userId,
          phoneNumber: data.phoneNumber,
        },
      );
      return response?.data?.data;
    },
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
