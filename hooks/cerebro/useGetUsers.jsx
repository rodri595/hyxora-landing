import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/** @import { CerebroUsersPage } from "./types" */

/**
 * GET /users — the paginated user table, with TVL, cost, fees, net and plan per row.
 *
 * Keeps the previous page on screen while the next one loads, so paging and
 * sorting don't flash an empty table.
 *
 * @param {Object} [params]
 * @param {number} [params.page] 1-based page number. API default 1.
 * @param {number} [params.pageSize] Rows per page. API default 50, max 200.
 * @param {"created" | "tvl" | "cost" | "fees" | "net" | "plan"} [params.sort] Sort column.
 * API default "created".
 * @param {"asc" | "desc"} [params.dir] Sort direction. API default "desc".
 * @param {string} [params.search] Free-text filter over email / username.
 * @param {"active" | "inactive"} [params.scope] Restrict to active or inactive users.
 * @return {import("@tanstack/react-query").UseQueryResult<CerebroUsersPage>} `data.users`
 * plus `page` / `pageSize` / `total` for the pager.
 */
export const useGetUsers = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { page, pageSize, sort, dir, search, scope } = params;

  return useQuery({
    queryKey: ["cerebro", "users", privyId, page, pageSize, sort, dir, search, scope],
    queryFn: async () => {
      const response = await cerebroClient.get("/users", {
        params: cleanParams({ page, pageSize, sort, dir, search, scope }),
      });
      return response?.data ?? null;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
