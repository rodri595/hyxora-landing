import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import {
    readFromLocalStorageWithExpiracy,
    writeToLocalStorageWithExpiracy,
} from "@/utils/query";

export function useCreatePaymentLink() {
    const { smartWalletAddress } = useWeb3();

    return useMutation({
        mutationFn: async ({ type, username, refBy = undefined, referenceNumber = undefined }) => {
            const cacheKey = `createLink-${smartWalletAddress}-${type}`;
            const cached = readFromLocalStorageWithExpiracy(cacheKey);
            if (cached) return JSON.parse(cached);

            const response = await apiClient.post("/payment/create", {
                wallet: smartWalletAddress,
                name: username,
                type,
                refBy,
                ref: referenceNumber,
                lang: "ES",
            });

            writeToLocalStorageWithExpiracy(
                cacheKey,
                JSON.stringify(response.data),
                20 * 1000,
            );
            return response.data;
        },
    });
}
