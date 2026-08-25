import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { PnlDailyPoint, CerebroPlan, CerebroOperation, DayString } from "./types" */

/**
 * GET /pnl/daily — fees / cost / margin time series, ready to feed a chart.
 *
 * `from` and `to` are required by the API; the query stays disabled until both are set.
 *
 * @param {Object} [params]
 * @param {DayString} [params.from] Start date, "YYYY-MM-DD". Required by the API.
 * @param {DayString} [params.to] End date, "YYYY-MM-DD". Required by the API.
 * @param {CerebroPlan} [params.plan] Filter by membership plan.
 * @param {CerebroOperation} [params.op] Filter by a single operation type.
 * @param {number | string} [params.chain] Filter by chain ID.
 * @param {string} [params.user] Filter by Privy ID.
 * @param {"day" | "week" | "month"} [params.bucket] Aggregation period. Defaults to "day".
 * @return {import("@tanstack/react-query").UseQueryResult<PnlDailyPoint[]>} `data` is the
 * unwrapped `series` array.
 */
export const useGetPnlDaily = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { from, to, plan, op, chain, user, bucket } = params;

  return useQuery({
    queryKey: ["cerebro", "pnlDaily", privyId, from, to, plan, op, chain, user, bucket],
    queryFn: async () => {
      const response = await cerebroClient.get("/pnl/daily", {
        params: cleanParams({ from, to, plan, op, chain, user, bucket }),
      });
      return response?.data?.series ?? [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(from) && Boolean(to),
  });
};
