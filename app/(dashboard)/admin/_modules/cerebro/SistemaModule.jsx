"use client";

import ConnectionPanel from "./sistema/ConnectionPanel";
import SentryPanel from "./sistema/SentryPanel";
import SystemStatusPanel from "./sistema/SystemStatusPanel";
import TvlFreshnessPanel from "./sistema/TvlFreshnessPanel";
import UnpricedPositionsPanel from "./sistema/UnpricedPositionsPanel";
import UserActivationPanel from "./sistema/UserActivationPanel";
import MonitoringPanel from "./sistema/monitoring/MonitoringPanel";

/**
 * Mixed-source tab, like Planes (see CLAUDE.md).
 *
 * «Monitorización» is the operational card Cerebro does not serve and cannot: it
 * reads live infrastructure — HTTP pings, a Solana RPC, Zerion on the treasury
 * wallets. Those credentials live server-side and it reaches them through our own
 * `/api/monitoring/*` routes. Its one Cerebro-sourced figure is the Pimlico
 * margin, which can only come from an unfiltered op ledger.
 *
 * Below the divider is what Cerebro serves. Several of those panels read
 * `/system/health`; react-query dedupes them on the shared query key, so it is
 * one request and one cache entry, not four.
 */
const SistemaModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <MonitoringPanel />
    {/* <SentryPanel /> */}

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
