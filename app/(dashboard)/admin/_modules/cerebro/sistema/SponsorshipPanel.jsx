"use client";

import { useGetSolanaFunding } from "@/hooks/monitoring/useGetSolanaFunding";
import { formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { AnimatedCount } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

/**
 * Sponsorship runway — how much longer we can keep paying users' gas.
 *
 * The Solana half is live: the fee-payer's SOL balance against its configured
 * floor, priced through DefiLlama. When it runs dry, xStock trading stops.
 *
 * The Pimlico half is *not* an endpoint anywhere. Pimlico's API exposes the
 * configured limit, never the remaining credit, so the original dashboard
 * estimated it: a hand-set deposit figure minus the cost of every sponsored op
 * indexed since that date. Reproducing it needs that ledger — Cerebro's
 * `/costs/*` is the closest thing, but it excludes test accounts and removed
 * chains, and the runway must count those because Pimlico bills for them.
 */
const SponsorshipPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSolanaFunding();

  const low = data?.low ?? false;
  const ratio = data?.ratio ?? null;

  return (
    <Panel
      title="Margen de subsidio de gas"
      description="Saldo del fee-payer de Solana contra su mínimo. Si se agota, se dejan de patrocinar las operaciones de xStocks."
      tone={low ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
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

      <div className="mt-3">
        <PendingEndpoint
          needs="El depósito de Pimlico y los días de margen restantes. No existe como endpoint en ningún sitio: la API de Pimlico expone el límite configurado, no el crédito restante, así que el dashboard original lo estimaba restando el coste de cada op patrocinada indexada desde una fecha de depósito puesta a mano. Para reproducirlo hace falta ese registro de ops sin filtrar — Cerebro excluye cuentas de prueba y cadenas retiradas, y el margen tiene que contarlas porque Pimlico nos las factura igual."
          fields={[
            "GET /system/pimlico-runway → balanceUsd, spentSince, remaining, burnPerDay, daysLeft",
            "o: ops patrocinadas sin filtrar desde una fecha",
          ]}
        />
      </div>
    </Panel>
  );
};

export default SponsorshipPanel;
