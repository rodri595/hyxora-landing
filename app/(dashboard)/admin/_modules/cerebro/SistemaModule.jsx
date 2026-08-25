"use client";

import ConnectionPanel from "./sistema/ConnectionPanel";
import LiquidationPanel from "./sistema/LiquidationPanel";
import SentryPanel from "./sistema/SentryPanel";
import ServicesPanel from "./sistema/ServicesPanel";
import SponsorshipPanel from "./sistema/SponsorshipPanel";
import SystemStatusPanel from "./sistema/SystemStatusPanel";
import TvlFreshnessPanel from "./sistema/TvlFreshnessPanel";
import UnpricedPositionsPanel from "./sistema/UnpricedPositionsPanel";
import UserActivationPanel from "./sistema/UserActivationPanel";

/**
 * Mixed-source tab, like Planes (see CLAUDE.md).
 *
 * The first three panels are operational checks Cerebro does not serve and
 * cannot: they read live infrastructure — HTTP pings, a Solana RPC, Zerion on
 * the treasury wallets. Those credentials live server-side and the panels reach
 * them through our own `/api/monitoring/*` routes.
 *
 * Below the divider is what Cerebro serves. Several of those panels read
 * `/system/health`; react-query dedupes them on the shared query key, so it is
 * one request and one cache entry, not four.
 */
const SistemaModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <ServicesPanel />
    <SponsorshipPanel />
    <LiquidationPanel />
    <SentryPanel />

    <div className="flex items-center gap-3 pt-1">
      <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.35)] whitespace-nowrap">
        Disponible en Cerebro
      </span>
      <span className="h-px flex-1 bg-[rgba(25,54,63,0.08)]" />
    </div>

    <TvlFreshnessPanel />
    <UnpricedPositionsPanel />
    <UserActivationPanel />
    <SystemStatusPanel />
    <ConnectionPanel />
  </div>
);

export default SistemaModule;
