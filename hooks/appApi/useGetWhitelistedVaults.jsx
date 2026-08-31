import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { WhitelistedVault } from "./types" */

/**
 * GET /admin/vaults — the vault whitelist.
 *
 * `defillamaId` is what feeds the APY shown in the app, so it's surfaced in the
 * table: a vault with a wrong or placeholder id shows the wrong yield.
 *
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive] Default true.
 * @param {string} [params.chain] Filter to one chain.
 * @param {string} [params.type] Filter by protocol type.
 * @return {import("@tanstack/react-query").UseQueryResult<WhitelistedVault[]>}
 */
export const useGetWhitelistedVaults = (params = {}) => {
  const { enabled, privyId } = useAppApiAccess();
  const { includeInactive = true, chain, type } = params;

  return useQuery({
    queryKey: ["appApi", "whitelistedVaults", privyId, includeInactive, chain, type],
    queryFn: async () => {
      const response = await appApiClient.get("/admin/vaults", {
        params: {
          ...(includeInactive ? { includeInactive: "true" } : {}),
          ...(chain ? { chain } : {}),
          ...(type ? { type } : {}),
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
