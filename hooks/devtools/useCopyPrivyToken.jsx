import { useMutation } from "@tanstack/react-query";

/** Reads `exp` and `iat` out of a JWT without verifying it — this is a readout, not a check. */
const decodeClaims = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Copies the current Privy access token to the clipboard, so the same request
 * the panel just made can be replayed with curl against any of the four APIs.
 * That is the fastest way to tell "our client sends the wrong thing" apart from
 * "the endpoint is broken".
 *
 * The token never renders — only its length and time to expiry — because a
 * bearer credential on screen is a bearer credential on someone's recording.
 */
export const useCopyPrivyToken = () => {
  return useMutation({
    mutationKey: ["devtools", "copyPrivyToken"],
    retry: false,
    mutationFn: async () => {
      const startedAt = performance.now();
      const { getAccessToken } = await import("@privy-io/react-auth");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Sin token de Privy — inicia sesión primero");

      // Requires a secure context; on plain http this rejects rather than
      // silently copying nothing.
      await navigator.clipboard.writeText(accessToken);

      const claims = decodeClaims(accessToken);
      const secondsLeft = claims?.exp ? Math.round(claims.exp - Date.now() / 1000) : null;

      return {
        status: null,
        durationMs: Math.round(performance.now() - startedAt),
        body: {
          copiado: true,
          longitud: accessToken.length,
          expiraEn: secondsLeft == null ? "desconocido" : `${secondsLeft}s`,
          privyId: claims?.sub ?? null,
        },
      };
    },
  });
};
