import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
/**
 * Custom hook to close a poll (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useClosePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/poll/${data.number}/close`,
      );
      return response?.data?.data;
    },
    onSuccess: () => {
      // Invalidate polls query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
    },
  });
};
