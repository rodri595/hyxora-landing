import apiClient from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetch the publicly visible tutorials for the marketing "Centro de
 * aprendizaje" (the non-authenticated /tutorials landing).
 *
 * Unlike {@link useGetTutorials}, this does NOT gate on wallet / Privy auth:
 * it always runs and hits a public endpoint that returns only the tutorials
 * flagged as public. Anonymous visitors get no watch progress.
 *
 * @param {Object} params - { q, sort }
 * @return {Object} react-query result; `data` is `{ tutorials, featured, categories }`.
 */
export const useGetPublicTutorials = (params = {}) => {
  const { q, sort } = params;

  return useQuery({
    queryKey: ["academyPublicTutorials", q, sort],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (q) queryParams.append("q", q);
      if (sort) queryParams.append("sort", sort);
      const url = `/academy/tutorials${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);
      return response?.data?.data || null;
    },
    // staleTime: 5 * 60 * 1000,
    staleTime: false,
    gcTime: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  });
};
