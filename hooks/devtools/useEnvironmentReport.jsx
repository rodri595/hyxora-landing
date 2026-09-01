import { usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";

const origin = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return url || "(sin configurar)";
  }
};

/**
 * Which backends this build is actually pointed at, plus who is logged in.
 *
 * No request — everything here is already in the bundle or in storage. It earns
 * its place because the single most expensive confusion when testing in
 * production is not knowing whether the tab is talking to gateway-dev or
 * gateway-prod, and nothing else on the page says so.
 *
 * Hosts only, never full URLs with credentials, and never the session JWT —
 * just whether one exists.
 */
export const useEnvironmentReport = () => {
  const { ready, authenticated, user } = usePrivy();

  return useMutation({
    mutationKey: ["devtools", "environment"],
    retry: false,
    mutationFn: async () => {
      const startedAt = performance.now();
      let jwtPresent = false;
      try {
        jwtPresent = Boolean(sessionStorage.getItem("jwt"));
      } catch {
        jwtPresent = false;
      }

      return {
        status: null,
        durationMs: Math.round(performance.now() - startedAt),
        body: {
          gateway: origin(process.env.NEXT_PUBLIC_HYXORA_API),
          cerebro: origin(process.env.NEXT_PUBLIC_CEREBRO_API),
          build: process.env.NODE_ENV,
          host: window.location.host,
          privyListo: ready,
          privyAutenticado: authenticated,
          privyId: user?.id ?? null,
          jwtEnSessionStorage: jwtPresent,
        },
      };
    },
  });
};
