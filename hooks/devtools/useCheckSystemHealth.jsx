import cerebroClient from "@/utils/cerebroAxios";
import { useMutation } from "@tanstack/react-query";

/**
 * GET /system/health — Cerebro's indexer cursors, TVL freshness and cache state.
 *
 * The same call `requireAdmin` uses as its authorisation probe, run directly.
 * A 200 proves this Privy ID is on `ADMIN_ALLOWLIST_PRIVY_IDS`; a 401 proves it
 * is not, which is worth knowing before blaming any other endpoint.
 *
 * `tvl.freshness` here is a **max** — one user refreshing moves it. The per-user
 * histogram lives on /system/tvl-freshness, not here.
 */
export const useCheckSystemHealth = () => {
  return useMutation({
    mutationKey: ["devtools", "systemHealth"],
    retry: false,
    mutationFn: async () => {
      const startedAt = performance.now();
      const response = await cerebroClient.get("/system/health");
      return {
        status: response?.status ?? null,
        durationMs: Math.round(performance.now() - startedAt),
        body: response?.data ?? null,
      };
    },
  });
};
