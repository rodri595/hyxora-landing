import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { PnlMembershipRow, DayString } from "./types" */

/**
 * GET /pnl/membership — per-plan stats: user count, fees, cost, margin and the
 * plan's top holdings.
 *
 * `from` and `to` are required by the API; the query stays disabled until both are set.
 *
 * @param {Object} [params]
 * @param {DayString} [params.from] Start date, "YYYY-MM-DD". Required by the API.
 * @param {DayString} [params.to] End date, "YYYY-MM-DD". Required by the API.
 * @return {import("@tanstack/react-query").UseQueryResult<PnlMembershipRow[]>} `data` is the
 * unwrapped `report` array, one row per plan.
 */
export const useGetPnlMembership = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { from, to } = params;

  return useQuery({
    queryKey: ["cerebro", "pnlMembership", privyId, from, to],
    queryFn: async () => {
      const response = await cerebroClient.get("/pnl/membership", {
        params: cleanParams({ from, to }),
      });
      return response?.data?.report ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(from) && Boolean(to),
  });
};
