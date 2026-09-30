import gatewayAdminClient from "@/utils/gatewayAdminAxios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** @import { RateLimitResetAllResult } from "./types" */

/**
 * POST /gateway/admin/rate-limits/reset-all — clears every counter and every
 * reference id at once.
 *
 * The big red button. Nothing about it is per-user: someone mid-abuse gets their
 * quota back along with the person you meant to help, so it is for an incident
 * ("we shipped a client that hammers the API"), not for support. Reach for
 * `useResetRateLimit` with an email whenever one user is the problem.
 *
 * @return {import("@tanstack/react-query").UseMutationResult<RateLimitResetAllResult, Error, void>}
 */
export const useResetAllRateLimits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gateway", "rateLimits", "resetAll"],
    retry: false,
    mutationFn: async () => {
      const response = await gatewayAdminClient.post("/rate-limits/reset-all");
      return response?.data ?? null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gateway", "rateLimits"] }),
  });
};
