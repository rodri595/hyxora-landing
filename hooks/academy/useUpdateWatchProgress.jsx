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
    onSuccess: () => {
      // Only refresh the "continue watching" history — that query is inactive
      // on the player page, so this just marks it stale for the next visit.
      // We intentionally do NOT invalidate ["academyTutorial", id]: the player
      // pings every few seconds during playback and refetching the tutorial it
      // is currently rendering would be wasteful churn.
      queryClient.invalidateQueries({ queryKey: ["watchHistory"] });
    },
  });
};
