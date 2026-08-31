import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import monitoringClient from "@/utils/monitoringAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /api/monitoring/liquidation — non-stable fee tokens above the alert
 * threshold in each treasury.
 *
 * Longer `staleTime` than the other checks: it costs two Zerion calls, and
 * Zerion bills per request on a monthly quota.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Object>}
 */
export const useGetLiquidation = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["monitoring", "liquidation", privyId],
    queryFn: async () => {
      const response = await monitoringClient.get("/liquidation");
      return response?.data ?? null;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
