import simulatorClient from "@/utils/simulatorApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteSimUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await simulatorClient.delete(`/admin/users/${id}`);
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simAllUsers"] });
    },
  });
};
