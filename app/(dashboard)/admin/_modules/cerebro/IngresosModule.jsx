"use client";

import DailyRevenuePanel from "./ingresos/DailyRevenuePanel";
import FeeTaggingPanel from "./ingresos/FeeTaggingPanel";
import LatestUserFeesPanel from "./ingresos/LatestUserFeesPanel";
import RevenueByChainPanel from "./ingresos/RevenueByChainPanel";
import RevenueByChainTokenPanel from "./ingresos/RevenueByChainTokenPanel";
import RevenueByOperationPanel from "./ingresos/RevenueByOperationPanel";
import RevenueSummaryPanel from "./ingresos/RevenueSummaryPanel";

/**
 * Cerebro API only (see CLAUDE.md). Panel order mirrors the dashboard the backend
 * team built: totales, serie diaria, desgloses, y al final el diagnóstico y el
 * detalle fila a fila.
 *
 * Everything on this tab is 30 días except «Ingresos por cadena», whose endpoint
 * doesn't accept a window — the panel says so.
 */
const IngresosModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <RevenueSummaryPanel />
    <DailyRevenuePanel />
    <RevenueByOperationPanel />
    <RevenueByChainPanel />
    <RevenueByChainTokenPanel />
    <FeeTaggingPanel />
    <LatestUserFeesPanel />
  </div>
);

export default IngresosModule;
