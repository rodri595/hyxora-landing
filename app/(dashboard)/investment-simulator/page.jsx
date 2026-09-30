"use client";
import Spinner from "@/components/Spinner";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useEffect } from "react";
import SimulatorHeader, { SIMULATOR_TABS } from "./_modules/SimulatorHeader";

const AssetsModule = lazy(() => import("./_modules/AssetsModule"));
const HyxoraInModule = lazy(() => import("./_modules/HyxoraInModule"));

const moduleMap = {
  assets: AssetsModule,
  "hyxora-in": HyxoraInModule,
};

const SimulatorContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: account, isLoading } = useGetSimAccount();

  const isAllowed = account?.user?.status === "active" || account?.user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAllowed) {
      router.replace("/");
    }
  }, [isLoading, isAllowed, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  if (!isAllowed) return null;

  const activeTab = searchParams.get("tab") ?? SIMULATOR_TABS[0].id;

  const Module = moduleMap[activeTab] ?? moduleMap.assets;

  return (
    <section
      className="flex-1 flex flex-col gap-4 justify-start items-start p-4 h-full min-h-0 overflow-y-auto"
      data-lenis-prevent
    >
      <SimulatorHeader activeTab={activeTab} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full">
            <Spinner />
          </div>
        }
      >
        <Module />
      </Suspense>
    </section>
  );
};

const InvestmentSimulatorPage = () => (
  <Suspense>
    <SimulatorContent />
  </Suspense>
);

export default InvestmentSimulatorPage;
