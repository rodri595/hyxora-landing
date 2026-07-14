import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import simulatorClient from "@/utils/simulatorApi";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

export const useGetAllSimTransactions = ({ cursor, userId } = {}) => {
  const { authenticated, ready } = usePrivy();
  const { data: account } = useGetSimAccount();

  const isAdmin = account?.user?.role === "admin";

  return useQuery({
    queryKey: ["simAllTransactions", cursor ?? null, userId ?? null],
    queryFn: async () => {
      const params = {};
      if (cursor) params.cursor = cursor;
      if (userId) params.userId = userId;
      const response = await simulatorClient.get("/admin/transactions", { params });
      return response?.data?.data || { transactions: [], nextCursor: null };
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: authenticated && ready && isAdmin,
  });
};
