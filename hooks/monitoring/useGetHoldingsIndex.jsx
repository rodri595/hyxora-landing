import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import monitoringClient from "@/utils/monitoringAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /api/monitoring/holdings-index — every user with a balance and their positions.
 *
 * The route rebuilds, by fanning out over Cerebro, the join the old dashboard did
 * in SQL. One request answers both the asset search and the per-token holders
 * rows, so neither pays for its own sweep.
 *
 * `staleTime` matches the route's own 5-minute cache, which in turn matches
 * Cerebro's — refetching sooner would only re-serve the same build.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Object>} `holders`, plus
 * `scannedUsers` / `totalUsers` / `truncated` / `failures` describing how complete
 * the sweep was, and `builtAt`.
 */
export const useGetHoldingsIndex = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["monitoring", "holdingsIndex", privyId],
    queryFn: async () => {
      const response = await monitoringClient.get("/holdings-index");
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
