import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** @import { UserTransactionsPage } from "./types" */

/**
 * GET /users/{privyId}/transactions — one user's transaction history, paginated
 * on its own so paging doesn't refetch the whole portfolio.
 *
 * Disabled until `targetPrivyId` is set.
 *
 * @param {string} targetPrivyId The user's Privy DID, e.g. "did:privy:abc123".
 * @param {Object} [params]
 * @param {number} [params.page] 1-based page number. API default 1.
 * @param {number} [params.pageSize] Rows per page. API default 50, max 200.
 * @return {import("@tanstack/react-query").UseQueryResult<UserTransactionsPage>}
 * `data.transactions` plus `page` / `pageSize` / `total`.
 */
export const useGetUserTransactions = (targetPrivyId, params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { page, pageSize } = params;

  return useQuery({
    queryKey: ["cerebro", "userTransactions", privyId, targetPrivyId, page, pageSize],
    queryFn: async () => {
      const response = await cerebroClient.get(
        `/users/${encodeURIComponent(targetPrivyId)}/transactions`,
        { params: cleanParams({ page, pageSize }) }
      );
      return response?.data ?? null;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(targetPrivyId),
  });
};
