"use client";
import { SIMULATOR_TABS } from "@/components/SimulatorTabBar";
import Spinner from "@/components/Spinner";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const AssetsModule = lazy(() => import("./_modules/AssetsModule"));
const HyxoraInModule = lazy(() => import("./_modules/HyxoraInModule"));

const moduleMap = {
  assets: AssetsModule,
  "hyxora-in": HyxoraInModule,
};

const SimulatorContent = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? SIMULATOR_TABS[0].id;

  const Module = moduleMap[activeTab] ?? moduleMap.assets;

  return (
    <section
      className="flex-1 flex flex-col gap-4 justify-start items-start p-4 h-full min-h-0 overflow-y-auto"
      data-lenis-prevent
    >
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
