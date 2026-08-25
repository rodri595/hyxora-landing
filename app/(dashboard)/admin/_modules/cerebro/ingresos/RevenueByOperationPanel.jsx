"use client";

import { cerebroOperationLabels, cerebroOperations } from "@/constants/cerebro";
import { useGetFeesByOperation } from "@/hooks/cerebro/useGetFeesByOperation";
import { cn } from "@/utils";
import { formatNumber, formatUsd, formatUsdPrecise } from "@/utils/format";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatedMoney } from "../../shared/AnimatedValue";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { REVENUE_COLORS, REVENUE_DAYS } from "./constants";

const DonutTooltip = (props) => {
  const { visible, payload } = useHeldTooltip(props.active, props.payload);
  if (!payload) return null;
  const slice = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <div className="flex items-center gap-2">
        <span className="size-[7px] shrink-0 rounded-full" style={{ background: slice?.color }} />
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
          {slice?.label}
        </span>
      </div>
      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)] mt-1">
        {formatNumber(slice?.opsCount)} tx · {formatUsdPrecise(slice?.feesUsd)}
      </p>
    </TooltipSurface>
  );
};

/**
 * Fee revenue per functionality over the window.
 *
 * Every operation Cerebro knows about is listed, including the ones at zero: the
 * point of the panel is to see which lines of the product are actually earning,
 * and a category that's missing from the response reads very differently from one
 * that's present at $0.
 */
const RevenueByOperationPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeesByOperation({
    days: REVENUE_DAYS,
  });

  const { rows, total } = useMemo(() => {
    const byOperation = new Map((data ?? []).map((row) => [row.operation, row]));

    // Operations the API returned but constants/cerebro.js doesn't list yet —
    // a new op type shouldn't silently vanish from the breakdown.
    const extra = [...byOperation.keys()].filter(
      (operation) => !cerebroOperations.includes(operation)
    );

    const merged = [...cerebroOperations, ...extra]
      .map((operation) => ({
        operation,
        label: cerebroOperationLabels[operation] ?? operation,
        opsCount: byOperation.get(operation)?.opsCount ?? 0,
        feesUsd: byOperation.get(operation)?.feesUsd ?? 0,
      }))
      .sort((a, b) => b.feesUsd - a.feesUsd || b.opsCount - a.opsCount);

    return {
      rows: merged.map((row, index) => ({
        ...row,
        color: REVENUE_COLORS[index % REVENUE_COLORS.length],
      })),
      total: merged.reduce((sum, row) => sum + row.feesUsd, 0),
    };
  }, [data]);

  const slices = rows.filter((row) => row.feesUsd > 0);

  return (
    <Panel
      title={`Ingresos por funcionalidad (${REVENUE_DAYS}d)`}
      description="Lado de ingresos — cada categoría que Hyxora admite, con lo que ha llegado al tesoro hasta ahora."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && slices.length === 0}
        emptyLabel="Ninguna funcionalidad generó comisiones en la ventana."
      >
        <div className="relative mx-auto w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="feesUsd"
                nameKey="label"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={1}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((row) => (
                  <Cell key={row.operation} fill={row.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} wrapperStyle={tooltipWrapperStyle} />
            </PieChart>
          </ResponsiveContainer>

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-inter text-[15px] font-semibold tabular-nums tracking-[-0.6px] text-[#19363F]">
            <AnimatedMoney value={total} />
          </span>
        </div>

        <div className="flex flex-col mt-3">
          {rows.map((row) => {
            const isIdle = row.feesUsd === 0;

            return (
              <div
                key={row.operation}
                className="flex items-center gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.05)] py-2 last:border-b-0"
              >
                <span
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ background: isIdle ? "rgba(25,54,63,0.15)" : row.color }}
                />
                <span
                  className={cn(
                    "font-inter text-[11px] tracking-[-0.44px]",
                    isIdle ? "text-[rgba(25,54,63,0.35)]" : "text-[#19363F]"
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "font-inter text-[10px] tabular-nums tracking-[-0.4px] ml-auto",
                    isIdle ? "text-[rgba(25,54,63,0.25)]" : "text-[rgba(25,54,63,0.45)]"
                  )}
                >
                  {formatNumber(row.opsCount)} tx
                </span>
                <span
                  className={cn(
                    "font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] w-[92px] text-right",
                    isIdle ? "text-[rgba(25,54,63,0.3)]" : "text-[#19363F]"
                  )}
                >
                  {formatUsd(row.feesUsd, { decimals: row.feesUsd > 0 && row.feesUsd < 1 ? 4 : 2 })}
                </span>
              </div>
            );
          })}
        </div>

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
          Cerebro agrupa en estas categorías: las compras/ventas de xStock, los deploys y las
          transferencias internas del dashboard original caen dentro de swap, approve u «otros», así
          que no aparecen como líneas propias.
        </p>
      </QueryState>
    </Panel>
  );
};

export default RevenueByOperationPanel;
