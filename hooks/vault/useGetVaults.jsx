import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const VAULT_API_URL = "https://app-api.hyxora.com";

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
