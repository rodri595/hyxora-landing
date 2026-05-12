import { useMutation } from "@tanstack/react-query";
import apiClient from "@/utils/axios";
import { useWeb3 } from "@/context/Web3Provider";
import {
    readFromLocalStorageWithExpiracy,
    writeToLocalStorageWithExpiracy,
} from "@/utils/query";

export function useVatReturn() {
    const { smartWalletAddress } = useWeb3();

    return useMutation({
        mutationFn: async ({ nombre, direccion, email, pasaporte, nacionalidad, tokenId }) => {
            const cacheKey = `vatReturn-${smartWalletAddress}-${tokenId}`;
            const cached = readFromLocalStorageWithExpiracy(cacheKey);
            if (cached) return JSON.parse(cached);

            const response = await apiClient.post("/payment/vat-return", {
                nombre,
                direccion,
                email,
                pasaporte,
                nacionalidad,
                tokenId,
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
