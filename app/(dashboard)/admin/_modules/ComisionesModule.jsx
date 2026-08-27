"use client";

import FeeMatrixPanel from "./comisiones/FeeMatrixPanel";
import PlansPanel from "./comisiones/PlansPanel";
import WhitelistedTokensPanel from "./comisiones/WhitelistedTokensPanel";
import WhitelistedVaultsPanel from "./comisiones/WhitelistedVaultsPanel";

/**
 * Fee schema and whitelists — configuration served by the **Hyxora backend**
 * (`utils/axios.js`), which is why this is a top-level admin tab and not part of
 * Cerebro. See CLAUDE.md: everything under `_modules/cerebro/` talks to the
 * Cerebro API only, and none of this data exists there.
 *
 * Plans and the matrix share one /admin/fees query via react-query's cache.
 */
const ComisionesModule = () => (
  <div
    className="flex flex-col gap-3.5 py-3 pb-8 w-full min-w-0 overflow-y-auto overflow-x-hidden"
    data-lenis-prevent
  >
    <PlansPanel />
    <FeeMatrixPanel />
    <WhitelistedTokensPanel />
    <WhitelistedVaultsPanel />
  </div>
);

export default ComisionesModule;
