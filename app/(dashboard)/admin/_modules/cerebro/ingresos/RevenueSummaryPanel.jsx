"use client";

import { useGetCostsTotals } from "@/hooks/cerebro/useGetCostsTotals";
import { useGetFeesTotals } from "@/hooks/cerebro/useGetFeesTotals";
import { useGetNftFees } from "@/hooks/cerebro/useGetNftFees";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback } from "react";
import { AnimatedMoney } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { sumDefined } from "../../shared/aggregate";
import { REVENUE_DAYS } from "./constants";

/**
 * One-line summary strip for a revenue stream that sits outside the main EVM
 * numbers (Solana treasury, Founder NFT sales).
 */
const StreamStrip = ({ title, meta, hint, items }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)] px-3 py-2.5">
    <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
      {title}
    </span>

    {meta && (
      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)] bg-white border-[0.7px] border-[rgba(25,54,63,0.08)] rounded-full px-2 py-0.5">
        {meta}
      </span>
    )}

    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 ml-auto">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
            {item.label}
          </span>
          <span
            className={cn(
              "font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px]",
              item.tone === "negative"
                ? "text-red-600"
                : item.tone === "positive"
                  ? "text-emerald-700"
                  : "text-[#19363F]"
            )}
          >
            {item.value}
          </span>
        </span>
      ))}
    </div>

    {hint && (
      <span className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.35)] basis-full">
        {hint}
      </span>
    )}
  </div>
);

/**
 * Headline revenue: fee totals over three windows plus the 30-day margin.
 *
 * "Ingresos" here means user fees that reached the treasury — EVM plus the Solana
 * xStock treasury. Founder NFT sales are revenue too but land in a different
 * endpoint and are shown apart, exactly as `/fees/totals` reports them.
 */
const RevenueSummaryPanel = () => {
  const fees = useGetFeesTotals();
  const costs = useGetCostsTotals();
  const nft = useGetNftFees({ days: REVENUE_DAYS });

  const queries = [fees, costs, nft];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const error = queries.find((query) => query.error)?.error ?? null;

  const refetchAll = useCallback(() => {
    fees.refetch();
    costs.refetch();
    nft.refetch();
  }, [fees.refetch, costs.refetch, nft.refetch]);

  const feesEvm = fees.data?.evm;
  const feesSolana = fees.data?.solana;
  const costsEvm = costs.data?.evm;
  const costsSolana = costs.data?.solana;

  const revenue30d = sumDefined(feesEvm?.last30dUsd, feesSolana?.last30dUsd);
  const revenue7d = sumDefined(feesEvm?.last7dUsd, feesSolana?.last7dUsd);
  const revenueLifetime = sumDefined(feesEvm?.lifetimeUsd, feesSolana?.lifetimeUsd);
  const cost30d = sumDefined(costsEvm?.last30dUsd, costsSolana?.last30dUsd);
  const margin30d = revenue30d === null || cost30d === null ? null : revenue30d - cost30d;

  // Solana is reported lifetime, not over the 30-day window, mirroring the panel
  // this replaced: the fee treasury sees a handful of transfers in total, so a
  // 30-day slice of it is empty on almost every day and the strip renders "—".
  const solanaFeesUsd = feesSolana?.lifetimeUsd;
  const solanaCostUsd = costsSolana?.lifetimeUsd;
  const solanaFeeCount = feesSolana?.fees;
  const solanaOps = costsSolana?.lifetimeOps;

  // Both halves have to be present: a Solana net of $0 because the cost side is
  // missing looks like break-even, which it isn't.
  const solanaNet =
    typeof solanaFeesUsd === "number" && typeof solanaCostUsd === "number"
      ? solanaFeesUsd - solanaCostUsd
      : null;

  // Nothing indexed yet is not the same as a break-even treasury — the original
  // dashboard dropped this card entirely until the first fee or op landed.
  const hasSolana = (solanaFeeCount ?? 0) > 0 || (solanaOps ?? 0) > 0;

  return (
    <Panel
      title="Ingresos"
      description="Comisiones de usuario que llegaron al tesoro. Los importes se guardan en USD al precio del momento de ingreso, así que no se mueven con el mercado."
      action={<RefreshButton onClick={refetchAll} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={<AnimatedMoney value={revenue30d} />}
            label={`Ingresos ${REVENUE_DAYS}d`}
            hint="Comisiones de usuario EVM + tesoro de comisiones Solana"
          />
          <StatCard
            value={<AnimatedMoney value={revenue7d} />}
            label="Ingresos 7d"
            hint="Última semana — tendencia a corto plazo"
          />
          <StatCard
            value={<AnimatedMoney value={revenueLifetime} />}
            label="Ingresos (histórico)"
            hint="Todo el histórico, EVM + Solana"
          />
          <StatCard
            value={<AnimatedMoney value={margin30d} />}
            label={`Margen ${REVENUE_DAYS}d`}
            tone={margin30d !== null && margin30d < 0 ? "warning" : "neutral"}
            hint={`Ingresos ${formatUsd(revenue30d)} − gastos ${formatUsd(cost30d)}`}
          />
        </div>

        <div className="flex flex-col gap-2 mt-2.5">
          {hasSolana && (
            <StreamStrip
              title="Solana"
              meta={`${formatNumber(solanaFeeCount)} ${
                solanaFeeCount === 1 ? "comisión" : "comisiones"
              } · ${formatNumber(solanaOps)} ops patrocinadas`}
              hint="Tesoro de comisiones de Solana (entradas de stablecoins y xStocks) menos lo que el fee-payer gastó patrocinando operaciones. Cifras históricas, no de la ventana de arriba: son unas pocas transferencias en total, así que 30 días no dicen nada."
              items={[
                { label: "Comisiones", value: formatUsd(solanaFeesUsd, { decimals: 4 }) },
                {
                  label: "Gastos",
                  value: formatUsd(solanaCostUsd, { decimals: 4 }),
                  tone: "negative",
                },
                {
                  label: "Neto",
                  value: formatUsd(solanaNet, { decimals: 4 }),
                  tone: solanaNet !== null && solanaNet < 0 ? "negative" : "positive",
                },
              ]}
            />
          )}

          <StreamStrip
            title="NFT Founder"
            meta={`${formatNumber(nft.data?.recent?.sales)} ventas ${REVENUE_DAYS}d · ${formatNumber(
              nft.data?.allTime?.sales
            )} históricas`}
            hint="Ventas primarias de NFT. No están incluidas en las tarjetas de arriba: /fees/totals cuenta solo comisiones de usuario."
            items={[
              { label: `${REVENUE_DAYS}d`, value: formatUsd(nft.data?.recent?.totalUsd) },
              { label: "Histórico", value: formatUsd(nft.data?.allTime?.totalUsd) },
            ]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default RevenueSummaryPanel;
