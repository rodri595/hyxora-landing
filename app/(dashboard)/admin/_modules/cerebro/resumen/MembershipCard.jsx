"use client";

import Spinner from "@/components/Spinner";
import { cerebroOperationLabel, cerebroPlanLabel } from "@/constants/cerebro";
import { useGetPnlOperations } from "@/hooks/cerebro/useGetPnlOperations";
import { cn } from "@/utils";
import { formatNumber, formatUsd, formatUsdPrecise } from "@/utils/format";
import { useMemo } from "react";

const money = (value, { signed = false } = {}) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${signed && value > 0 ? "+" : ""}${formatUsdPrecise(value)}`;
};

const Figure = ({ label, value, tone }) => (
  <div className="flex flex-col items-center gap-0.5 flex-1">
    <span className="font-inter text-[9px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.4)]">
      {label}
    </span>
    <span
      className={cn(
        "font-inter text-[14px] font-semibold tabular-nums tracking-[-0.56px]",
        tone === "cost"
          ? "text-red-600"
          : tone === "revenue"
            ? "text-emerald-700"
            : "text-[#19363F]"
      )}
    >
      {value}
    </span>
  </div>
);

const SectionLabel = ({ children }) => (
  <span className="font-inter text-[9px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.4)] block mb-1.5">
    {children}
  </span>
);

/**
 * One plan's P&L for the selected window.
 *
 * The per-functionality breakdown is a second `/pnl/operations` call scoped with
 * `plan` — `/pnl/membership` returns plan totals but no split. It's deliberately
 * given only `from`, `to` and `plan`: `/pnl/membership` ignores the op, chain and
 * user filters, so narrowing this table by them would make it stop adding up to
 * the totals printed directly above it.
 *
 * @param {Object} props
 * @param {{ plan: string, usersCount: number, feesUsd: number, costUsd: number, marginUsd: number, topHoldings: { symbol: string, totalUsd: number }[] }} props.row
 * @param {{ from: string, to: string }} props.filters
 */
const MembershipCard = ({ row, filters }) => {
  const breakdown = useGetPnlOperations({
    from: filters.from,
    to: filters.to,
    plan: row.plan,
  });

  const operations = useMemo(
    () =>
      (breakdown.data?.rows ?? [])
        .filter((op) => (op.feesUsd ?? 0) !== 0 || (op.costUsd ?? 0) !== 0)
        .sort((a, b) => (b.marginUsd ?? 0) - (a.marginUsd ?? 0)),
    [breakdown.data]
  );

  const holdings = useMemo(() => {
    const rows = [...(row.topHoldings ?? [])].sort((a, b) => (b.totalUsd ?? 0) - (a.totalUsd ?? 0));
    const max = rows[0]?.totalUsd ?? 0;
    return rows.map((holding) => ({
      ...holding,
      width: max > 0 ? Math.max((holding.totalUsd / max) * 100, 1) : 0,
    }));
  }, [row.topHoldings]);

  return (
    <section className="flex flex-col rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-3.5 shadow-[0px_2px_12px_0px_rgba(25,54,63,0.06)]">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-inter text-[13px] font-semibold tracking-[-0.52px] text-[#19363F]">
          {cerebroPlanLabel(row.plan)}
        </h4>
        <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
          {formatNumber(row.usersCount)} usuarios
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-[rgba(25,54,63,0.025)] px-3 py-2.5 mt-2.5">
        <Figure label="Ingresos" value={money(row.feesUsd)} tone="revenue" />
        <Figure label="Gastos" value={money(row.costUsd)} tone="cost" />
        <Figure
          label="Margen"
          value={money(row.marginUsd, { signed: true })}
          tone={(row.marginUsd ?? 0) < 0 ? "cost" : "revenue"}
        />
      </div>

      <div className="mt-3.5">
        <SectionLabel>Por funcionalidad</SectionLabel>

        {breakdown.isLoading ? (
          <div className="flex justify-center py-3">
            <Spinner className="size-4" />
          </div>
        ) : operations.length === 0 ? (
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)] py-1">
            Sin actividad en la ventana.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-[0.7px] border-[rgba(25,54,63,0.08)]">
                <th className="text-left font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] pb-1">
                  Funcionalidad
                </th>
                <th className="text-right font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] pb-1">
                  Ingresos
                </th>
                <th className="text-right font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] pb-1">
                  Gastos
                </th>
                <th className="text-right font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] pb-1">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr
                  key={op.operation}
                  className="border-b-[0.7px] border-[rgba(25,54,63,0.05)] last:border-b-0"
                >
                  <td className="py-1.5 font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
                    {cerebroOperationLabel(op.operation ?? op.op)}
                  </td>
                  <td className="py-1.5 text-right font-inter text-[11px] tabular-nums tracking-[-0.44px] text-emerald-700">
                    {money(op.feesUsd)}
                  </td>
                  <td className="py-1.5 text-right font-inter text-[11px] tabular-nums tracking-[-0.44px] text-red-600">
                    {money(op.costUsd)}
                  </td>
                  <td
                    className={cn(
                      "py-1.5 text-right font-inter text-[11px] font-medium tabular-nums tracking-[-0.44px]",
                      (op.marginUsd ?? 0) < 0 ? "text-red-600" : "text-[#19363F]"
                    )}
                  >
                    {money(op.marginUsd, { signed: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {holdings.length > 0 && (
        <div className="mt-3.5">
          <SectionLabel>Activos en cartera</SectionLabel>

          <div className="flex flex-col gap-2">
            {holdings.map((holding) => (
              <div key={holding.symbol} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
                    {holding.symbol}
                  </span>
                  <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
                    {formatUsd(holding.totalUsd, { decimals: 0 })}
                  </span>
                </div>
                <span className="h-1 w-full rounded-full bg-[rgba(25,54,63,0.06)] overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-[#2D68FF]"
                    style={{ width: `${holding.width}%` }}
                  />
                </span>
              </div>
            ))}
          </div>

          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.35)] mt-2">
            Las barras están a escala del activo más grande del plan. No son el % de la cartera:
            /pnl/membership devuelve el top de posiciones pero no el total sobre el que calcularlo.
          </p>
        </div>
      )}
    </section>
  );
};

export default MembershipCard;
