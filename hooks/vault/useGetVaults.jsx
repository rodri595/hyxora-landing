import { gatewayRoot } from "@/utils/gateway";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * `/vault/list` is app-api's one **public** endpoint — no bot token, no session —
 * and it feeds the logged-out simulator pages. Hence bare `axios` rather than
 * `appApiClient`: that client goes through `/api/app-api`, which is admin-gated,
 * and this call must work for a visitor who has never signed in.
 */
const VAULT_API_URL = `${gatewayRoot}/app`;

export const useGetVaults = (props) => {
  return useQuery({
    queryKey: ["vaults", "base"],
    queryFn: async () => {
      const response = await axios.get(`${VAULT_API_URL}/vault/list`, {
        params: { chain: "base" },
      });
      return response?.data?.data?.vaults || response?.data?.vaults || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: typeof props === "undefined" ? true : (props?.enabled ?? true),
  });
};
