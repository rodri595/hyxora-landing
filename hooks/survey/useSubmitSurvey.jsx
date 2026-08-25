import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to submit the survey (quiz) answers. Session required.
 * Answers are keyed by question number as a string, and each value must be the
 * exact option text returned by `useGetSurveyQuestions`.
 * @return {Object} react-query mutation; `mutateAsync` takes the answers object
 * (`{ "1": "...", "2": "..." }`) and resolves to `{ message, emailSchedule }`.
 */
export const useSubmitSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers) => {
      const response = await apiClient.post("/survey/submit", { answers });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySurveyResponse"] });
    },
  });
};
