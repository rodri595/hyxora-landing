import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /admin/gas-limits — the configured gas ceiling per chain.
 *
 * Returns `{ chain, maxGasGwei }` only; there is no "current price" here and no
 * flag for whether a ceiling is a default or a hand-set override. The live
 * prices come from `useGetGasPrices`, and the panel joins the two on `chain`.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<Array>}
 */
export const useGetGasLimits = () => {
  const { enabled, privyId } = useAppApiAccess();

  return useQuery({
    queryKey: ["appApi", "gasLimits", privyId],
    queryFn: async () => {
      const response = await appApiClient.get("/admin/gas-limits");
      return response?.data?.data ?? [];
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
