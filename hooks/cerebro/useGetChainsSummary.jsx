import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { ChainsSummary } from "./types" */

/**
 * GET /chains — one row per EVM chain with TVL, 30-day ops, cost, fees, margin and
 * both indexer cursors, plus a separate `solana` block.
 *
 * The «Redes» table used to assemble this itself from four endpoints
 * (`/costs/by-chain`, `/fees/treasury/by-token`, `/holdings`, `/system/health`),
 * which is why its TVL column only covered the top 100 holdings rows. This is the
 * same table computed upstream, over everything.
 *
 * Takes no parameters — the window is fixed at 30 days by the endpoint.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<ChainsSummary>} `data.chains`
 * and `data.solana`.
 */
export const useGetChainsSummary = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "chainsSummary", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/chains");
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
