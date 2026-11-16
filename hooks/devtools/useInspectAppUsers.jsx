import appApiClient from "@/utils/appApiAxios";
import { useMutation } from "@tanstack/react-query";

/**
 * GET /api/app-api/admin/users — one page of app-api's user list, through our proxy.
 *
 * Exists so the request shows up in the browser's Network tab on demand, with the
 * same URL, headers and body the CRM export gets. What arrives is what the proxy
 * forwards: each row is projected down to the export's fields, so `kycId`,
 * `refCode`, `role` and the rest are absent here by design. For the unprojected
 * response, `scripts/inspect-app-users.mjs` calls the gateway directly.
 */
export const useInspectAppUsers = () => {
  return useMutation({
    mutationKey: ["devtools", "appUsers"],
    retry: false,
    mutationFn: async ({ limit } = {}) => {
      const startedAt = performance.now();
      const response = await appApiClient.get("/admin/users", {
        params: { limit: Math.min(Math.max(Number(limit) || 1, 1), 1000), offset: 0 },
      });
      return {
        status: response?.status ?? null,
        durationMs: Math.round(performance.now() - startedAt),
        body: response?.data ?? null,
      };
    },
  });
};
