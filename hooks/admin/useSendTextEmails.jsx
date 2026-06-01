import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useSendTextEmails = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/admin/sendTextEmails", {
        emails: data.emails,
        subject: data.subject,
        texts: data.texts,
      });
      return response?.data?.data;
    },
  });
};
