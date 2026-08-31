import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import { useMemo } from "react";
import { roleNames } from "@/constants/roles";

export const useGetAllPayments = () => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { data: userInformation } = useGetUserInformation();

  const isAdmin = useMemo(
    () =>
      userInformation?.information?.role?.includes(roleNames?.admin ?? "") ??
      false,
    [userInformation],
  );

  return useQuery({
    queryKey: ["allPayments", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get("/admin/getAllPayments");
      return response?.data?.data?.payments || [];
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
