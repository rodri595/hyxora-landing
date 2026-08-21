"use client";

import FeeMatrixPendingPanel from "./planes/FeeMatrixPendingPanel";
import PlanDistributionPanel from "./planes/PlanDistributionPanel";
import PlanEconomicsPanel from "./planes/PlanEconomicsPanel";
import PlanesPanel from "./planes/PlanesPanel";
import WhitelistedTokensPendingPanel from "./planes/WhitelistedTokensPendingPanel";
import WhitelistedVaultsPendingPanel from "./planes/WhitelistedVaultsPendingPanel";

/**
 * Cerebro API only (see CLAUDE.md).
 *
 * The first four sections mirror the ported dashboard's «Planes» tab. None of
 * that data exists in admin.md — Cerebro's /fees/* endpoints report fee revenue
 * collected, not the fee schema — so each one states the endpoint and response
 * shape we need instead of reaching across to the Hyxora API.
 *
 * The last two are the plan data Cerebro *does* serve today.
 */
const PlanesModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <PlanesPanel />
    <FeeMatrixPendingPanel />
    <WhitelistedTokensPendingPanel />
    <WhitelistedVaultsPendingPanel />

    <div className="flex items-center gap-3 pt-1">
      <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.35)] whitespace-nowrap">
        Disponible en Cerebro
      </span>
      <span className="h-px flex-1 bg-[rgba(25,54,63,0.08)]" />
    </div>

    <PlanDistributionPanel />
    <PlanEconomicsPanel />
  </div>
);

export default PlanesModule;
