import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendTextEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/sendTextEmails", {
        emails: data.emails,
        subject: data.subject,
        texts: data.texts,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEmails"] });
    },
  });
};
