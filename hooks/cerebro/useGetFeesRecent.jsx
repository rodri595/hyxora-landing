import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** @import { RecentFeesPage } from "./types" */

/**
 * GET /fees/recent — individual treasury inflows, EVM and Solana, newest first.
 *
 * Replaces the stand-in this panel used to run on: `/fees/diagnostics` is a tagging
 * debug endpoint, capped at 100 rows with no total, no payer and no token. This one
 * paginates over the lot and carries `fromAddress` and `tokenSymbol`.
 *
 * @param {Object} [params]
 * @param {number} [params.page] 1-based page number. API default 1.
 * @param {number} [params.pageSize] Rows per page. API default 10, max 100.
 * @param {boolean} [params.includeNonWhitelisted] Count tokens outside the whitelist.
 * API default false, i.e. the same filter the revenue totals use.
 * @return {import("@tanstack/react-query").UseQueryResult<RecentFeesPage>} `data.rows`
 * plus `page` / `pageSize` / `total` for the pager.
 */
export const useGetFeesRecent = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { page, pageSize, includeNonWhitelisted } = params;

  return useQuery({
    queryKey: ["cerebro", "feesRecent", privyId, page, pageSize, includeNonWhitelisted],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/recent", {
        params: cleanParams({ page, pageSize, includeNonWhitelisted }),
      });
      return response?.data ?? null;
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
