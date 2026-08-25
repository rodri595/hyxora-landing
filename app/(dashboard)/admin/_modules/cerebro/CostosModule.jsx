"use client";

import CostsByChainPanel from "./costos/CostsByChainPanel";
import CostsByOperationPanel from "./costos/CostsByOperationPanel";
import CostsByPlanPanel from "./costos/CostsByPlanPanel";
import CostsSummaryPanel from "./costos/CostsSummaryPanel";
import DailyGasPanel from "./costos/DailyGasPanel";
import ExpensiveOpsPanel from "./costos/ExpensiveOpsPanel";
import GasLimitsPanel from "./costos/GasLimitsPanel";

/**
 * Cerebro API only, bar the gas ceilings (see CLAUDE.md). Panel order mirrors the
 * dashboard the backend team built: totales, serie diaria, límites, los tres
 * desgloses y el detalle.
 *
 * The full sponsored-op feed used to be an ask; `/costs/recent` now serves it, so
 * the divider is gone and the two op tables sit together — `/costs/recent` for the
 * whole ledger, `/costs/expensive` for the outliers above a threshold, which is
 * still the faster way to find something worth looking at.
 */
const CostosModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <CostsSummaryPanel />
    <DailyGasPanel />
    <GasLimitsPanel />
    <CostsByPlanPanel />
    <CostsByOperationPanel />
    <CostsByChainPanel />
    <ExpensiveOpsPanel />
  </div>
);

export default CostosModule;
