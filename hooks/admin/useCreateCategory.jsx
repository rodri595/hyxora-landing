import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/categories", {
        label: data.label,
        description: data.description,
        accent: data.accent,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
  });
};
