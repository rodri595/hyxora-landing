"use client";

import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetCostsTotals } from "@/hooks/cerebro/useGetCostsTotals";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { useGetPnlOperations } from "@/hooks/cerebro/useGetPnlOperations";
import { formatNumber, formatUsd, formatUsdPrecise } from "@/utils/format";
import { useCallback, useMemo } from "react";
import { AnimatedCount, AnimatedMoney } from "../../shared/AnimatedValue";
import { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { sumDefined } from "../../shared/aggregate";

const GroupLabel = ({ children, note }) => (
  <div className="flex items-baseline gap-2 mb-2">
    <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
      {children}
    </span>
    {note && (
      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.3)]">
        {note}
      </span>
    )}
  </div>
);

/** Highest-value row of a holdings list, or null when the list is empty. */
const topOf = (rows) =>
  (rows ?? []).reduce(
    (best, row) => (best === null || (row.totalUsd ?? 0) > (best.totalUsd ?? 0) ? row : best),
    null
  );

/**
 * The headline numbers, split the way the ported dashboard splits them.
 *
 * The first group answers "what happened in the window you selected" and moves
 * with every filter. The second answers "where do we stand right now" and
 * deliberately does not: TVL, the user count and the top holdings are snapshots of
 * today, and `/holdings` takes no plan or date filter at all. Mixing a filtered
 * period figure with an unfiltered current one under the same heading is how you
 * end up quoting a Founder-only revenue next to an everyone TVL.
 *
 * @param {Object} props
 * @param {{ from: string, to: string, plan?: string, op?: string, chain?: string, user?: string }} props.filters
 */
const SummaryStatsPanel = ({ filters }) => {
  const pnl = useGetPnlOperations(filters);
  const costs = useGetCostsTotals();
  const overview = useGetOverview();
  const holdings = useGetHoldings({ limit: 25 });

  const queries = [pnl, costs, overview, holdings];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const error = queries.find((query) => query.error)?.error ?? null;

  const refetchAll = useCallback(() => {
    pnl.refetch();
    costs.refetch();
    overview.refetch();
    holdings.refetch();
  }, [pnl.refetch, costs.refetch, overview.refetch, holdings.refetch]);

  const totals = pnl.data?.totals;
  const lifetimeOps = sumDefined(costs.data?.evm?.lifetimeOps, costs.data?.solana?.lifetimeOps);

  const topAsset = useMemo(() => topOf(holdings.data?.tokens), [holdings.data]);
  const topVault = useMemo(() => topOf(holdings.data?.vaults), [holdings.data]);

  const planSummary = useMemo(() => {
    const rows = [...(overview.data?.usersByPlan ?? [])]
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 2);
    return rows
      .map((row) => `${cerebroPlanLabel(row.plan)}: ${formatNumber(row.count)}`)
      .join(" · ");
  }, [overview.data]);

  return (
    <section className="flex flex-col gap-4">
      <QueryState isLoading={isLoading} error={error}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <GroupLabel note={`${filters.from} → ${filters.to}`}>Del período</GroupLabel>
            <RefreshButton onClick={refetchAll} isLoading={isFetching} />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <StatCard
              value={<AnimatedMoney value={totals?.feesUsd} precise />}
              label="Ingresos"
              hint={`${filters.from} → ${filters.to}`}
            />
            <StatCard
              value={<AnimatedMoney value={totals?.costUsd} precise />}
              label="Gastos"
              hint={`${formatNumber(totals?.opsCount)} ops`}
            />
            <StatCard
              value={<AnimatedMoney value={totals?.marginUsd} precise />}
              label="Margen"
              tone={
                typeof totals?.marginUsd === "number" && totals.marginUsd < 0
                  ? "warning"
                  : "neutral"
              }
              hint={`Ingresos ${formatUsdPrecise(totals?.feesUsd)} − gastos ${formatUsdPrecise(
                totals?.costUsd
              )}`}
            />
            <StatCard
              value={<AnimatedCount value={totals?.opsCount} />}
              label="Txs patrocinadas"
              hint={`${formatNumber(totals?.usersCount)} usuarios activos · ${formatNumber(
                lifetimeOps
              )} histórico`}
            />
          </div>
        </div>

        <div>
          <GroupLabel note="a hoy — no se filtra por período">Estado actual</GroupLabel>

          <div className="flex flex-wrap gap-2.5">
            <StatCard
              value={<AnimatedMoney value={overview.data?.medianTvl?.totalUsd} decimals={0} />}
              label="TVL"
              hint="Suma de los portafolios de los usuarios"
            />
            <StatCard
              value={formatNumber(overview.data?.totalUsers)}
              label="Usuarios"
              hint={`${planSummary || "—"} · +${formatNumber(
                overview.data?.newUsers30d
              )} nuevos (30d)`}
            />
            <StatCard
              value={topAsset?.symbol ?? "—"}
              label="Activo principal"
              hint={`${formatUsd(topAsset?.totalUsd, { decimals: 0 })} · ${formatNumber(
                topAsset?.holders
              )} titulares`}
            />
            <StatCard
              value={topVault?.vaultName ?? "—"}
              label="Vault principal"
              hint={`${formatUsd(topVault?.totalUsd, { decimals: 0 })} · ${formatNumber(
                topVault?.holders
              )} titulares · ${topVault?.symbol ?? "—"}`}
            />
          </div>
        </div>
      </QueryState>
    </section>
  );
};

export default SummaryStatsPanel;
