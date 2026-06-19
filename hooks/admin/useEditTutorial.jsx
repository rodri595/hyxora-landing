import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditTutorial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { id, ...fields } = data;
      const response = await apiClient.patch(`/admin/tutorials/${id}`, fields);
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
