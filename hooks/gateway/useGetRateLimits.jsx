import { useIsAdmin } from "@/hooks/user/useIsAdmin";
import gatewayAdminClient from "@/utils/gatewayAdminAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { RateLimitsResult } from "./types" */

// The counters live in the gateway's memory and roll over with the window
// (60s by default), so a cached list is wrong within a minute of being drawn.
// Poll instead of caching: this is a live view, and the endpoint is cheap.
const POLL_MS = 15 * 1000;

/**
 * GET /gateway/admin/rate-limits — who is consuming quota right now.
 *
 * The admin-only view, so unlike a client's own 429 it names the real `target`
 * (email or IP). `id` is the reference that client was last handed, or null if
 * it is spending quota without having tripped the limit yet — which is why the
 * table cannot be keyed on it.
 *
 * `windowMs` and `limit` come back on every response on purpose. They are
 * config-controlled on the gateway; render what arrives rather than "100 / 60s".
 *
 * @param {Object} [options]
 * @param {boolean} [options.enabled] Extra gate — pass `false` to hold the poll
 * back while the tab is not the one on screen.
 * @return {import("@tanstack/react-query").UseQueryResult<RateLimitsResult>}
 */
export const useGetRateLimits = ({ enabled = true } = {}) => {
  const { isAdmin, privyId } = useIsAdmin();

  return useQuery({
    queryKey: ["gateway", "rateLimits", privyId],
    queryFn: async () => {
      const response = await gatewayAdminClient.get("/rate-limits");
      return response?.data ?? null;
    },
    enabled: isAdmin && enabled,
    staleTime: 10 * 1000,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    // A 401 here means the gateway JWT was refused and the client already
    // retried once; a 403 means this Privy ID is not on the allowlist. Neither
    // improves on a second attempt, and both need to reach `QueryState`.
    retry: false,
  });
};
