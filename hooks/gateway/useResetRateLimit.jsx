import gatewayAdminClient from "@/utils/gatewayAdminAxios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** @import { RateLimitResetResult } from "./types" */

// The API takes exactly one of these and 400s on two — which is easy to send by
// accident, because a row from `/rate-limits` carries both a `target` and an
// `id`. Narrowing here means the caller can hand over the whole row.
const SELECTORS = ["email", "id", "ip"];

/**
 * Reduces whatever the caller passed to the single selector the API accepts.
 * @param {{ email?: string, id?: string, ip?: string }} input
 * @return {{ email: string } | { id: string } | { ip: string }}
 */
const toSelector = (input = {}) => {
  for (const key of SELECTORS) {
    const value = typeof input[key] === "string" ? input[key].trim() : "";
    if (value) return { [key]: value };
  }
  throw new Error("Indica un email, una IP o una referencia rl_… para resetear.");
};

/**
 * POST /gateway/admin/rate-limits/reset — clears one client's counter.
 *
 * Which selector to send is a real choice, not a preference:
 *
 * - **`email` is the robust one.** The counter key *is* the normalized email, so
 *   it works whether or not the user is logged in and whether or not the
 *   `rateLimitId` still exists. Its 404 ("No Privy user found for that email")
 *   is a typo guard, not a failed reset.
 * - **`id` is the privacy-preserving one** — the only thing a user can read off
 *   their own error screen, and it says nothing about who they are. It is also
 *   the fragile one: the id is in-memory, stable only within the current window,
 *   and gone on a gateway restart. A stale one 404s, and the fallback is email.
 * - **`ip`** is for anonymous traffic, which has no email to key on.
 *
 * `hitsCleared: 0` is a success — the counter had already rolled over. Say so
 * rather than showing it as a failure.
 *
 * Never retried. This is an action, and a silent second attempt after a failure
 * nobody has read yet is not what a reset button should do.
 *
 * @return {import("@tanstack/react-query").UseMutationResult<RateLimitResetResult, Error, { email?: string, id?: string, ip?: string }>}
 */
export const useResetRateLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gateway", "rateLimits", "reset"],
    retry: false,
    mutationFn: async (input) => {
      const response = await gatewayAdminClient.post("/rate-limits/reset", toSelector(input));
      return response?.data ?? null;
    },
    // The list is a live snapshot of in-memory counters, so refetch rather than
    // patching the cache: by the time this returns, other rows have moved too.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gateway", "rateLimits"] }),
  });
};
