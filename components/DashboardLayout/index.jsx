"use client";
import { useWeb3 } from "@/context/Web3Provider";
import { cn } from "@/utils";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useState } from "react";

const SPECIAL_URLS = ["/nfts"];
import PurchaseNFTModal from "@/components/PurchaseNFTModal";
import SessionGate from "@/components/SessionGate";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children, headerExtra }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();
  const { sessionStatus, sessionError, retrySession, isRetryingSession, logout } = useWeb3();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isSpecialPage = useMemo(() => SPECIAL_URLS.some((url) => pathname === url), [pathname]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  // Nothing under the dashboard renders without a Hyxora session. Every gated
  // query is `enabled: isSessionReady`, so mounting without one gives a screen
  // of spinners that never resolve and no error anywhere — SessionGate names the
  // failure instead, and is also the spinner while Privy and the session boot.
  if (!ready || !authenticated || sessionStatus !== "ready") {
    return (
      <SessionGate
        status={ready && authenticated ? sessionStatus : "pending"}
        error={sessionError}
        onRetry={retrySession}
        isRetrying={isRetryingSession}
        onLogout={logout}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col justify-start items-start h-[100dvh] overflow-hidden",
        "bg-[#FFF]",
        isSpecialPage && "bg-[#0D0D0D]"
      )}
    >
      <Header
        isSpecialPage={isSpecialPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        headerExtra={headerExtra}
      />
      <div className="flex flex-1 w-full min-h-0 h-full justify-start items-stretch ]">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isSpecialPage={isSpecialPage}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
      <PurchaseNFTModal />
    </div>
  );
};

export default DashboardLayout;
