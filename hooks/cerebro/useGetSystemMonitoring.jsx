import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { SystemMonitoring } from "./types" */

/**
 * GET /system/monitoring — the operational block: service liveness, the Solana
 * fee-payer balance, the Pimlico runway and liquidatable treasury holdings.
 *
 * Three of those four we already compute ourselves in `/api/monitoring/*`, and the
 * panels keep reading ours: they hit our own RPC and Zerion keys live, so they say
 * what is true now rather than what Cerebro's cron last saw. `pimlicoRunway` is the
 * exception and the reason this hook exists — the remaining credit is not something
 * Pimlico's API exposes, so it can only come from a full unfiltered op ledger, which
 * is the backend's to keep.
 *
 * Polled like `/system/health`: 1-minute cache, refetch on focus.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<SystemMonitoring>}
 */
export const useGetSystemMonitoring = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "systemMonitoring", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/system/monitoring");
      return response?.data ?? null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
    enabled,
  });
};
