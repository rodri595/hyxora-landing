"use client";

import { useGetCostsByChain } from "@/hooks/cerebro/useGetCostsByChain";
import { useGetCostsTotals } from "@/hooks/cerebro/useGetCostsTotals";
import { useGetFeesTotals } from "@/hooks/cerebro/useGetFeesTotals";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback } from "react";
import { AnimatedMoney } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { sumDefined } from "../../shared/aggregate";
import { COST_DAYS } from "./constants";

/**
 * Headline gas spend: what sponsoring user operations cost us over three windows,
 * plus the margin those costs leave against the fees collected in the same 30 days.
 *
 * The 30-day operation count is stitched from `/costs/by-chain`, because
 * `/costs/totals` carries `evm.lifetimeOps` but no `evm.last30dOps` — see the note
 * at the bottom of the panel.
 */
const CostsSummaryPanel = () => {
  const costs = useGetCostsTotals();
  const fees = useGetFeesTotals();
  const byChain = useGetCostsByChain({ days: COST_DAYS });

  const queries = [costs, fees, byChain];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const error = queries.find((query) => query.error)?.error ?? null;

  const refetchAll = useCallback(() => {
    costs.refetch();
    fees.refetch();
    byChain.refetch();
  }, [costs.refetch, fees.refetch, byChain.refetch]);

  const costsEvm = costs.data?.evm;
  const costsSolana = costs.data?.solana;
  const feesEvm = fees.data?.evm;
  const feesSolana = fees.data?.solana;

  const cost30d = sumDefined(costsEvm?.last30dUsd, costsSolana?.last30dUsd);
  const cost7d = sumDefined(costsEvm?.last7dUsd, costsSolana?.last7dUsd);
  const costLifetime = sumDefined(costsEvm?.lifetimeUsd, costsSolana?.lifetimeUsd);

  const revenue30d = sumDefined(feesEvm?.last30dUsd, feesSolana?.last30dUsd);
  const margin30d = revenue30d === null || cost30d === null ? null : revenue30d - cost30d;

  const opsEvm30d = byChain.data?.length
    ? byChain.data.reduce((total, row) => total + (row.opsCount ?? 0), 0)
    : null;
  const ops30d = sumDefined(opsEvm30d, costsSolana?.last30dOps);
  const opsLifetime = sumDefined(costsEvm?.lifetimeOps, costsSolana?.lifetimeOps);

  return (
    <Panel
      title="Gastos"
      description="Gas que patrocinamos por cuenta del usuario. Los importes se registran en USD al precio del momento de la operación, así que no se mueven con el mercado."
      action={
        <div className="flex items-center gap-2.5">
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.45)] whitespace-nowrap hidden sm:inline">
            {formatNumber(ops30d)} ops en los últimos {COST_DAYS} días · histórico{" "}
            {formatNumber(opsLifetime)} ops
          </span>
          <RefreshButton onClick={refetchAll} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={<AnimatedMoney value={cost30d} />}
            label={`Gastos ${COST_DAYS}d`}
            hint="Gas patrocinado (Pimlico EVM + patrocinio Solana)"
          />
          <StatCard
            value={<AnimatedMoney value={cost7d} />}
            label="Gastos 7d"
            hint="Semana más reciente — tendencia a corto plazo"
          />
          <StatCard
            value={<AnimatedMoney value={costLifetime} />}
            label="Gastos (histórico)"
            hint={`${formatNumber(opsLifetime)} ops EVM + patrocinio Solana desde el inicio`}
          />
          <StatCard
            value={<AnimatedMoney value={margin30d} />}
            label={`Margen ${COST_DAYS}d`}
            tone={margin30d !== null && margin30d < 0 ? "warning" : "neutral"}
            hint={`Ingresos ${formatUsd(revenue30d)} − gastos ${formatUsd(cost30d)}`}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default CostsSummaryPanel;
