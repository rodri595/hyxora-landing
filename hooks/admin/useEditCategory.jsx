import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { id, ...fields } = data;
      const response = await apiClient.patch(`/admin/categories/${id}`, fields);
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
      // Tutorials embed enriched category data, so refresh them too — both the
      // admin list and the member-facing academy views.
      queryClient.invalidateQueries({ queryKey: ["allTutorials"] });
      queryClient.invalidateQueries({ queryKey: ["academyTutorials"] });
      queryClient.invalidateQueries({ queryKey: ["academyTutorial"] });
    },
  });
};
