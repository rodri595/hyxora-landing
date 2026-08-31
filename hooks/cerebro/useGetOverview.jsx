import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { CerebroOverview, CerebroPlan } from "./types" */

/**
 * GET /overview — KPI summary cards: total users, registered users, total ops,
 * new users (30d), median TVL, top vault, top asset.
 *
 * @param {Object} [params]
 * @param {CerebroPlan} [params.plan] Restrict every KPI to a single membership plan.
 * @return {import("@tanstack/react-query").UseQueryResult<CerebroOverview>}
 */
export const useGetOverview = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { plan } = params;

  return useQuery({
    queryKey: ["cerebro", "overview", privyId, plan],
    queryFn: async () => {
      const response = await cerebroClient.get("/overview", {
        params: cleanParams({ plan }),
      });
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
