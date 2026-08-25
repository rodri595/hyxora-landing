"use client";

import TopTokensPanel from "./balances/TopTokensPanel";
import TopVaultsPanel from "./balances/TopVaultsPanel";

/**
 * Cerebro API only.
 *
 * Both tables are one `/holdings` request — react-query dedups them. Expanding a row
 * asks `/holdings/holders` for that asset alone, lazily, so an unopened row costs
 * nothing. Fetched apart from `/holdings` on purpose: a failing holder query costs
 * the expanded list and leaves the aggregate numbers standing.
 *
 * This tab used to be the third exception to the «cerebro/ calls Cerebro only» rule.
 * `/holdings` is an aggregate with no way to ask who is behind a number, so the
 * holder lists came from `/api/monitoring/holdings-index`, a route that rebuilt the
 * join by sweeping every user's portfolio. `/holdings/holders` does it in SQL
 * upstream; the route is gone and the exception with it.
 */
const BalancesModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <TopTokensPanel />
    <TopVaultsPanel />
  </div>
);

export default BalancesModule;
