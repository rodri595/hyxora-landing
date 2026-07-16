import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// API detrás de https://hyxora-app-staging.netlify.app (la URL de Netlify sirve
// el frontend; el JSON vive en el host app-api-staging).
const TOKEN_API_URL = "https://app-api-staging.hyxora.com";

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
      const response = await axios.get(`${TOKEN_API_URL}/token/public-list`);
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
