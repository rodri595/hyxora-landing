import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { ExpensiveOperationRow } from "./types" */

/**
 * GET /costs/expensive — individual sponsored operations that cost more than a
 * USD threshold, for manual review. Each row carries the user who triggered it.
 *
 * @param {Object} [params]
 * @param {number} [params.threshold] USD floor. API default 0.50.
 * @param {number} [params.limit] Max rows. API default 50, max 200.
 * @return {import("@tanstack/react-query").UseQueryResult<ExpensiveOperationRow[]>} `data` is
 * the unwrapped `rows` array.
 */
export const useGetExpensiveOperations = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { threshold, limit } = params;

  return useQuery({
    queryKey: ["cerebro", "expensiveOperations", privyId, threshold, limit],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/expensive", {
        params: cleanParams({ threshold, limit }),
      });
      return response?.data?.rows ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
