"use client";
import Link from "next/link";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { cn } from "@/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";
const DashboardLayout = ({ children }) => {
  const { login } = useLogin();
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f8] px-6">
        <p className="font-inter text-[14px] font-medium tracking-[-0.56px] text-[rgba(25,54,63,0.7)]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f8] px-6">
        <div className="max-w-[460px] rounded-[24px] border border-[rgba(25,54,63,0.08)] bg-white p-6 shadow-[0px_14px_30px_-20px_rgba(25,54,63,0.3)]">
          <h1 className="font-inter text-[24px] font-semibold tracking-[-0.96px] text-[#19363f]">
            Authentication required
          </h1>
          <p className="mt-3 font-inter text-[15px] leading-6 tracking-[-0.45px] text-[rgba(25,54,63,0.75)]">
            You need to sign in to access this section.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={login}
              className="rounded-[12px] bg-[#1b5ffd] px-5 py-3 font-inter text-[14px] font-semibold tracking-[-0.42px] text-white transition-all hover:bg-[#114fdf]"
            >
              Sign in
            </button>
            <Link
              href="/"
              className="rounded-[12px] border border-[rgba(25,54,63,0.12)] bg-white px-5 py-3 font-inter text-[14px] font-semibold tracking-[-0.42px] text-[#19363f] transition-all hover:bg-[rgba(25,54,63,0.04)]"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-screen overflow-hidden flex flex-col flex-1 justify-start items-start ",
        "bg-[#FFF]",
      )}
    >
      <Header />
      <div className="flex flex-1 w-full h-full">
        <Sidebar />
        <div className="flex-1 flex overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
