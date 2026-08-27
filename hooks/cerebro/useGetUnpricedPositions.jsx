import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { UnpricedPositions } from "./types" */

/**
 * GET /system/unpriced-positions — the assets Zerion returned but could not price
 * on the last refresh, grouped by symbol with the number of users each one costs.
 *
 * Replaces reading `/system/health`'s `system.tvlErrors`, which admin.md documents
 * only as `[]`: with no row shape to read, a real failure would have rendered as
 * raw JSON.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<UnpricedPositions>}
 */
export const useGetUnpricedPositions = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "unpricedPositions", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/system/unpriced-positions");
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
