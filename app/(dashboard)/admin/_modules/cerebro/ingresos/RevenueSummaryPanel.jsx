"use client";

import { useGetCostsTotals } from "@/hooks/cerebro/useGetCostsTotals";
import { useGetFeesTotals } from "@/hooks/cerebro/useGetFeesTotals";
import { useGetNftFees } from "@/hooks/cerebro/useGetNftFees";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { REVENUE_DAYS } from "./constants";

/**
 * Sum that stays null when nothing came back, so a missing block shows "—"
 * instead of a confident $0.
 *
 * @param {...(number | null | undefined)} values
 * @return {number | null}
 */
const addUsd = (...values) => {
  const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  return numbers.length > 0 ? numbers.reduce((total, value) => total + value, 0) : null;
};

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

  const revenue30d = addUsd(feesEvm?.last30dUsd, feesSolana?.last30dUsd);
  const revenue7d = addUsd(feesEvm?.last7dUsd, feesSolana?.last7dUsd);
  const revenueLifetime = addUsd(feesEvm?.lifetimeUsd, feesSolana?.lifetimeUsd);
  const cost30d = addUsd(costsEvm?.last30dUsd, costsSolana?.last30dUsd);
  const margin30d = revenue30d === null || cost30d === null ? null : revenue30d - cost30d;

  // Both halves have to be present: a Solana net of $0 because the cost side is
  // missing looks like break-even, which it isn't.
  const solanaNet =
    typeof feesSolana?.last30dUsd === "number" && typeof costsSolana?.last30dUsd === "number"
      ? feesSolana.last30dUsd - costsSolana.last30dUsd
      : null;

  return (
    <Panel
      title="Ingresos"
      description="Comisiones de usuario que llegaron al tesoro. Los importes se guardan en USD al precio del momento de ingreso, así que no se mueven con el mercado."
      action={<RefreshButton onClick={refetchAll} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={formatUsd(revenue30d)}
            label={`Ingresos ${REVENUE_DAYS}d`}
            hint="Comisiones de usuario EVM + tesoro de comisiones Solana"
          />
          <StatCard
            value={formatUsd(revenue7d)}
            label="Ingresos 7d"
            hint="Última semana — tendencia a corto plazo"
          />
          <StatCard
            value={formatUsd(revenueLifetime)}
            label="Ingresos (histórico)"
            hint="Todo el histórico, EVM + Solana"
          />
          <StatCard
            value={formatUsd(margin30d)}
            label={`Margen ${REVENUE_DAYS}d`}
            tone={margin30d !== null && margin30d < 0 ? "warning" : "neutral"}
            hint={`Ingresos ${formatUsd(revenue30d)} − gastos ${formatUsd(cost30d)}`}
          />
        </div>

        <div className="flex flex-col gap-2 mt-2.5">
          <StreamStrip
            title="Solana"
            meta={`${formatNumber(feesSolana?.fees)} comisiones · ${formatNumber(
              costsSolana?.last30dOps
            )} ops patrocinadas ${REVENUE_DAYS}d`}
            hint="El contador de comisiones de Solana no trae ventana en admin.md — se muestra tal cual lo devuelve /fees/totals."
            items={[
              { label: "Comisiones", value: formatUsd(feesSolana?.last30dUsd) },
              { label: "Gastos", value: formatUsd(costsSolana?.last30dUsd), tone: "negative" },
              {
                label: "Neto",
                value: formatUsd(solanaNet),
                tone: solanaNet !== null && solanaNet < 0 ? "negative" : "positive",
              },
            ]}
          />

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

        <div className="mt-2.5">
          <PendingEndpoint
            needs="La cabecera del dashboard original muestra la dirección del tesoro y cuántos tokens/vaults hay en lista blanca, y ofrece un botón de resincronizar. Cerebro es de solo lectura y no expone ninguna de las tres cosas: la lista blanca vive en la API de Hyxora (pestaña Comisiones) y no se cruza aquí a propósito."
            fields={[
              "GET /system/treasury → address por cadena",
              "GET /system/whitelist/count → tokens, vaults",
            ]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default RevenueSummaryPanel;
