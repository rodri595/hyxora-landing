import { roleNames } from "@/constants/roles";
import { useWeb3 } from "@/context/Web3Provider";
import { useGetUserInformation } from "@/hooks/user/useGetUserInformation";
import apiClient from "@/utils/axios";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Endpoint paths for the whitelists.
 *
 * ⚠️ UNCONFIRMED — the ported dashboard's screenshots show the tables but not the
 * URLs it calls (unlike the fee schema, which is captioned
 * `GET /admin/fees?includeInactive=true`). These two are the shape the rest of
 * the admin API follows; if the backend uses different paths, this is the only
 * place to change.
 */
export const WHITELIST_ENDPOINTS = {
  tokens: "/admin/tokens",
  vaults: "/admin/vaults",
};

/**
 * Whitelisted tokens or vaults from the Hyxora backend.
 *
 * Read-only by design for now. Worth knowing: the original dashboard is stuck
 * read-only because it authenticates with a bot token and every mutation is
 * `adminOnly` — here we already carry a real Admin user's session JWT, so
 * editing is available to us whenever we want to build it.
 *
 * @param {"tokens" | "vaults"} kind
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive] Default true — inactive rows render greyed out.
 * @return {Object} react-query result; `data` is the raw payload.
 */
export const useGetWhitelist = (kind, params = {}) => {
  const { smartWalletAddress, isSessionReady } = useWeb3();
  const { authenticated, ready } = usePrivy();
  const { data: userInformation } = useGetUserInformation();
  const { includeInactive = true } = params;

  const isAdmin = useMemo(
    () => userInformation?.information?.role?.includes(roleNames?.admin ?? "") ?? false,
    [userInformation]
  );

  return useQuery({
    queryKey: ["whitelist", kind, smartWalletAddress, includeInactive],
    queryFn: async () => {
      const response = await apiClient.get(WHITELIST_ENDPOINTS[kind], {
        params: { includeInactive },
      });
      return response?.data?.data ?? response?.data ?? null;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    enabled:
      Boolean(WHITELIST_ENDPOINTS[kind]) &&
      Boolean(smartWalletAddress) &&
      authenticated &&
      ready &&
      isSessionReady &&
      isAdmin,
  });
};
