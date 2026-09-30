import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Drops every cached react-query result, so the next render refetches from the
 * real APIs. Useful when a backend was just redeployed and the page is still
 * showing whatever it fetched before.
 *
 * Deliberately does not touch `sessionStorage` or reload: clearing the cache is
 * reversible in a second, and signing the session out to inspect stale data is
 * not the same operation. "Renovar sesión" is the one that touches auth.
 */
export const useClearQueryCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["devtools", "clearQueryCache"],
    retry: false,
    mutationFn: async () => {
      const startedAt = performance.now();
      const before = queryClient.getQueryCache().getAll().length;
      queryClient.clear();
      return {
        status: null,
        durationMs: Math.round(performance.now() - startedAt),
        body: {
          queriesEliminadas: before,
          nota: "Los componentes montados vuelven a pedir sus datos",
        },
      };
    },
  });
};
