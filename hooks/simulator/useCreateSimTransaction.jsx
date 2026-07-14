import simulatorClient from "@/utils/simulatorApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateSimTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await simulatorClient.post("/transactions", {
        type: data.type,
        symbol: data.symbol,
        amountCents: data.amountCents,
        units: data.units,
        priceUsd: data.priceUsd,
        note: data.note,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simAccount"] });
      queryClient.invalidateQueries({ queryKey: ["simTransactions"] });
    },
  });
};
