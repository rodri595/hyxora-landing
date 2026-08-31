import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { FeeConfig } from "./types" */

/**
 * GET /admin/fees — the fee *schema*: what we charge, per plan × operation.
 *
 * Not to be confused with Cerebro's `/fees/*`, which report revenue already
 * collected. Different data; only the revenue side lives in admin.md.
 *
 * Distinct too from `hooks/admin/useGetFeeSchema`, which asks api.hyxora.com for
 * the same-named path with a session JWT and guessed field names. This one is
 * the host the ported dashboard actually read, and the shape is verified.
 *
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive] Default true — the matrix greys inactive
 * rows out rather than hiding them, so a disabled fee is visibly disabled.
 * @return {import("@tanstack/react-query").UseQueryResult<FeeConfig[]>}
 */
export const useGetFeeSchema = (params = {}) => {
  const { enabled, privyId } = useAppApiAccess();
  const { includeInactive = true } = params;

  return useQuery({
    queryKey: ["appApi", "feeSchema", privyId, includeInactive],
    queryFn: async () => {
      const response = await appApiClient.get("/admin/fees", {
        params: includeInactive ? { includeInactive: "true" } : undefined,
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
