import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
/**
 * Custom hook to vote on a poll
 * @param {Object}
 * @return {Object}
 */
export const useVotePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/poll/vote", {
        pollNumber: data.pollNumber,
        option: data.option,
        message: data.message,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPolls"] });
    },
  });
};
