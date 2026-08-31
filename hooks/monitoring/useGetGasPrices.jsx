import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import monitoringClient from "@/utils/monitoringAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /api/monitoring/gas-prices — live `eth_gasPrice` per chain.
 *
 * Pairs with `useGetGasLimits` (app-api) to make the «current vs ceiling»
 * table. Kept separate so live prices still render when the ceilings 401.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Object>}
 */
export const useGetGasPrices = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["monitoring", "gasPrices", privyId],
    queryFn: async () => {
      const response = await monitoringClient.get("/gas-prices");
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
