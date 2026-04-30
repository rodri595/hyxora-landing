import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { createPublicClient, formatUnits, http } from "viem";
import { useChain } from "./ChainContext";
import { USDC_ADDRESS } from "../constants/contracts";
import { base } from "viem/chains";
import { useLogout } from "@privy-io/react-auth";
import { useAPI } from "@/hooks/useAPI";

const Web3Context = createContext({
  usdcBalance: "0",
  isLoadingBalance: false,
  refreshBalance: async () => {},
  logout: async () => {},
  walletAddress: null,
  smartWalletAddress: null,
  smartWalletClient: null,
  publicClient: null,
});

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export const Web3Provider = ({ children }) => {
  const { logout: privyLogout } = useLogout();
  const { authenticated, ready, user, getAccessToken } = usePrivy();
  const { client: smartWalletClient, getClientForChain } = useSmartWallets();
  const { wallets } = useWallets();
  const { currentChain } = useChain();
  const { authenticate, invalidateSession } = useAPI();
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
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

  // Get addresses
  useEffect(() => {
    if (!authenticated || !ready) {
      return;
    }
    if (wallets && wallets.length > 0) {
      setWalletAddress(wallets[0].address);
    }
    const client = smartWalletClient || manualSmartWalletClient;
    if (client) {
      const address = client.account?.address;
      if (address) {
        setSmartWalletAddress(address);
        if (!localStorage.getItem("privy:caid")) {
          return setIsBuyOpen(true);
        }
      }
    }
  }, [
    authenticated,
    ready,
    wallets,
    smartWalletClient,
    manualSmartWalletClient,
    walletAddress,
    smartWalletAddress,
  ]);

  // Get client - retry until we get a client
  useEffect(() => {
    let intervalId = null;

    const getClient = async () => {
      try {
        if (!authenticated || !ready) {
          return;
        }

        if (!smartWalletClient && !manualSmartWalletClient) {
          const newClient = await getClientForChain({ id: currentChain.id });
          setManualSmartWalletClient(newClient);
        }
      } catch (error) {
        console.error("Error getting privy client:", error);
      }
    };

    // Only start polling if authenticated and we don't have a client yet
    if (
      authenticated &&
      ready &&
      !manualSmartWalletClient &&
      !smartWalletClient
    ) {
      // Try immediately
      getClient();

      // Then retry every 2 seconds until we get a client
      intervalId = setInterval(() => {
        if (!manualSmartWalletClient && !smartWalletClient) {
          getClient();
        } else {
          clearInterval(intervalId);
        }
      }, 2000);
    }

    // Cleanup interval on unmount or when we get a client
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    authenticated,
    ready,
    smartWalletClient,
    manualSmartWalletClient,
    currentChain,
    getClientForChain,
  ]);

  // Deploys smart wallet if not deployed
  useEffect(() => {
    const deployWallet = async () => {
      const client = smartWalletClient || manualSmartWalletClient;
      if (client && client.account && !client.account.deployed) {
        try {
          const txHash = await client.sendTransaction(
            {
              to: client.account.address,
              value: 0n,
              data: "0x",
            },
            {
              uiOptions: {
                title: "Activate Your Smart Wallet",
                description:
                  "Deploy your smart wallet to access your tokens on-chain",
                buttonText: "Activate Wallet",
              },
            },
          );

          console.log("Smart wallet deployed with tx hash:", txHash);
        } catch (error) {
          console.error("Error deploying smart wallet:", error);
        }
      }
    };

    if (
      user &&
      !user.smartWallet &&
      (smartWalletClient || manualSmartWalletClient)
    ) {
      deployWallet();
    }
  }, [user, smartWalletClient, manualSmartWalletClient]);

  const refreshBalance = async () => {
    if (!authenticated || !smartWalletAddress || !publicClient) {
      setUsdcBalance("0");
      return;
    }

    setIsLoadingBalance(true);
    try {
      const usdcAddress =
        currentChain.id === base.id
          ? USDC_ADDRESS.base
          : USDC_ADDRESS.baseSepolia;

      // Check if address is valid and contract exists
      const code = await publicClient.getBytecode({
        address: usdcAddress,
      });

      if (!code || code === "0x") {
        console.warn("USDC contract not found at address:", usdcAddress);
        setUsdcBalance("0.00");
        setIsLoadingBalance(false);
        return;
      }

      const balance = await publicClient.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [smartWalletAddress],
      });

      const decimals = await publicClient.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
        args: [],
      });

      const formattedBalance = formatUnits(balance, decimals);
      setUsdcBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
      setUsdcBalance("0.00");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const logout = async () => {
    await invalidateSession();
    setUsdcBalance("0");
    setIsLoadingBalance(false);
    setWalletAddress(null);
    setSmartWalletAddress(null);
    setManualSmartWalletClient(null);
    await privyLogout();
    window.location.reload();
  };

  useEffect(() => {
    const hasSessionCookie = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("session="));
    const hasPrivyTokenCookie = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("privy-token="));

    const auth = async () => {
      const accessToken = await getAccessToken();
      await authenticate(accessToken);
    };
    if (!hasSessionCookie && hasPrivyTokenCookie) {
      void auth();
    }
  }, [document.cookie]);

  useEffect(() => {
    refreshBalance();

    // Set up polling interval to refresh balance every 10 seconds
    const intervalId = setInterval(() => {
      if (authenticated && smartWalletAddress && publicClient) {
        refreshBalance();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, smartWalletAddress, currentChain, publicClient]);

  return (
    <Web3Context.Provider
      value={{
        usdcBalance,
        isLoadingBalance,
        refreshBalance,
        logout,
        walletAddress,
        smartWalletAddress,
        smartWalletClient: smartWalletClient || manualSmartWalletClient,
        publicClient,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
export const useWeb3 = () => useContext(Web3Context);
