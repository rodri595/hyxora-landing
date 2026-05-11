import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets, useLogout } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useAuth } from "@/hooks/useAuth";
import { useSessionSync } from "@/hooks/useSessionSync";

const Web3Context = createContext({
  logout: async () => {},
  walletAddress: null,
  smartWalletAddress: null,
  smartWalletClient: null,
  publicClient: null,
  currentChain: base,
  setCurrentChain: () => {},
  isModalPurchaseNFTOpen: false,
  setIsModalPurchaseNFTOpen: () => {},
});

export const Web3Provider = ({ children }) => {
  const [isModalPurchaseNFTOpen, setIsModalPurchaseNFTOpen] = useState(false);
  const { logout: privyLogout } = useLogout();
  const { authenticated, ready, user } = usePrivy();
  const { client: smartWalletClient, getClientForChain } = useSmartWallets();
  const { wallets } = useWallets();
  const { invalidateSession } = useAuth();

  const [currentChain, setCurrentChain] = useState(base);

  const { data: manualSmartWalletClient } = useQuery({
    queryKey: ["smart-wallet-client", currentChain.id],
    queryFn: () => getClientForChain({ id: currentChain.id }),
    enabled: authenticated && ready && !smartWalletClient,
    retry: true,
    retryDelay: 2_000,
    staleTime: Infinity,
  });

  const publicClient = useMemo(
    () => createPublicClient({ chain: currentChain, transport: http() }),
    [currentChain],
  );

  const walletAddress = useMemo(() => {
    if (!authenticated || !ready || wallets.length === 0) return null;
    return wallets[0].address;
  }, [authenticated, ready, wallets]);

  const smartWalletAddress = useMemo(() => {
    const client = smartWalletClient || manualSmartWalletClient;
    return client?.account?.address ?? null;
  }, [smartWalletClient, manualSmartWalletClient]);

  // Deploy smart wallet if not yet on-chain
  useEffect(() => {
    if (!user || user.smartWallet) return;

    const client = smartWalletClient || manualSmartWalletClient;
    if (!client?.account || client?.account?.deployed) return;

    const deploy = async () => {
      try {
        const txHash = await client.sendTransaction(
          { to: client?.account?.address, value: 0n, data: "0x" },
          {
            uiOptions: {
              title: "Activate Your Smart Wallet",
              description:
                "Deploy your smart wallet to access your tokens on-chain",
              buttonText: "Activate Wallet",
            },
          },
        );
        console.log("Smart wallet deployed:", txHash);
      } catch (error) {
        console.log("Error deploying smart wallet:", error);
      }
    };

    deploy();
  }, [user, smartWalletClient, manualSmartWalletClient]);
  // Sync backend session when Privy is authenticated but session cookie is absent
  useSessionSync();

  const logout = async () => {
    try {
      await invalidateSession();
    } catch (error) {
      console.log("Logout error:", error);
    }
    await privyLogout();
    window.location.reload();
  };

  return (
    <Web3Context.Provider
      value={{
        logout,
        walletAddress,
        smartWalletAddress,
        smartWalletClient: smartWalletClient || manualSmartWalletClient,
        publicClient,
        currentChain,
        setCurrentChain,
        isModalPurchaseNFTOpen,
        setIsModalPurchaseNFTOpen,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
export const useWeb3 = () => useContext(Web3Context);
