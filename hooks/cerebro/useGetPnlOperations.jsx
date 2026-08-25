import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { PnlOperations, CerebroPlan, CerebroOperation, DayString } from "./types" */

/**
 * GET /pnl/operations — P&L broken down by functionality (swap, bridge, deposit…),
 * with fees, cost, margin, ops count and users count per operation type.
 *
 * `from` and `to` are required by the API; the query stays disabled until both are set.
 *
 * @param {Object} [params]
 * @param {DayString} [params.from] Start date, "YYYY-MM-DD". Required by the API.
 * @param {DayString} [params.to] End date, "YYYY-MM-DD". Required by the API.
 * @param {CerebroPlan} [params.plan] Filter by membership plan.
 * @param {CerebroOperation} [params.op] Filter by a single operation type.
 * @param {number | string} [params.chain] Filter by chain ID, e.g. 137 (Polygon), 8453 (Base).
 * @param {string} [params.user] Filter by Privy ID, e.g. "did:privy:abc123".
 * @return {import("@tanstack/react-query").UseQueryResult<PnlOperations>} `data.rows` per
 * operation plus `data.totals`.
 */
export const useGetPnlOperations = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { from, to, plan, op, chain, user } = params;

  return useQuery({
    queryKey: ["cerebro", "pnlOperations", privyId, from, to, plan, op, chain, user],
    queryFn: async () => {
      const response = await cerebroClient.get("/pnl/operations", {
        params: cleanParams({ from, to, plan, op, chain, user }),
      });
      return response?.data ?? null;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(from) && Boolean(to),
  });
};
