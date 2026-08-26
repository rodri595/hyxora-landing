import apiClient from "@/utils/axios";
import { buildTutorialTitle } from "@/utils/tutorialTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditTutorial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { id, order, titleMeta, ...fields } = data;
      // `order` (and any future extra) is packed into the title rather than
      // sent as its own field — the backend would reject it. Only repack when
      // the caller actually sent a title; a partial PATCH stays partial.
      if (fields.title !== undefined) {
        fields.title = buildTutorialTitle({
          ...(titleMeta ?? {}),
          title: fields.title,
          order,
        });
      }
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
