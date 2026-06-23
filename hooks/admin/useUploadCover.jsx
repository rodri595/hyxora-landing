import apiClient from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

/**
 * Upload a tutorial cover image. The file lands in temporary storage and only
 * becomes permanent once it's referenced as `coverId` on a create/update.
 * Returns `{ fileId, message }`.
 */
export const useUploadCover = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post("/admin/tutorials/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return response?.data?.data;
    },
  });
};
