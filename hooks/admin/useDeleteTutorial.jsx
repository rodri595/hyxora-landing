import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteTutorial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.delete(`/admin/tutorials/${data.id}`);
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTutorials"] });
      // Keep the member-facing academy list + player pages in sync too.
      queryClient.invalidateQueries({ queryKey: ["academyTutorials"] });
      queryClient.invalidateQueries({ queryKey: ["academyTutorial"] });
    },
  });
};
