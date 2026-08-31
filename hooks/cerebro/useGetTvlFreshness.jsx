import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { TvlFreshness } from "./types" */

/**
 * GET /system/tvl-freshness — how long ago each user's Zerion portfolio was last
 * refreshed, in four mutually exclusive buckets that sum to `total`.
 *
 * The histogram behind `/system/health`'s `tvl.freshness`, which is the max of the
 * same column: one user refreshing moves it, so it says nothing about how many are
 * lagging. `oldest` — the one figure that does — exists only here.
 *
 * Counts only users with at least one Safe: an account that never created a wallet
 * has nothing to refresh and would sit in `never` for good.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<TvlFreshness>}
 */
export const useGetTvlFreshness = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "tvlFreshness", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/system/tvl-freshness");
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
    enabled,
  });
};
