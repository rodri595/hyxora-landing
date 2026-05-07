import apiClient from "@/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to set invoice number for a payment (Admin only)
 * @param {Object}
 * @return {Object}
 */
export const useSetInvoiceNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/admin/setInvoiceNumber`,
        {
          paymentId: data.paymentId,
          invoiceNumber: data.invoiceNumber,
        },
      );
      return response?.data?.data;
    },
    onSuccess: () => {
      // Invalidate payments query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
