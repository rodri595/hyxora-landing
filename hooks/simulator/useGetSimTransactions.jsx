import simulatorClient from "@/utils/simulatorApi";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetch the current simulator transaction history.
 * @param {string} [cursor] Optional pagination cursor for a later page.
 * @return {Object}
 */
export const useGetSimTransactions = (cursor) => {
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["simTransactions"],
    queryFn: async () => {
      const response = await simulatorClient.get("/transactions", {
        params: cursor ? { cursor } : undefined,
      });
      return response?.data?.data || { transactions: [], nextCursor: null };
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: authenticated && ready,
  });
};
