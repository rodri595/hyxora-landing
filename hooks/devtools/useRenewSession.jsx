import { authClient } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * POST /auth/login — mints a fresh Hyxora session from the current Privy token.
 *
 * The same exchange `apiClient` runs by itself on a 401, done deliberately so a
 * failure is visible instead of swallowed. When a call 401s, this says whether
 * the session is the broken part or the route simply wants another credential.
 *
 * Mirrors `refreshSession` in `utils/axios.js`, including the bare
 * `Authorization: <token>` with no `Bearer` prefix — that is what the endpoint
 * expects, and adding the scheme 400s.
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
        { headers: { Authorization: accessToken } }
      );

      const jwt = response?.data?.data?.jwt;
      if (jwt) {
        try {
          // Dev has withCredentials off, so the session only survives here.
          sessionStorage.setItem("jwt", jwt);
        } catch {
          // Storage blocked; the cookie path still works in production.
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
