import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { NftFees } from "./types" */

/**
 * GET /fees/nft — Founder NFT primary sales revenue. Excluded from
 * `useGetFeesTotals`, which reports user fees only.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Window for the `recent` block. API default 30, max 365.
 * @return {import("@tanstack/react-query").UseQueryResult<NftFees>} `data.recent` for the
 * window, `data.allTime` for lifetime.
 */
export const useGetNftFees = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days } = params;

  return useQuery({
    queryKey: ["cerebro", "nftFees", privyId, days],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/nft", {
        params: cleanParams({ days }),
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
