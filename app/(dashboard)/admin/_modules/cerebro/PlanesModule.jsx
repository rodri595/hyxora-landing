"use client";

import FeeMatrixPanel from "./planes/FeeMatrixPanel";
import PlanDistributionPanel from "./planes/PlanDistributionPanel";
import PlanEconomicsPanel from "./planes/PlanEconomicsPanel";
import PlanesPanel from "./planes/PlanesPanel";
import WhitelistedTokensPanel from "./planes/WhitelistedTokensPanel";
import WhitelistedVaultsPanel from "./planes/WhitelistedVaultsPanel";

/**
 * Mixed-source tab — the one place the «cerebro/ calls Cerebro only» rule is
 * relaxed, deliberately (see CLAUDE.md).
 *
 * The first four sections are the plan *schema* — what we charge and what we
 * accept — which Cerebro does not serve at all: its /fees/* endpoints report fee
 * revenue collected, not the fee table. They come from the Hyxora app backend
 * through `/api/app-api`, which holds the bot token server-side.
 *
 * Below the divider is the plan data Cerebro does serve: distribution and
 * economics, i.e. what those plans actually earned.
 */
const PlanesModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <PlanesPanel />
    <FeeMatrixPanel />
    <WhitelistedTokensPanel />
    <WhitelistedVaultsPanel />

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
