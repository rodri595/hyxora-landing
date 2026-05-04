import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { base } from "viem/chains";
import { useWeb3 } from "@/context/Web3Provider";
import { USDC_ADDRESS } from "@/constants/contracts";

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

export function useUSDCBalance() {
    const { smartWalletAddress, publicClient, currentChain } = useWeb3();
    const [usdcBalance, setUsdcBalance] = useState("0");
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const refreshBalance = async () => {
        if (!smartWalletAddress || !publicClient) {
            setUsdcBalance("0");
            return;
        }

        setIsLoadingBalance(true);
        try {
            const usdcAddress =
                currentChain.id === base.id
                    ? USDC_ADDRESS.base
                    : USDC_ADDRESS.baseSepolia;

            const code = await publicClient.getBytecode({ address: usdcAddress });
            if (!code || code === "0x") {
                console.warn("USDC contract not found at address:", usdcAddress);
                setUsdcBalance("0.00");
                return;
            }

            const [balance, decimals] = await Promise.all([
                publicClient.readContract({
                    address: usdcAddress,
                    abi: ERC20_ABI,
                    functionName: "balanceOf",
                    args: [smartWalletAddress],
                }),
                publicClient.readContract({
                    address: usdcAddress,
                    abi: ERC20_ABI,
                    functionName: "decimals",
                    args: [],
                }),
            ]);

            setUsdcBalance(parseFloat(formatUnits(balance, decimals)).toFixed(2));
        } catch (error) {
            console.error("Error fetching USDC balance:", error);
            setUsdcBalance("0.00");
        } finally {
            setIsLoadingBalance(false);
        }
    };

    useEffect(() => {
        refreshBalance();
        if (!smartWalletAddress || !publicClient) return;

        const intervalId = setInterval(refreshBalance, 10_000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [smartWalletAddress, currentChain, publicClient]);

    return { usdcBalance, isLoadingBalance, refreshBalance };
}
