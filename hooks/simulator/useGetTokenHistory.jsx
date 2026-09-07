import simulatorClient from "@/utils/simulatorApi";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Price history for one catalogue token, for the card sparklines and the detail
 * chart.
 *
 * It goes through `/api/simulator/token-history` rather than app-api directly
 * because `/token/historical` is not a public endpoint: only the bot token
 * unlocks it, and that token is server-only. The route spends it after checking
 * the caller's Privy session — see its own header for why it is a keyhole.
 *
 * @param {Object} params
 * @param {string} params.address Token address, as the catalogue spells it.
 * @param {number | string} params.chainId
 * @param {"HOUR"|"DAY"|"WEEK"|"MONTH"|"3MONTHS"|"6MONTHS"|"YEAR"|"5YEARS"|"MAX"} [params.timeFrame]
 * @param {boolean} [params.enabled] False keeps an off-screen card from fetching.
 * @return {Object} react-query result whose data is `{ timestamp, value }[]`.
 */
export const useGetTokenHistory = ({ address, chainId, timeFrame = "WEEK", enabled = true }) => {
  const { authenticated, ready } = usePrivy();

  return useQuery({
    queryKey: ["simTokenHistory", address, chainId, timeFrame],
    queryFn: async () => {
      const response = await simulatorClient.get("/token-history", {
        params: { address, chainId, timeFrame },
      });
      return response?.data?.data?.history ?? [];
    },
    // Mirrors the route's own cache window — refetching sooner only re-reads
    // what it is holding.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: Boolean(enabled && address && chainId && authenticated && ready),
  });
};
