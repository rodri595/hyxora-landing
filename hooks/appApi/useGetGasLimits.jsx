import { useAppApiAccess } from "@/hooks/appApi/useAppApiAccess";
import appApiClient from "@/utils/appApiAxios";
import { useQuery } from "@tanstack/react-query";

/**
 * GET /admin/gas-limits — the configured gas ceiling per chain.
 *
 * Returns `{ chain, maxGasGwei }` only, and **only for chains someone saved**: a
 * chain missing from this list is not unlimited, it runs on the app's hardcoded
 * default (`appApiDefaultMaxGasGwei` in `constants/appApi.js`). That absence is
 * exactly what the panel's «Origen» column reads as «Predeterminado».
 *
 * There is no "current price" here — that comes from `useGetGasPrices`, and the
 * panel joins the two on `chain`.
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
