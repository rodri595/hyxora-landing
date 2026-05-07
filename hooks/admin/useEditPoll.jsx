import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
/**
 * Custom hook to edit an existing poll (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useEditPoll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/poll/edit`,
        {
          number: data.number,
          title: data.title,
          description: data.description,
          options: data.options,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          fileId: data.fileId,
        },
      );
      return response?.data?.data;
    },
    onSuccess: () => {
      // Invalidate polls query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
    },
  });
};
