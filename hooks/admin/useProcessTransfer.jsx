import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useProcessTransfer = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/process-transfer", {
        paymentId: data.paymentId,
      });
      return response?.data?.data;
    },
  });
};
