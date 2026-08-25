import { roleNames } from "@/constants/roles";
import { useWeb3 } from "@/context/Web3Provider";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Live fee schema from the Hyxora backend — plans (price, Stripe product) and
 * the per-plan / per-operation fee matrix.
 *
 * Note this is the Hyxora API via `apiClient`, NOT Cerebro: the ported dashboard
 * reads it straight from the backend. It's consumed by the Cerebro «Planes» tab
 * anyway, but the hook lives here because that's where the endpoint lives.
 *
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive] Include deactivated fees/plans. Default true —
 * the matrix wants to show inactive rows greyed out rather than hide them.
 * @return {Object} react-query result; `data` is the raw payload (see
 * `_modules/cerebro/planes/normalize.js` for the shape adapters).
 */
export const useGetFeeSchema = (params = {}) => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { data: userInformation } = useGetUserInformation();
  const { includeInactive = true } = params;

  const isAdmin = useMemo(
    () => userInformation?.information?.role?.includes(roleNames?.admin ?? "") ?? false,
    [userInformation]
  );

  return useQuery({
    queryKey: ["feeSchema", smartWalletAddress, includeInactive],
    queryFn: async () => {
      const response = await apiClient.get("/admin/fees", {
        params: { includeInactive },
      });
      return response?.data?.data ?? response?.data ?? null;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled: Boolean(smartWalletAddress) && authenticated && ready && isSessionReady && isAdmin,
  });
};
