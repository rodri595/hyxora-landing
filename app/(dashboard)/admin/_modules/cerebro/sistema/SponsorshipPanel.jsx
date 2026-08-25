"use client";

import { useGetSystemMonitoring } from "@/hooks/cerebro/useGetSystemMonitoring";
import { useGetSolanaFunding } from "@/hooks/monitoring/useGetSolanaFunding";
import { formatDateTime, formatUsd, shortenHash } from "@/utils/format";
import { AnimatedCount, AnimatedMoney } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

/**
 * Below this many days, a top-up stops being housekeeping and becomes the thing to
 * do today. Only a display threshold — the backend's own `low` flag is what the
 * panel treats as the alarm.
 */
const RUNWAY_WARNING_DAYS = 21;

/**
 * The Pimlico half: how much sponsorship credit is left and how long it lasts.
 *
 * This was the panel's `PendingEndpoint`, and the reason it could not be ours is
 * unchanged — Pimlico's API exposes the configured limit and never the remaining
 * credit, so the figure has to be derived from a recorded deposit minus every
 * sponsored op indexed since. Doing that from `/costs/*` would have undercounted:
 * those endpoints drop test accounts and retired chains, and Pimlico bills for both.
 * `/system/monitoring` does it upstream against the unfiltered ledger.
 *
 * `balanceUsd` is therefore a deposit on record at `asOf`, not a live balance —
 * hence the date next to it. If nobody updates it after a top-up, the runway shrinks
 * to zero and stays there while the account is perfectly funded.
 */
const PimlicoRunway = ({ runway }) => {
  if (!runway) {
    return (
      <p className="font-inter text-[11px] leading-[1.6] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
        `/system/monitoring` no devolvió `pimlicoRunway`. Suele significar que no hay depósito
        registrado en el backend contra el que descontar el gasto.
      </p>
    );
  }

  const low = runway.low ?? false;
  const daysLeft = runway.daysLeft ?? null;
  const short = low || (typeof daysLeft === "number" && daysLeft < RUNWAY_WARNING_DAYS);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <StatCard
          value={<AnimatedCount value={daysLeft} decimals={0} suffix=" días" />}
          label="Margen restante"
          tone={short ? "warning" : "good"}
          hint={
            runway.burnPerDay > 0
              ? `A ${formatUsd(runway.burnPerDay, { decimals: 2 })}/día`
              : "Sin consumo registrado"
          }
        />
        <StatCard
          value={<AnimatedMoney value={runway.remaining} decimals={0} />}
          label="Crédito restante"
          tone={short ? "warning" : "neutral"}
          hint={`Mínimo ${formatUsd(runway.minUsd, { decimals: 0 })}`}
        />
        <StatCard
          value={<AnimatedMoney value={runway.spentSince} decimals={0} />}
          label="Gastado desde el depósito"
          tone="muted"
          hint={`Depósito de ${formatUsd(runway.balanceUsd, { decimals: 0 })}`}
        />
      </div>

      <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
        Es una estimación, no el saldo real: Pimlico no expone el crédito que queda, así que el
        backend resta cada op patrocinada desde el depósito anotado el {formatDateTime(runway.asOf)}
        . Si se recarga la cuenta y no se actualiza esa cifra, el margen baja a cero con la cuenta
        llena.
      </p>
    </>
  );
};

/**
 * Sponsorship runway — how much longer we can keep paying users' gas.
 *
 * Two independent balances, and both have to hold: Solana's fee-payer for xStock
 * trading, Pimlico's credit for everything on EVM.
 *
 * They come from different places on purpose. The Solana half reads our own
 * `/api/monitoring/solana-funding`, which queries the RPC on request, so it is true
 * now rather than whenever a cron last ran. The Pimlico half can only come from
 * Cerebro — see `PimlicoRunway` above.
 */
const SponsorshipPanel = () => {
  const solana = useGetSolanaFunding();
  const monitoring = useGetSystemMonitoring();

  const data = solana.data;
  const low = data?.low ?? false;
  const ratio = data?.ratio ?? null;
  const runway = monitoring.data?.pimlicoRunway ?? null;
  const runwayLow = runway?.low ?? false;

  return (
    <Panel
      title="Margen de subsidio de gas"
      description="Lo que queda para seguir pagando el gas de los usuarios: el fee-payer de Solana para xStocks, el crédito de Pimlico para el resto de cadenas."
      tone={low || runwayLow ? "warning" : "neutral"}
      action={
        <RefreshButton
          onClick={() => {
            solana.refetch();
            monitoring.refetch();
          }}
          isLoading={solana.isFetching || monitoring.isFetching}
        />
      }
    >
      <QueryState isLoading={solana.isLoading} error={solana.error}>
        <div className="flex flex-wrap gap-2">
          <StatCard
            value={<AnimatedCount value={data?.sol} decimals={4} suffix=" SOL" />}
            label="Saldo del fee-payer"
            tone={low ? "warning" : "good"}
            hint={
              data?.valueUsd === null
                ? "Precio de SOL no disponible"
                : `${formatUsd(data?.valueUsd, { decimals: 2 })} · SOL a ${formatUsd(data?.priceUsd, { decimals: 2 })}`
            }
          />
          <StatCard
            value={<AnimatedCount value={data?.minSol} decimals={2} suffix=" SOL" />}
            label="Mínimo configurado"
            tone="muted"
            hint="SOLANA_FUNDING_MIN_SOL"
          />
          <StatCard
            value={<AnimatedCount value={ratio} decimals={1} suffix="×" />}
            label="Veces sobre el mínimo"
            tone={low ? "warning" : ratio !== null && ratio < 2 ? "warning" : "neutral"}
            hint={low ? "Por debajo del mínimo — recargar" : "Por encima del mínimo"}
          />
        </div>

        {data?.address && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
            Fee-payer <code className="font-mono tracking-tight">{shortenHash(data.address)}</code>.
            Con menos de 2× el mínimo conviene recargar antes de que el margen se estreche.
          </p>
        )}
      </QueryState>

      <div className="mt-4 pt-3.5 border-t-[0.7px] border-[rgba(25,54,63,0.08)]">
        <h4 className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F] mb-2.5">
          Crédito de Pimlico (EVM)
        </h4>
        <QueryState isLoading={monitoring.isLoading} error={monitoring.error}>
          <PimlicoRunway runway={runway} />
        </QueryState>
      </div>
    </Panel>
  );
};

export default SponsorshipPanel;
