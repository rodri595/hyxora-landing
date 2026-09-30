import simulatorClient from "@/utils/simulatorApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateSimUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const body = {};
      if (data.role !== undefined) body.role = data.role;
      if (data.status !== undefined) body.status = data.status;
      if (data.initialBalanceCents !== undefined) {
        body.initialBalanceCents = data.initialBalanceCents;
      }
      const response = await simulatorClient.patch(`/admin/users/${data.id}`, body);
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simAllUsers"] });
    },
  });
};
