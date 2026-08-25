"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactLenis } from "lenis/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, arbitrum, baseSepolia } from "viem/chains";
import { Web3Provider } from "@/context/Web3Provider";
import { AppLaunchProvider } from "@/context/AppLaunchProvider";
import { Tooltip } from "react-tooltip";

const queryClient = new QueryClient();
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

const LENIS_EASING = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));

const LENIS_DESKTOP = {
  duration: 1.2,
  easing: LENIS_EASING,
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
  lerp: 0.1,
  wheelMultiplier: 1,
  orientation: "vertical",
  smoothWheel: true,
  syncTouch: true,
  autoToggle: true,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
};

const LENIS_MOBILE = {
  duration: 0.8,
  easing: LENIS_EASING,
  smooth: true,
  smoothTouch: true,
  touchMultiplier: 1.5,
  lerp: 0.09,
  wheelMultiplier: 1,
  orientation: "vertical",
  smoothWheel: true,
  syncTouch: true,
  autoToggle: true,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
};

const Providers = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.Buffer = Buffer;
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1000);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollSettings = useMemo(
    () => (isMobile ? LENIS_MOBILE : LENIS_DESKTOP),
    [isMobile],
  );

  return (
    <>
      <Tooltip
        id="tooltip"
        className="rounded-md! border-[#24292D]! bg-[#0D0D0D]! text-[14px]! font-inter! font-bold! text-[#FFF]! leading-[normal]! tracking-[-0.56px]! z-100!"
      />
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={appId}
          clientId={clientId}
          config={{
            appearance: {
              theme: "light",
              accentColor: "#1b5ffd",
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
          // config={{
          //   appearance: {
          //     accentColor: "#1b5ffd",
          //     theme: "#FFFFFF",
          //     showWalletLoginFirst: false,
          //     logo: logoIMG.src,
          //     walletChainType: "ethereum-only",
          //   },
          //   loginMethods: ["google", "twitter", "email"],
          //   defaultChain: base,
          //   supportedChains: [baseSepolia, base, arbitrum],
          //   embeddedWallets: {
          //     showWalletUIs: true,
          //     ethereum: {
          //       createOnLogin: "users-without-wallets",
          //     },
          //   },
          //   externalWallets: {
          //     disableAllExternalWallets: true,
          //   },
          // }}
        >
          <SmartWalletsProvider>
            <Web3Provider>
              <AppLaunchProvider>
                <ThemeProvider defaultTheme="light" disableTransitionOnChange>
                  <ReactLenis root options={scrollSettings}>
                    {children}
                  </ReactLenis>
                </ThemeProvider>
              </AppLaunchProvider>
            </Web3Provider>
          </SmartWalletsProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </>
  );
};

export default Providers;
