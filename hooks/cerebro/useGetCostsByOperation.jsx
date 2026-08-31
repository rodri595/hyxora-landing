import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CostByOperationRow } from "./types" */

/**
 * GET /costs/by-operation — cost broken down by operation type, including the
 * matching fee and margin so a single row is enough for a P&L cell.
 *
 * Rows do not match the shape `admin.md` documents — they come back under the names
 * the upstream query produced (`operationType`, `ops`, `totalCostUsd`, `totalFeeUsd`,
 * `netUsd`), alongside the per-op detail the doc omits entirely (`successfulOps`,
 * `avgGasUsed`, `bundlerUsd`, `paymasterUsd`, `minCostUsd`, `maxCostUsd`).
 * `toOperationRow()` in the panel reads both spellings.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<CostByOperationRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetCostsByOperation = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "costsByOperation", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/by-operation", {
        params: cleanParams({ days }),
      });
      return response?.data?.rows ?? [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
