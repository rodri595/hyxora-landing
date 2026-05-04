import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets, useLogout } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useAuth } from "@/hooks/useAuth";

const Web3Context = createContext({
  logout: async () => {},
  walletAddress: null,
  smartWalletAddress: null,
  smartWalletClient: null,
  publicClient: null,
  currentChain: base,
  setCurrentChain: () => {},
});

export const Web3Provider = ({ children }) => {
  const { logout: privyLogout } = useLogout();
  const { authenticated, ready, user, getAccessToken } = usePrivy();
  const { client: smartWalletClient, getClientForChain } = useSmartWallets();
  const { wallets } = useWallets();
  const { authenticate, invalidateSession } = useAuth();

  const [currentChain, setCurrentChain] = useState(base);
  const [walletAddress, setWalletAddress] = useState(null);
  const [smartWalletAddress, setSmartWalletAddress] = useState(null);
  const [manualSmartWalletClient, setManualSmartWalletClient] = useState(null);
  const [publicClient, setPublicClient] = useState(null);

  // Setup public client
  useEffect(() => {
    const pClient = createPublicClient({
      chain: currentChain,
      transport: http(),
    });
    setPublicClient(pClient);
  }, [currentChain]);

  // Sync wallet addresses from Privy
  useEffect(() => {
    if (!authenticated || !ready) return;

    if (wallets.length > 0) {
      setWalletAddress(wallets[0].address);
    }

    const client = smartWalletClient || manualSmartWalletClient;
    const address = client?.account?.address;
    if (address) {
      setSmartWalletAddress(address);
    }
  }, [
    authenticated,
    ready,
    wallets,
    smartWalletClient,
    manualSmartWalletClient,
  ]);

  // Retry getting smart wallet client until available
  useEffect(() => {
    if (!authenticated || !ready) return;
    if (smartWalletClient || manualSmartWalletClient) return;

    let intervalId = null;

    const tryGetClient = async () => {
      try {
        const newClient = await getClientForChain({ id: currentChain.id });
        setManualSmartWalletClient(newClient);
        clearInterval(intervalId);
      } catch (error) {
        console.log("Error getting smart wallet client:", error);
      }
    };

    tryGetClient();
    intervalId = setInterval(tryGetClient, 2_000);

    return () => clearInterval(intervalId);
  }, [
    authenticated,
    ready,
    smartWalletClient,
    manualSmartWalletClient,
    currentChain,
    getClientForChain,
  ]);
  // Deploy smart wallet if not yet on-chain
  useEffect(() => {
    if (!user || user.smartWallet) return;

    const client = smartWalletClient || manualSmartWalletClient;
    if (!client?.account || client.account.deployed) return;

    const deploy = async () => {
      try {
        const txHash = await client.sendTransaction(
          { to: client.account.address, value: 0n, data: "0x" },
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
  useEffect(() => {
    if (!ready || !authenticated) return;

    const hasSessionCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("session="));

    if (!hasSessionCookie) {
      const sync = async () => {
        try {
          const accessToken = await getAccessToken();
          await authenticate(accessToken);
        } catch (error) {
          console.log("Session sync failed:", error);
        }
      };
      void sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, ready]);

  const logout = async () => {
    try {
      await invalidateSession();
    } catch (error) {
      console.log("Logout error:", error);
    }
    setWalletAddress(null);
    setSmartWalletAddress(null);
    setManualSmartWalletClient(null);
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
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
export const useWeb3 = () => useContext(Web3Context);
