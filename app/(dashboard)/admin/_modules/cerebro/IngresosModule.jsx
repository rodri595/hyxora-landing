"use client";

import { useState } from "react";
import DailyRevenuePanel from "./ingresos/DailyRevenuePanel";
import FeeTaggingPanel from "./ingresos/FeeTaggingPanel";
import LatestUserFeesPanel from "./ingresos/LatestUserFeesPanel";
import RevenueByChainPanel from "./ingresos/RevenueByChainPanel";
import RevenueByChainTokenPanel from "./ingresos/RevenueByChainTokenPanel";
import RevenueByOperationPanel from "./ingresos/RevenueByOperationPanel";
import RevenueSummaryPanel from "./ingresos/RevenueSummaryPanel";
import WhitelistToggle from "./ingresos/WhitelistToggle";

/**
 * Cerebro API only (see CLAUDE.md). Panel order mirrors the dashboard the backend
 * team built: totales, serie diaria, desgloses, y al final el diagnóstico y el
 * detalle fila a fila.
 *
 * Everything on this tab is 30 días except «Ingresos por cadena», whose endpoint
 * doesn't accept a window — the panel says so.
 *
 * `includeNonWhitelisted` lives here rather than in each panel: the old dashboard
 * drove its whole Earnings page from one `?raw=1` link, and three panels filtering
 * independently made it possible to read a whitelisted total next to a raw one. The
 * four panels that don't take the prop have no such parameter on their endpoint.
 */
const IngresosModule = () => {
  const [includeNonWhitelisted, setIncludeNonWhitelisted] = useState(false);

  return (
    <div className="flex flex-col gap-3.5 py-3 pb-8">
      <WhitelistToggle value={includeNonWhitelisted} onChange={setIncludeNonWhitelisted} />
      <RevenueSummaryPanel />
      <DailyRevenuePanel />
      <RevenueByOperationPanel />
      <RevenueByChainPanel includeNonWhitelisted={includeNonWhitelisted} />
      <RevenueByChainTokenPanel includeNonWhitelisted={includeNonWhitelisted} />
      <FeeTaggingPanel />
      <LatestUserFeesPanel includeNonWhitelisted={includeNonWhitelisted} />
    </div>
  );
};

export default IngresosModule;
