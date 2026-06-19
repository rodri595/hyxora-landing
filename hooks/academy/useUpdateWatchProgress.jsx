import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Upsert the caller's watch progress for a tutorial. Called periodically by
 * the player.
 * @return {Object}
 */
export const useUpdateWatchProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put(
        `/academy/tutorials/${data.id}/progress`,
        {
          positionSec: data.positionSec,
          completed: data.completed,
        },
      );
      return response?.data?.data;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["academyTutorial", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
    },
  });
};
