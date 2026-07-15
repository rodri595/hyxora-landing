import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// API detrás de https://hyxora-app-staging.netlify.app (la URL de Netlify sirve
// el frontend; el JSON vive en el host app-api-staging).
const TOKEN_API_URL = "https://app-api-staging.hyxora.com";

export const useGetTokens = (props) => {
  return useQuery({
    queryKey: ["tokens", "public-list"],
    queryFn: async () => {
      const response = await axios.get(`${TOKEN_API_URL}/token/public-list`);
      const tokens = response?.data?.data?.tokens || response?.data?.tokens || [];
      console.log("[useGetTokens] /token/public-list →", tokens);
      return tokens;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: typeof props === "undefined" ? true : (props?.enabled ?? true),
  });
};
