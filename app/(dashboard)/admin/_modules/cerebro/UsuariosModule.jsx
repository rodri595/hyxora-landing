"use client";

import AppTvlPanel from "./usuarios/AppTvlPanel";
import UserGrowthPanel from "./usuarios/UserGrowthPanel";
import UsersTablePanel from "./usuarios/UsersTablePanel";

/**
 * Cerebro API only (see CLAUDE.md).
 *
 * The two charts sit side by side above the table, as in the dashboard the backend
 * team built. TVL shows its current figure but not the curve — admin.md has no TVL
 * history, only snapshots — so that half states what it needs.
 */
const UsuariosModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      <UserGrowthPanel />
      <AppTvlPanel />
    </div>

    <UsersTablePanel />
  </div>
);

export default UsuariosModule;
