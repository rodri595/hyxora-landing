"use client";

import { cerebroOperationLabels } from "@/constants/cerebro";
import { useGetPnlOperations } from "@/hooks/cerebro/useGetPnlOperations";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { SLICE_COLORS } from "./constants";

/**
 * Sub-cent gas costs and twenty-dollar swap fees share these lists, so a fixed
 * precision would either round the small ones to $0.00 or pad the large ones with
 * meaningless zeros.
 */
const money = (value) => {
  const size = Math.abs(value ?? 0);
  if (size === 0) return formatUsd(0, { decimals: 2 });
  if (size >= 1) return formatUsd(value, { decimals: 2 });
  return formatUsd(value, { decimals: size >= 0.01 ? 4 : 6 });
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const slice = payload[0]?.payload;

  return (
    <div className="rounded-xl border-[0.7px] border-[#E2E2E2] bg-white/90 px-3 py-2 shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15)] backdrop-blur-[15px]">
      <div className="flex items-center gap-2">
        <span className="size-[7px] shrink-0 rounded-full" style={{ background: slice?.color }} />
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
          {slice?.label}
        </span>
      </div>
      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)] mt-1">
        {formatNumber(slice?.opsCount)} tx · {money(slice?.value)} · {slice?.share}
      </p>
    </div>
  );
};

/**
 * One functionality breakdown, drawn from `/pnl/operations` rows.
 *
 * Both donuts on this tab render this component with a different `valueKey`, and
 * both share the single query the stats cards already made — react-query serves
 * three panels from one request.
 *
 * Only categories with a value are listed. The equivalent panel on the Ingresos tab
 * deliberately shows the zeros too, because there the question is "which product
 * lines earn anything"; here the question is how one total splits up, and empty
 * rows just push the real ones off screen.
 *
 * @param {Object} props
 * @param {{ from: string, to: string }} props.filters
 * @param {"feesUsd" | "costUsd"} props.valueKey
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.emptyLabel
 */
const OperationDonutPanel = ({ filters, valueKey, title, description, emptyLabel }) => {
  const { data, error, isLoading, isFetching, refetch } = useGetPnlOperations(filters);

  const { slices, total } = useMemo(() => {
    const rows = (data?.rows ?? [])
      .map((row) => ({
        operation: row.operation,
        label: cerebroOperationLabels[row.operation] ?? row.operation ?? "—",
        opsCount: row.opsCount ?? 0,
        value: row[valueKey] ?? 0,
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);

    const sum = rows.reduce((acc, row) => acc + row.value, 0);

    return {
      total: sum,
      slices: rows.map((row, index) => ({
        ...row,
        color: SLICE_COLORS[index % SLICE_COLORS.length],
        share: sum > 0 ? `${((row.value / sum) * 100).toFixed(1)}%` : "—",
      })),
    };
  }, [data, valueKey]);

  return (
    <Panel
      title={title}
      description={`${description} Del ${filters.from} al ${filters.to}.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && slices.length === 0}
        emptyLabel={emptyLabel}
      >
        <div className="relative mx-auto w-full max-w-[300px]">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius={66}
                outerRadius={94}
                paddingAngle={1}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((row) => (
                  <Cell key={row.operation} fill={row.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-inter text-[15px] font-semibold tabular-nums tracking-[-0.6px] text-[#19363F]">
            {money(total)}
          </span>
        </div>

        <div className="flex flex-col mt-3">
          {slices.map((row) => (
            <div
              key={row.operation}
              className="flex items-center gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.05)] py-2 last:border-b-0"
            >
              <span
                className="size-[7px] shrink-0 rounded-full"
                style={{ background: row.color }}
              />
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
                {row.label}
              </span>
              <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.45)] ml-auto">
                {formatNumber(row.opsCount)} tx
              </span>
              <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] w-[92px] text-right">
                {money(row.value)}
              </span>
            </div>
          ))}
        </div>
      </QueryState>
    </Panel>
  );
};

export default OperationDonutPanel;
