import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.delete(`/admin/categories/${data.id}`);
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
      // Deleting a category uncategorizes its tutorials — refresh the admin list
      // and the member-facing academy views too.
      queryClient.invalidateQueries({ queryKey: ["allTutorials"] });
      queryClient.invalidateQueries({ queryKey: ["academyTutorials"] });
      queryClient.invalidateQueries({ queryKey: ["academyTutorial"] });
    },
  });
};
