import { readFromLocalStorageWithExpiracy, writeToLocalStorageWithExpiracy } from "@/utils/query";
import { useWeb3 } from "@/context/Web3Provider";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import apiClient from '@/utils/axios'

export function useAPI() {
  const { smartWalletAddress } = useWeb3();
  const { user } = usePrivy();

  const { data: myTokens, isLoading: myTokens_isLoading } = useQuery({
    queryKey: ["myTokens", smartWalletAddress, user?.id],
    queryFn: async () => {
      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/payment/list`,
      );
      return response.data.data.filter(payment => payment.status === 'completed' && payment.tokenId).map(payment => {
        return {
          tokenId: payment.tokenId,
          imageUrl: payment.imageUrl,
          // imageUrl: payment.imageUrl.replace('https://hyxora.vps.dlocs.tech', '/img'),
          txHash: payment.txHash,
          boughtAt: payment.updatedAt,
          type: payment.type,
          name: payment.name
        }
      });
    },
    enabled: Boolean(smartWalletAddress),
  });

  const { data: remainingNfts } = useQuery({
    queryKey: ["remainingNfts", smartWalletAddress],
    queryFn: async () => {
      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/nft-remaining`,
      );

      return response.data.remaining;
    },
    enabled: Boolean(smartWalletAddress),
  });

  const invalidateSession = async () => {
    try {

      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/logout`,
        {},
      );

      sessionStorage.removeItem('jwt');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse response from createLink API");

    }
  }

  const authenticate = async (jwt) => {
    try {

      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/authenticate`,
        {},
        {
          headers: {
            Authorization: jwt
          },
        }
      );

      if (response.data.data.jwt) {
        sessionStorage.setItem('jwt', response.data.data.jwt);
      }

      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse response from createLink API");
    }
  }

  const requestVatReturn = async (nombre, dirección, email, pasaporte, nacionalidad, tokenId) => {
    try {
      const cacheKey = `vatReturn-${smartWalletAddress}-${tokenId}`;
      const cached = readFromLocalStorageWithExpiracy(cacheKey);
      if (cached) return JSON.parse(cached);

      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/payment/vat-return`,
        {
          nombre,
          dirección,
          email,
          pasaporte,
          nacionalidad,
          tokenId
        },
      );

      writeToLocalStorageWithExpiracy(cacheKey, JSON.stringify(response.data), 20 * 1000);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse response from createLink API");
    }
  }

  const createLink = async (type, username, referenceNumber = undefined) => {
    try {
      const cacheKey = `createLink-${smartWalletAddress}-${type}`;
      const cached = readFromLocalStorageWithExpiracy(cacheKey);
      if (cached) return JSON.parse(cached);

      const response = await apiClient.post(
        `${import.meta.env.VITE_HYXORA_API}/payment/create`,
        {
          wallet: smartWalletAddress,
          name: username,
          type: type,
          ref: referenceNumber,
          lang: "ES",
        },
      );

      writeToLocalStorageWithExpiracy(cacheKey, JSON.stringify(response.data), 20 * 1000);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse response from createLink API");
    }
  }

  const getPayments = async () => {
    try {
      const cacheKey = `getPayments-${smartWalletAddress}`;
      const cached = readFromLocalStorageWithExpiracy(cacheKey);
      if (cached) {
        return cached.data;
      }

      const response = await apiClient.get(
        `${import.meta.env.VITE_HYXORA_API}/payment/list`,
      );

      writeToLocalStorageWithExpiracy(cacheKey, JSON.stringify(response.data), 20 * 1000);
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to parse response from createLink API");
    }
  }

  useEffect(() => {
    if (smartWalletAddress) void getPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartWalletAddress])

  return {
    createLink,
    getPayments,
    myTokens,
    myTokens_isLoading,
    remainingNfts,
    requestVatReturn,
    authenticate,
    invalidateSession
  };
}
