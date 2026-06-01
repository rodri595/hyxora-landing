import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEditPoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/poll/edit", {
        number: data.number,
        title: data.title,
        description: data.description,
        options: data.options,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        fileId: data.fileId,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
    },
  });
};
