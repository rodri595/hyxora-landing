"use client";

import CostsByChainPanel from "./costos/CostsByChainPanel";
import CostsByOperationPanel from "./costos/CostsByOperationPanel";
import CostsByPlanPanel from "./costos/CostsByPlanPanel";
import CostsSummaryPanel from "./costos/CostsSummaryPanel";
import DailyGasPanel from "./costos/DailyGasPanel";
import ExpensiveOpsPanel from "./costos/ExpensiveOpsPanel";
import GasLimitsPanel from "./costos/GasLimitsPanel";
import SponsoredOpsPendingPanel from "./costos/SponsoredOpsPendingPanel";

/**
 * Cerebro API only (see CLAUDE.md). Panel order mirrors the dashboard the backend
 * team built: totales, serie diaria, límites, los tres desgloses y el detalle.
 *
 * Two of those sections have no endpoint in admin.md — the gas ceilings live in the
 * app's own config, and the full sponsored-op feed is bigger than what
 * `/costs/expensive` returns — so they state what they need instead of guessing a
 * number. What Cerebro does serve of that last one is rendered under the divider.
 */
const CostosModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <CostsSummaryPanel />
    <DailyGasPanel />
    <GasLimitsPanel />
    <CostsByPlanPanel />
    <CostsByOperationPanel />
    <CostsByChainPanel />
    <SponsoredOpsPendingPanel />

    <div className="flex items-center gap-3 pt-1">
      <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.35)] whitespace-nowrap">
        Disponible en Cerebro
      </span>
      <span className="h-px flex-1 bg-[rgba(25,54,63,0.08)]" />
    </div>

    <ExpensiveOpsPanel />
  </div>
);

export default CostosModule;
