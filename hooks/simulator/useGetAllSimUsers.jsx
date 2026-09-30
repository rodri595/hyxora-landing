import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import simulatorClient from "@/utils/simulatorApi";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

export const useGetAllSimUsers = () => {
  const { authenticated, ready } = usePrivy();
  const { data: account } = useGetSimAccount();

  const isAdmin = account?.user?.role === "admin";

  return useQuery({
    queryKey: ["simAllUsers"],
    queryFn: async () => {
      const response = await simulatorClient.get("/admin/users");
      return response?.data?.data?.users || [];
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: authenticated && ready && isAdmin,
  });
};
