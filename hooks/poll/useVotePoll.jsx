import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
/**
 * Custom hook to vote on a poll
 * @param {Object}
 * @return {Object}
 */
export const useVotePoll = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/poll/vote`,
        {
          pollNumber: data.pollNumber,
          option: data.option,
          message: data.message,
        },
      );
      return response?.data?.data;
    },
  });
};
