import monitoringClient from "@/utils/monitoringAxios";
import { useMutation } from "@tanstack/react-query";

/**
 * GET /api/monitoring/services — liveness for API and App on staging and prod.
 *
 * Our own route handler, gated by `requireAdmin`, which replays the caller's
 * Privy token against Cerebro. So a 401 here means the Privy allowlist, and a
 * 200 with rows means the allowlist is fine — which narrows down a 401 coming
 * from anywhere else in this panel.
 *
 * The route fails soft per target: a dead host is a `down` row, not a 500.
 */
export const usePingServices = () => {
  return useMutation({
    mutationKey: ["devtools", "pingServices"],
    retry: false,
    mutationFn: async () => {
      const startedAt = performance.now();
      const response = await monitoringClient.get("/services");
      return {
        status: response?.status ?? null,
        durationMs: Math.round(performance.now() - startedAt),
        body: response?.data ?? null,
      };
    },
  });
};
