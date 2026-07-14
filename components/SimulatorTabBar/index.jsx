"use client";
import Tabs from "@/components/Tabs";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const SIMULATOR_TABS = [
  { id: "assets", label: "Activos Digitales" },
  { id: "hyxora-in", label: "Hyxora IN" },
];

const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const SimulatorTabBarInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: account } = useGetSimAccount();
  const activeTab = searchParams.get("tab") ?? SIMULATOR_TABS[0].id;

  return (
    <div className="w-full flex justify-between items-center gap-4 border-b-[0.7px] border-[rgba(25,54,63,0.08)]">
      <Tabs
        tabs={SIMULATOR_TABS}
        value={activeTab}
        onChange={(id) => router.push(`/investment-simulator?tab=${id}`)}
        className="flex-1 border-b-0"
      />
      <div className="flex items-center gap-2 shrink-0 pr-1">
        <span className="font-inter text-[11px] font-normal tracking-[-0.44px] text-[rgba(25,54,63,0.45)] max-md:hidden">
          Dinero de práctica
        </span>
        <span className="flex items-center gap-1.5 rounded-[100px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.04)] px-3 py-1 font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
          <span className="size-[6px] rounded-full bg-[#84CC16]" />
          {formatUSD((account?.cashBalanceCents ?? 0) / 100)}
        </span>
      </div>
    </div>
  );
};

const SimulatorTabBar = () => (
  <Suspense>
    <SimulatorTabBarInner />
  </Suspense>
);

export default SimulatorTabBar;
