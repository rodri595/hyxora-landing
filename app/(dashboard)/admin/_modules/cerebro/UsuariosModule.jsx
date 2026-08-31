"use client";

import AppTvlPanel from "./usuarios/AppTvlPanel";
import TopFeePayersPanel from "./usuarios/TopFeePayersPanel";
import UserGrowthPanel from "./usuarios/UserGrowthPanel";
import UsersTablePanel from "./usuarios/UsersTablePanel";

/**
 * Cerebro API only (see CLAUDE.md).
 *
 * The two charts sit side by side above the table, as in the dashboard the backend
 * team built. Both draw a real curve now: users from `/users/stats`, TVL from
 * `/users/trends`, which is the first TVL *history* the API exposes — every other
 * TVL field is a snapshot of right now.
 *
 * Top fee payers goes last because it reads off the same table above it, narrowed to
 * the head of the list: the question it answers is concentration, and that only makes
 * sense once you have seen the whole population.
 */
const UsuariosModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      <UserGrowthPanel />
      <AppTvlPanel />
    </div>

    <UsersTablePanel />
    <TopFeePayersPanel />
  </div>
);

export default UsuariosModule;
