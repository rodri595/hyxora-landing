import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useInitTokenCount = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/admin/initTokenCount");
      return response?.data?.data;
    },
  });
};
