import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import monitoringClient from "@/utils/monitoringAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /api/monitoring/solana-funding — fee-payer SOL balance against its floor.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Object>} `sol`, `minSol`,
 * `ratio`, `low`, and `valueUsd` (null when pricing was unavailable).
 */
export const useGetSolanaFunding = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["monitoring", "solanaFunding", privyId],
    queryFn: async () => {
      const response = await monitoringClient.get("/solana-funding");
      return response?.data ?? null;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
