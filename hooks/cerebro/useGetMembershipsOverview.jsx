import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import cerebroClient from "@/utils/cerebroAxios";
import { useQuery } from "@tanstack/react-query";

/** @import { MembershipsOverview } from "./types" */

/**
 * GET /memberships/overview — the global membership snapshot: totals per status, the
 * plan × status matrix, renewal windows, payment channels, lifecycle counters and
 * how fresh the per-user sync is.
 *
 * One request feeds three panels on «Membresías»; react-query shares it. Subsumes
 * `/users/renewals`, which only counts the next-N-days window.
 *
 * `lifecycle` is `null` until migration #670 is applied — that is a state to render,
 * not an error.
 *
 * @return {import("@tanstack/react-query").UseQueryResult<MembershipsOverview>}
 */
export const useGetMembershipsOverview = () => {
  const { enabled, privyId } = useCerebroAccess();

  return useQuery({
    queryKey: ["cerebro", "membershipsOverview", privyId],
    queryFn: async () => {
      const response = await cerebroClient.get("/memberships/overview");
      return response?.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled,
  });
};
