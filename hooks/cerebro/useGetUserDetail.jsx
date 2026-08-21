import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UserDetail } from "./types" */

/**
 * GET /users/{privyId} — one user's full picture: positions, TVL, margin, a first
 * page of transactions, ramp orders and the free-vs-paid ops split.
 *
 * Disabled until `targetPrivyId` is set, so it is safe to call from a detail panel
 * before a row is selected.
 *
 * The `page` / `pageSize` params only paginate the embedded `transactions` block.
 * For a standalone transactions table use `useGetUserTransactions` instead — it
 * avoids refetching the portfolio on every page change.
 *
 * @param {string} targetPrivyId The user's Privy DID, e.g. "did:privy:abc123".
 * @param {Object} [params]
 * @param {number} [params.page] Transactions page. API default 1.
 * @param {number} [params.pageSize] Transactions per page. API default 50, max 200.
 * @return {import("@tanstack/react-query").UseQueryResult<UserDetail>}
 */
export const useGetUserDetail = (targetPrivyId, params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { page, pageSize } = params;

  return useQuery({
    queryKey: ["cerebro", "userDetail", privyId, targetPrivyId, page, pageSize],
    queryFn: async () => {
      const response = await cerebroClient.get(`/users/${encodeURIComponent(targetPrivyId)}`, {
        params: cleanParams({ page, pageSize }),
      });
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: enabled && Boolean(targetPrivyId),
  });
};
