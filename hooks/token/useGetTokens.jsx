import { gatewayRoot } from "@/utils/gateway";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * `/token/public-list` is app-api's other **public** endpoint — no bot token and
 * no session, same as `/vault/list` — and it feeds the simulator's catalogue.
 * Hence bare `axios` rather than `appApiClient`: that client goes through
 * `/api/app-api`, which is admin-gated.
 *
 * It used to point at `app-api-staging.hyxora.com` directly. Now that the
 * gateway serves app-api at `/app`, it hangs off `gatewayRoot` like everything
 * else, so one env var moves it between dev and prod.
 */
const APP_API = `${gatewayRoot}/app`;

// Stablecoins que el cliente no quiere mostrar en el listado
// (USDC base/arbitrum/polygon y EURC base).
const HIDDEN_ADDRESSES = new Set([
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
]);

export const useGetTokens = (props) => {
  return useQuery({
    queryKey: ["tokens", "public-list"],
    queryFn: async () => {
      const response = await axios.get(`${APP_API}/token/public-list`);
      const tokens = response?.data?.data?.tokens || response?.data?.tokens || [];
      return tokens.filter((t) => !HIDDEN_ADDRESSES.has(t.address?.toLowerCase()));
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: typeof props === "undefined" ? true : (props?.enabled ?? true),
  });
};
