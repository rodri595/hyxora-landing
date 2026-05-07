import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * Custom hook to send text emails (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useSendTextEmails = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/sendTextEmails`,
        {
          emails: data.emails,
          subject: data.subject,
          texts: data.texts,
        },
      );
      return response?.data?.data;
    },
  });
};
