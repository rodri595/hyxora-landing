import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useForceMint = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/force-mint", {
        paymentId: data.paymentId,
      });
      return response?.data?.data;
    },
  });
};
