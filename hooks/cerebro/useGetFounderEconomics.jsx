import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { FounderEconomics } from "./types" */

/**
 * GET /founder-economics — what the Founder NFT programme costs and returns: holders
 * on chain versus synced in our database, revenue attributed to them, the gas we
 * subsidise for them, and the net per founder.
 *
 * The same block is embedded in `/overview/extended`; react-query keys them apart, so
 * a page that shows both pays for two requests. Prefer this one where the panel is
 * only about founders.
 *
 * Revenue here is an estimate the backend derives from on-chain activity — it ships a
 * `note` saying so, which the panel renders rather than hides.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<FounderEconomics>}
 */
export const useGetFounderEconomics = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "founderEconomics", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/founder-economics");
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
