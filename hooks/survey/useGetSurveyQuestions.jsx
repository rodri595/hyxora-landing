import apiClient from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch the classification survey (quiz) questions.
 * Public endpoint — no wallet / Privy gating, anonymous visitors can read it.
 * @return {Object} react-query result; `data` is an array of
 * `{ questionNumber, questionText, options }`.
 */
export const useGetSurveyQuestions = () => {
  return useQuery({
    queryKey: ["surveyQuestions"],
    queryFn: async () => {
      const response = await apiClient.get("/survey/questions");
      return response?.data?.data?.surveyQuestions || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
  });
};
