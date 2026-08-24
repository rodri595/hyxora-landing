import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import monitoringClient from "@/utils/monitoringAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /api/monitoring/services — liveness of API and App, staging and prod.
 *
 * Short `staleTime`: this is the one panel where a stale answer is actively
 * misleading, since it exists to tell you whether something is down right now.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Object>}
 */
export const useGetServiceHealth = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["monitoring", "services", privyId],
    queryFn: async () => {
      const response = await monitoringClient.get("/services");
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
