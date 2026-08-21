"use client";

import Panel from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";

/**
 * Monitorización — service pings, sponsor-gas runway and fee settlement.
 *
 * None of this exists in the v1 API (admin.md): there is no health-ping endpoint
 * for the API/App environments, no Solana fee-payer balance, no Pimlico deposit
 * tracking, and no treasury sweep. The original dashboard almost certainly reads
 * these from its own server routes.
 *
 * Left as an explicit ask rather than a mocked layout — every figure on this
 * panel is a balance someone would act on.
 */
const MonitoringPanel = () => (
  <Panel
    title="Monitorización"
    description="Estado de servicios en vivo, margen de subsidio de gas y alertas de liquidación de comisiones."
  >
    <div className="flex flex-col gap-2.5">
      <PendingEndpoint
        needs="Estado de servicios: latencia y código HTTP de API y App en staging y producción."
        fields={["GET /system/services"]}
      />

      <PendingEndpoint
        needs="Margen de subsidio: saldo del fee-payer de Solana contra su mínimo, y depósito de Pimlico con gasto diario y días restantes estimados."
        fields={["GET /system/gas-runway", "POST /system/pimlico-balance"]}
      />

      <PendingEndpoint
        needs="Liquidación: comisiones en tokens no estables por encima del umbral, por tesorería (Solana y EVM), listas para cambiar a USDC."
        fields={["GET /fees/treasury/settleable?threshold="]}
      />
    </div>
  </Panel>
);

export default MonitoringPanel;
