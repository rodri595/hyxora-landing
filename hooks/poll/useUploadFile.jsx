import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * Custom hook to upload a file for a poll
 * @return {Object}
 */
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post(
        "/poll/uploadFile",

        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      return response?.data?.data;
    },
  });
};
