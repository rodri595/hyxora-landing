import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { FeeByOperationRow } from "./types" */

/**
 * GET /fees/by-operation — fee revenue broken down by operation type.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<FeeByOperationRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetFeesByOperation = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "feesByOperation", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/by-operation", {
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
