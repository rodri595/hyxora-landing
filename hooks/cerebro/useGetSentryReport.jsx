import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { SentryReport } from "./types" */

/**
 * GET /system/sentry — unresolved issues, 24-hour event counts, new issues and users
 * affected.
 *
 * Reading issues back needs a Sentry auth token, which cannot go near a browser, so
 * this had to be resolved server-side by somebody. The backend took it, which is why
 * the panel is Cerebro's and not another `/api/monitoring/*` route of ours.
 *
 * The response carries its own failure state instead of a status code: `configured`
 * false means no token is set upstream, and `ok` false with `error` means Sentry
 * itself refused. Both are 200s, so the panel checks them rather than `isError`.
 *
 * Takes no parameters.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<SentryReport>}
 */
export const useGetSentryReport = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "sentryReport", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/system/sentry");
      return response?.data ?? null;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
