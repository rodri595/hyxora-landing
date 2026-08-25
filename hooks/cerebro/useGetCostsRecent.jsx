import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** @import { RecentSponsoredOpsPage } from "./types" */

/**
 * GET /costs/recent — the full sponsored-operation feed, EVM and Solana interleaved
 * by time and paginated on the server.
 *
 * Not the same thing as `/costs/expensive`, which is a review tool: it tops out at
 * 200 rows above a USD threshold and reports no total. This one walks every op and
 * carries the two cost figures apart — `cost_usd` is the gas on chain,
 * `bundler_cost_usd` what Pimlico invoices with its markup — which is what makes
 * the numbers reconcilable against dashboard.pimlico.io.
 *
 * Rows arrive snake_cased, unlike the rest of the API; `toSponsoredOpRow()` in the
 * panel normalises them.
 *
 * @param {Object} [params]
 * @param {number} [params.page] 1-based page number. API default 1.
 * @param {number} [params.pageSize] Rows per page. API default 10, max 100.
 * @return {import("@tanstack/react-query").UseQueryResult<RecentSponsoredOpsPage>} `data.rows`
 * plus `page` / `pageSize` / `total` for the pager.
 */
export const useGetCostsRecent = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { page, pageSize } = params;

  return useQuery({
    queryKey: ["cerebro", "costsRecent", privyId, page, pageSize],
    queryFn: async () => {
      const response = await cerebroClient.get("/costs/recent", {
        params: cleanParams({ page, pageSize }),
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
