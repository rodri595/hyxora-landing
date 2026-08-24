import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { WhitelistedToken } from "./types" */

/**
 * GET /admin/tokens — the token whitelist.
 *
 * Rows identify by chain + address, not symbol: the same symbol repeats across
 * chains (USD exists on Base, Arbitrum, Polygon and BSC).
 *
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive] Default true.
 * @param {string} [params.chainName] Filter to one chain. Omit for all.
 * @return {import("@tanstack/react-query").UseQueryResult<WhitelistedToken[]>}
 */
export const useGetWhitelistedTokens = (params = {}) => {
  const { enabled, privyId } = useAppApiAccess();
  const { includeInactive = true, chainName } = params;

  return useQuery({
    queryKey: ["appApi", "whitelistedTokens", privyId, includeInactive, chainName],
    queryFn: async () => {
      const response = await appApiClient.get("/admin/tokens", {
        params: {
          ...(includeInactive ? { includeInactive: "true" } : {}),
          ...(chainName ? { chainName } : {}),
        },
      });
      return response?.data?.data ?? [];
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
