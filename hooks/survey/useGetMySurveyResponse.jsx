import { useWeb3 } from "@/context/Web3Provider";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch the current user's survey (quiz) submission.
 * Resolves to `null` when the user hasn't answered yet — the backend replies
 * 404 for that case, which is a valid state and not an error.
 * @return {Object} react-query result; `data` is
 * `{ answers, completedAt, emailProgress }` or `null`.
 */
export const useGetMySurveyResponse = () => {
  const { smartWalletAddress } = useWeb3();
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["mySurveyResponse", smartWalletAddress],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/survey/my-response");
        return response?.data?.data || null;
      } catch (error) {
        if (error?.response?.status === 404) return null;
        throw error;
      }
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,

    enabled: Boolean(smartWalletAddress) && authenticated && ready,
  });
};
