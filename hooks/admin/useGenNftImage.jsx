import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useGenNftImage = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/gen-nft-image", {
        paymentId: data.paymentId,
      });
      return response?.data?.data;
    },
  });
};
