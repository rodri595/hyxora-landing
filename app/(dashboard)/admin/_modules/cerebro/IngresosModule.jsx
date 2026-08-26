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
 * Everything on this tab is 30 días except three panels, each of which says so in
 * its header: «Ingresos por cadena» is all-time because its endpoint takes no
 * window at all, and «Ingresos por cadena × token» and «Diagnóstico de etiquetado»
 * both default to a year — the old dashboard ran those two queries lifetime, and
 * reading them at 30 días dropped every token, and every tagging bucket, whose last
 * fee was older than the window.
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
