import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTutorial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/tutorials", {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        url: data.url,
        coverId: data.coverId,
        durationSec: data.durationSec,
        isPublic: data.isPublic,
        visibility: data.visibility,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTutorials"] });
      // Keep the member-facing academy list in sync too.
      queryClient.invalidateQueries({ queryKey: ["academyTutorials"] });
    },
  });
};
