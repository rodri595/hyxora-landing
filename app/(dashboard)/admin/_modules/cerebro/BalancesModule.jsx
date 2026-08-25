"use client";

import TopTokensPanel from "./balances/TopTokensPanel";
import TopVaultsPanel from "./balances/TopVaultsPanel";

/**
 * Cerebro API, plus one exception.
 *
 * Both tables are one `/holdings` request — react-query dedups them. Expanding a
 * token row is the part Cerebro has no endpoint for: `/holdings` is an aggregate
 * with no way to ask who is behind a number. That list comes from
 * `/api/monitoring/holdings-index`, which rebuilds the join server-side.
 */
const BalancesModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <TopTokensPanel />
    <TopVaultsPanel />
  </div>
);

export default BalancesModule;
