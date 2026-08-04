import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import { useMemo } from "react";
import { roleNames } from "@/constants/roles";

export const useGetAllEmails = (params = {}) => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { data: userInformation } = useGetUserInformation();
  const { to } = params;

  const isAdmin = useMemo(
    () =>
      userInformation?.information?.role?.includes(roleNames?.admin ?? "") ??
      false,
    [userInformation],
  );

  return useQuery({
    queryKey: ["allEmails", smartWalletAddress, to],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (to) queryParams.append("to", to);
      const url = `/admin/listEmails${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);
      return response?.data?.data;
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
