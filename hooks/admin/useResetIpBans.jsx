import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// The gateway root, without the /founders prefix apiClient's baseURL carries.
// IP bans are enforced by the gateway itself, so its admin route sits beside
// /auth and /founders rather than inside one of them.
const gateway = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");

// Exactly the path the backend gave us. A 401 rather than a 404 says the route
// is really there, so this line is settled.
const RESET_PATH = "/gateway/admin/ip-bans/reset";

/**
 * GET /gateway/admin/ip-bans/reset — clears the gateway's IP ban list.
 *
 * Two credentials, because the 401 this returns does not say which one it
 * wanted, and the app has both:
 *
 * - `auth: "session"` goes through `apiClient`, so it carries the Hyxora
 *   session (cookie in prod, `Bearer <jwt>` in dev) and inherits the one-shot
 *   re-auth on 401. Passed an absolute URL on purpose — axios skips `baseURL`
 *   for those, which is what lets the call escape `/founders`.
 * - `auth: "privy"` sends the raw Privy access token instead, the way Cerebro
 *   and `/api/monitoring/*` authenticate. If the gateway's admin routes are
 *   gated on the Privy allowlist rather than the founders session, this one
 *   succeeds where the other 401s — which is the whole reason both exist.
 *
 * Never cached and never retried — it is an action, and a silent second attempt
 * on a failure you have not seen yet is not what a reset button should do.
 *
 * @param {{ auth?: "session" | "privy" }} [options]
 */
export const useResetIpBans = ({ auth = "session" } = {}) => {
  return useMutation({
    mutationKey: ["gateway", "ipBans", "reset", auth],
    retry: false,
    mutationFn: async () => {
      const url = `${gateway}${RESET_PATH}`;
      const startedAt = performance.now();

      let response;
      if (auth === "privy") {
        const { getAccessToken } = await import("@privy-io/react-auth");
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("Sin token de Privy — inicia sesión primero");
        // Bare axios: apiClient would attach the session on top and re-auth on
        // 401, which is precisely the variable this call is isolating.
        response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        response = await apiClient.get(url);
      }

      return {
        status: response?.status ?? null,
        durationMs: Math.round(performance.now() - startedAt),
        // The founders envelope is data.data; the gateway may answer plainly.
        // Show whichever arrived rather than an empty body on the happy path.
        body: response?.data?.data ?? response?.data ?? null,
      };
    },
  });
};
