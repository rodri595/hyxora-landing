"use client";

import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useCallback } from "react";

/**
 * Cerebro shell — the read-only analytics side of the admin, backed by the
 * cross-project API at admin.hyxora.com (see `hooks/cerebro/`).
 *
 * Tab layout mirrors the dashboard the backend team already built, so the two
 * stay comparable while we port it over.
 *
 * Sub-tab lives in the URL (`?tab=cerebro&sub=costos`) rather than local state:
 * this is a dashboard you refresh and share links to, unlike the inner tabs in
 * UsersModule.
 */
export const CEREBRO_TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "usuarios", label: "Usuarios" },
  { id: "balances", label: "Balances" },
  { id: "costos", label: "Costos" },
  { id: "ingresos", label: "Ingresos" },
  { id: "planes", label: "Planes" },
  { id: "redes", label: "Redes" },
  { id: "sistema", label: "Sistema" },
];

const ResumenModule = lazy(() => import("./cerebro/ResumenModule"));
const UsuariosModule = lazy(() => import("./cerebro/UsuariosModule"));
const BalancesModule = lazy(() => import("./cerebro/BalancesModule"));
const CostosModule = lazy(() => import("./cerebro/CostosModule"));
const IngresosModule = lazy(() => import("./cerebro/IngresosModule"));
const PlanesModule = lazy(() => import("./cerebro/PlanesModule"));
const RedesModule = lazy(() => import("./cerebro/RedesModule"));
const SistemaModule = lazy(() => import("./cerebro/SistemaModule"));

const moduleMap = {
  resumen: ResumenModule,
  usuarios: UsuariosModule,
  balances: BalancesModule,
  costos: CostosModule,
  ingresos: IngresosModule,
  planes: PlanesModule,
  redes: RedesModule,
  sistema: SistemaModule,
};

const CerebroModule = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("sub") ?? CEREBRO_TABS[0].id;
  const Module = moduleMap[activeTab] ?? moduleMap.resumen;

  const handleTabChange = useCallback(
    (id) => {
      if (id === activeTab) return;
      router.push(`/admin?tab=cerebro&sub=${id}`);
    },
    [activeTab, router]
  );

  return (
    <div className="flex flex-col flex-1 w-0 min-h-0 h-full rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden">
      {/* overflow-x-auto: Tabs is a plain flex row with no wrap, and 8 labels
          clip on narrow viewports */}
      <Tabs
        tabs={CEREBRO_TABS}
        value={activeTab}
        onChange={handleTabChange}
        className="mb-3 overflow-x-auto"
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full py-12">
              <Spinner />
            </div>
          }
        >
          <Module />
        </Suspense>
      </div>
    </div>
  );
};

export default CerebroModule;
