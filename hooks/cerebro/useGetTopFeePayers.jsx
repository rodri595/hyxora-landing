import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { TopFeePayerRow } from "./types" */

/**
 * GET /users/top-fee-payers — the users who paid the most into the treasury in the
 * window, largest first.
 *
 * `/users?sort=fees` orders the same figure but one page at a time; this returns the
 * head of the list directly, which is what a concentration read needs.
 *
 * @param {Object} [params]
 * @param {number} [params.limit] Max rows. API default 20, max 100.
 * @param {number} [params.days] Window length. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<TopFeePayerRow[]>} `data` is
 * the unwrapped `rows` array.
 */
export const useGetTopFeePayers = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { limit, days } = params;

  return useQuery({
    queryKey: ["cerebro", "topFeePayers", privyId, limit, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/users/top-fee-payers", {
        params: cleanParams({ limit, days }),
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
