import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient, { cleanParams } from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { FeeDiagnosticRow } from "./types" */

/**
 * GET /fees/diagnostics — fee rows with the tag that classified them, for
 * debugging why a fee landed under a given operation. Not a reporting endpoint.
 *
 * Field names don't match admin.md (see `FeeDiagnosticRow`), so the rows are
 * returned untouched and `ingresos/FeeTaggingPanel` normalises them.
 *
 * @param {Object} [params]
 * @param {number} [params.days] Days to include. API default 30, max 365.
 * @param {number} [params.limit] Max rows. API default 20, max 100.
 * @return {import("@tanstack/react-query").UseQueryResult<FeeDiagnosticRow[]>} `data` is the
 * unwrapped `rows` array.
 */
export const useGetFeesDiagnostics = (params = {}) => {
  const { enabled, privyId } = useCerebroAccess();
  const { days, limit } = params;

  return useQuery({
    queryKey: ["cerebro", "feesDiagnostics", privyId, days, limit],
    queryFn: async () => {
      const response = await cerebroClient.get("/fees/diagnostics", {
        params: cleanParams({ days, limit }),
      });
      return response?.data?.rows ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
