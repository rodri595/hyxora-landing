import { authClient, readSessionJwt } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * POST /auth/login — mints a fresh Hyxora session from the current Privy token.
 *
 * The same exchange `apiClient` runs by itself on a 401, done deliberately so a
 * failure is visible instead of swallowed. When a call 401s, this says whether
 * the session is the broken part or the route simply wants another credential.
 *
 * Mirrors `refreshSession` in `utils/axios.js`, down to the `Bearer` prefix.
 * The scheme is not optional: the gateway parses it off the header and answers
 * a bare token with `{ success: false, error: "Missing access token" }`.
 */
export const useRenewSession = () => {
  return useMutation({
    mutationKey: ["devtools", "renewSession"],
    retry: false,
    mutationFn: async () => {
      const { getAccessToken } = await import("@privy-io/react-auth");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Sin token de Privy — inicia sesión primero");

      const startedAt = performance.now();
      const response = await authClient.post(
        "/login",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const jwt = readSessionJwt(response?.data);
      if (jwt) {
        try {
          // Stored in every environment: in dev `withCredentials` is off, and on
          // a Netlify origin the gateway's cookie is third-party and may never
          // be stored either. The header is what carries the session in both.
          sessionStorage.setItem("jwt", jwt);
        } catch {
          // Storage blocked; the cookie path still works on a first-party origin.
        }
      }

      return {
        status: response?.status ?? null,
        durationMs: Math.round(performance.now() - startedAt),
        // Never the JWT itself — this panel can be open on a shared screen.
        body: {
          jwtRecibido: Boolean(jwt),
          guardadoEnSessionStorage: Boolean(jwt),
        },
      };
    },
  });
};
