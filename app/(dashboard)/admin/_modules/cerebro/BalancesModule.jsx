"use client";

import AssetSearchPanel from "./balances/AssetSearchPanel";
import TopTokensPanel from "./balances/TopTokensPanel";
import TopVaultsPanel from "./balances/TopVaultsPanel";

/**
 * Cerebro API only (see CLAUDE.md).
 *
 * The two tables are one `/holdings` request — react-query dedups them. The search
 * on top is the section that has no endpoint: /holdings is a top-N ranking, and a
 * search that only looks inside it would report "nadie tiene este activo" for
 * anything below the cut.
 */
const BalancesModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <AssetSearchPanel />
    <TopTokensPanel />
    <TopVaultsPanel />
  </div>
);

export default BalancesModule;
