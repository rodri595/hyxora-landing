"use client";

import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy, useCallback, useEffect, useRef } from "react";

/**
 * Cerebro shell — the read-only analytics side of the admin, backed by the
 * cross-project API served by the gateway at /admin (see `hooks/cerebro/`).
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
  const bodyRef = useRef(null);

  // The scroller lives outside the Suspense boundary, so it survives the module
  // swap and keeps whatever offset the previous tab was left at — land on Sistema
  // from halfway down Costos and you open somewhere in the middle of a tab you
  // have never seen. Jump, don't smooth-scroll: this is a new page, not a move
  // within one, and animating it just delays the content.
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeTab is an intentional re-trigger, not read in the body.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [activeTab]);

  const handleTabChange = useCallback(
    (id) => {
      if (id === activeTab) return;
      router.push(`/admin?tab=cerebro&sub=${id}`);
    },
    [activeTab, router]
  );

  return (
    // No card chrome below `sm`: a bordered, padded box inside the already-padded
    // admin section is two frames around the same content, and on a phone that
    // second frame costs more width than it earns. The panels inside carry their
    // own borders, so the grouping still reads.
    <div className="flex flex-col flex-1 w-0 min-h-0 h-full overflow-hidden py-2.5 sm:rounded-xl sm:border-[0.7px] sm:border-[rgba(25,54,63,0.08)] sm:px-4 sm:py-3 sm:shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
      {/* overflow-x-auto: Tabs is a plain flex row with no wrap, and 8 labels
          clip on narrow viewports. data-lenis-prevent so a sideways swipe on the
          strip moves the strip instead of being eaten by Lenis. */}
      <Tabs
        tabs={CEREBRO_TABS}
        value={activeTab}
        onChange={handleTabChange}
        className="mb-3 shrink-0 overflow-x-auto overscroll-x-contain"
        data-lenis-prevent
      />

      {/* The tab body is this page's real scroller. Lenis smooth-scrolls the
          document, which this sits inside and never reaches, so without the opt-out
          a wheel or touch drag here scrolls nothing at all. */}
      <div
        ref={bodyRef}
        className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden"
        data-lenis-prevent
      >
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
