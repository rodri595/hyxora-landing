import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useChangeBaseUri = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/changeBaseUri", {
        baseUri: data.baseUri,
      });
      return response?.data?.data;
    },
  });
};
