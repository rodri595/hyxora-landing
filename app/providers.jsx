"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
// //
import { ChainProvider } from "@/context/ChainContext";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, arbitrum, baseSepolia } from "viem/chains";
import { Web3Provider } from "@/context/Web3Provider";

const queryClient = new QueryClient();
// Polyfill Buffer for Privy/viem compatibility
window.Buffer = Buffer;
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

const Providers = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const scrollSettings = isMobile
    ? {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.09,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      }
    : {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      };

  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider>
        <PrivyProvider
          appId={appId}
          clientId={clientId}
          config={{
            appearance: {
              theme: "light",
              accentColor: "#3b82f6",
              walletChainType: "ethereum-only",
              walletList: [
                "metamask",
                "rabby_wallet",
                "coinbase_wallet",
                "detected_wallets",
              ],
            },
            defaultChain: base,
            supportedChains: [baseSepolia, base, arbitrum],
            embeddedWallets: {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
          }}
        >
          <SmartWalletsProvider>
            <Web3Provider>
              <ThemeProvider defaultTheme="light" disableTransitionOnChange>
                <ReactLenis root options={scrollSettings}>
                  {children}
                </ReactLenis>
              </ThemeProvider>
            </Web3Provider>
          </SmartWalletsProvider>
        </PrivyProvider>
      </ChainProvider>
    </QueryClientProvider>
  );
};

export default Providers;
