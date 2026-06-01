"use client";
import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { cn } from "@/utils";
import { useState } from "react";

const SPECIAL_URLS = ["/nfts"];
import Header from "./Header";
import Sidebar from "./Sidebar";
import PurchaseNFTModal from "@/components/PurchaseNFTModal";

const DashboardLayout = ({ children, headerExtra }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isSpecialPage = useMemo(
    () => SPECIAL_URLS.some((url) => pathname === url),
    [pathname],
  );

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f8] px-6">
        <p className="font-inter text-[14px] font-medium tracking-[-0.56px] text-[rgba(25,54,63,0.7)]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col justify-start items-start h-[100dvh] overflow-hidden",
        "bg-[#FFF]",
        isSpecialPage && "bg-[#0D0D0D]",
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
