"use client";

import { useGetSystemMonitoring } from "@/hooks/cerebro/useGetSystemMonitoring";
import { useGetLiquidation } from "@/hooks/monitoring/useGetLiquidation";
import { useGetServiceHealth } from "@/hooks/monitoring/useGetServiceHealth";
import { useGetSolanaFunding } from "@/hooks/monitoring/useGetSolanaFunding";
import { cn } from "@/utils";
import { formatUsd, timeAgo } from "@/utils/format";
import Panel, { RefreshButton } from "../../../shared/Panel";
import QueryState from "../../../shared/QueryState";
import LiquidationList from "./LiquidationList";
import ServiceGrid from "./ServiceGrid";
import SubsidyRunway from "./SubsidyRunway";

const TONES = {
  bad: "border-red-200 bg-red-50 text-red-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  muted: "border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.03)] text-[rgba(25,54,63,0.6)]",
};

const Banner = ({ tone, children }) => (
  <div
    className={cn(
      "rounded-lg border-[0.7px] px-3 py-2 font-inter text-[11px] font-medium leading-[1.5] tracking-[-0.44px]",
      TONES[tone]
    )}
  >
    {children}
  </div>
);

const Section = ({ title, meta, children, footnote }) => (
  <div>
    <h4 className="mb-2 flex flex-wrap items-baseline gap-x-2 font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
      {title}
      {meta && (
        <span className="font-normal tabular-nums text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          {meta}
        </span>
      )}
    </h4>
    {children}
    {footnote && (
      <p className="mt-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
        {footnote}
      </p>
    )}
  </div>
);

/**
 * The one line that answers «do I need to do something».
 *
 * It leads the panel because the three blocks below cost four scans to reach the
 * same conclusion, and most days the conclusion is no. Failed checks outrank a
 * clean bill of health on purpose: a Zerion call that 500s and a treasury with
 * nothing in it both render zero rows, and only one of them is good news.
 */
const Verdict = ({ downCount, fundingLow, runwayLow, liquidation, failed }) => {
  const problems = downCount + (fundingLow ? 1 : 0) + (runwayLow ? 1 : 0);

  const unchecked = failed.length > 0 && (
    <Banner tone="muted">No se pudo comprobar: {failed.join(", ")}.</Banner>
  );

  if (problems > 0) {
    const details = [
      downCount > 0 &&
        `${downCount} ${downCount === 1 ? "servicio no responde" : "servicios no responden"}`,
      fundingLow && "fee-payer de Solana bajo mínimo",
      runwayLow && "crédito de Pimlico bajo",
    ].filter(Boolean);

    return (
      <div className="flex flex-col gap-1.5">
        <Banner tone="bad">
          {problems === 1 ? "1 aviso requiere" : `${problems} avisos requieren`} atención —{" "}
          {details.join(" · ")}
        </Banner>
        {unchecked}
      </div>
    );
  }

  if (unchecked) return unchecked;

  if (liquidation?.actionable) {
    return (
      <Banner tone="warn">
        Comisiones listas para liquidar — {formatUsd(liquidation.totalUsd, { decimals: 2 })} en
        tokens no estables, cambiar a USDC
      </Banner>
    );
  }

  return <Banner tone="good">Todo en orden · subsidio financiado · nada que liquidar</Banner>;
};

/**
 * Monitorización — the four operational checks, in one card.
 *
 *   1. Liveness  — staging and prod, API and App, are answering.
 *   2. Funding   — the Solana fee-payer still has SOL to sponsor xStock trades.
 *   3. Runway    — Pimlico's sponsorship credit isn't about to run dry.
 *   4. Liquidate — fee tokens have accrued past the alert threshold and should
 *                  be swapped to USDC before volatility bites.
 *
 * They were three separate panels, each with its own refresh button, and nothing
 * tying them together: answering «is anything wrong right now» meant reading all
 * three headers and doing the arithmetic yourself. One card, one verdict, one
 * refresh — the shape the old dashboard's Monitoring card used.
 *
 * Three of the four are ours (`/api/monitoring/*`): they hit the RPC, the ping
 * targets and Zerion on request, so they say what is true now rather than
 * whenever a cron last ran. `pimlicoRunway` is the exception — see `SubsidyRunway`.
 */
const MonitoringPanel = () => {
  const services = useGetServiceHealth();
  const funding = useGetSolanaFunding();
  const liquidation = useGetLiquidation();
  const monitoring = useGetSystemMonitoring();

  const queries = [services, funding, liquidation, monitoring];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);

  const refetchAll = () => {
    for (const query of queries) query.refetch();
  };

  const rows = services.data?.services ?? [];
  const downCount = rows.filter((row) => row.status !== "up").length;
  const runway = monitoring.data?.pimlicoRunway ?? null;
  const wallets = liquidation.data?.wallets ?? [];
  const threshold = liquidation.data?.threshold;

  const failed = [
    services.error && "estado de servicios",
    funding.error && "fee-payer de Solana",
    monitoring.error && "margen de Pimlico",
    liquidation.error && "liquidación",
  ].filter(Boolean);

  const attention =
    downCount > 0 || funding.data?.low || runway?.low || liquidation.data?.actionable;

  return (
    <Panel
      title="Monitorización"
      description="Estado de servicios, margen de subsidio y comisiones listas para liquidar. Se cachea brevemente — «Actualizar» vuelve a ejecutar todas las comprobaciones ahora."
      tone={attention || failed.length > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={refetchAll} isLoading={isFetching} />}
    >
      <div className="flex flex-col gap-4">
        {!isLoading && (
          <Verdict
            downCount={downCount}
            fundingLow={funding.data?.low ?? false}
            runwayLow={runway?.low ?? false}
            liquidation={liquidation.data}
            failed={failed}
          />
        )}

        <Section
          title="Estado de servicios"
          meta={
            services.data?.checkedAt ? `comprobado ${timeAgo(services.data.checkedAt)}` : undefined
          }
          footnote="Un 401 o 404 cuenta como «arriba»: estos hosts piden autenticación, así que que te rechacen ya demuestra que el proceso vive. Un 5xx no cuenta — algo escucha, pero el servicio detrás está roto. Los errores de red y los timeouts también son caída."
        >
          <QueryState
            isLoading={services.isLoading}
            error={services.error}
            isEmpty={rows.length === 0}
            emptyLabel="No hay URLs de monitorización configuradas (MONITOR_*_URL)."
          >
            <ServiceGrid services={rows} />
          </QueryState>
        </Section>

        <Section
          title="Margen de subsidio"
          footnote="El fee-payer se lee en directo del RPC. El margen de Pimlico viene de Cerebro, que lo deriva del depósito registrado menos el gasto: Pimlico nunca expone el crédito restante."
        >
          <SubsidyRunway fundingQuery={funding} monitoringQuery={monitoring} />
        </Section>

        <Section
          title="Liquidación"
          meta={
            threshold !== undefined
              ? `comisiones no estables ≥ ${formatUsd(threshold, { decimals: 2 })} → cambiar a USDC`
              : undefined
          }
          footnote="Se excluyen estables (USDC, USDT, EURC…) y tokens de gas nativos (SOL, ETH, BNB, POL, HYPE): unos ya son el destino del cambio, otros son saldo operativo para pagar transacciones y no ingresos por comisiones."
        >
          <QueryState
            isLoading={liquidation.isLoading}
            error={liquidation.error}
            isEmpty={wallets.length === 0}
            emptyLabel="No hay tesorerías configuradas."
          >
            <LiquidationList wallets={wallets} />
          </QueryState>
        </Section>
      </div>
    </Panel>
  );
};

export default MonitoringPanel;
