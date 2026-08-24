import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { Membership } from "./types" */

/**
 * GET /membership — the plan tiers, with price, currency and Stripe product.
 *
 * Public on app-api (no bot token needed), but routed through `/api/app-api`
 * like everything else so the admin gate and the single client both still apply.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Membership[]>}
 */
export const useGetMemberships = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["appApi", "memberships", privyId],
    queryFn: async () => {
      const response = await appApiClient.get("/membership");
      return response?.data?.data ?? [];
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
