"use client";

import ConnectionPanel from "./sistema/ConnectionPanel";
import MonitoringPanel from "./sistema/MonitoringPanel";
import SentryPanel from "./sistema/SentryPanel";
import SystemStatusPanel from "./sistema/SystemStatusPanel";
import TvlFreshnessPanel from "./sistema/TvlFreshnessPanel";
import UnpricedPositionsPanel from "./sistema/UnpricedPositionsPanel";
import UserActivationPanel from "./sistema/UserActivationPanel";

/**
 * Panel order mirrors the dashboard the backend team built.
 *
 * Several panels read /system/health; react-query dedupes them on the shared
 * query key, so this is one request and one cache entry, not four. Hitting
 * "Actualizar" on any of them refreshes all of them.
 */
const SistemaModule = () => (
  <div className="flex flex-col gap-3.5 py-3 pb-8">
    <MonitoringPanel />
    <SentryPanel />
    <TvlFreshnessPanel />
    <UnpricedPositionsPanel />
    <UserActivationPanel />
    <SystemStatusPanel />
    <ConnectionPanel />
  </div>
);

export default SistemaModule;
