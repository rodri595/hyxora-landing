import { roleNames } from "@/constants/roles";
import { useWeb3 } from "@/context/Web3Provider";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Custom hook to fetch every survey (quiz) response. Admin only.
 * @return {Object} react-query result; `data` is an array of
 * `{ user, answers, completedAt, emailProgress }`.
 */
export const useGetAllSurveyResponses = () => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { data: userInformation } = useGetUserInformation();

  const isAdmin = useMemo(
    () => userInformation?.information?.role?.includes(roleNames?.admin ?? "") ?? false,
    [userInformation]
  );

  return useQuery({
    queryKey: ["allSurveyResponses", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get("/admin/survey/responses");
      return response?.data?.data?.responses || [];
    },
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled:
      Boolean(smartWalletAddress) &&
      authenticated &&
      ready &&
      isSessionReady &&
      isAdmin,
  });
};
