import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { SystemHealth } from "./types" */

/**
 * GET /system/health — indexer cursors, TVL freshness, data freshness and backend
 * cache status. The one endpoint here that is worth polling: it has a 1-minute
 * cache and refetches on focus.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<SystemHealth>}
 */
export const useGetSystemHealth = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "systemHealth", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/system/health");
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
    enabled,
  });
};
