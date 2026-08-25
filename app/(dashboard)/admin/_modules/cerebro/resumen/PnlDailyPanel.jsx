"use client";

import { useGetPnlDaily } from "@/hooks/cerebro/useGetPnlDaily";
import { formatUsd, toDayString } from "@/utils/format";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { COST_COLOR, REVENUE_COLOR, bucketFor } from "./constants";

const AXIS = "rgba(25,54,63,0.4)";
const GRID = "rgba(25,54,63,0.08)";

const BUCKET_LABEL = { day: "día", week: "semana", month: "mes" };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="rounded-xl border-[0.7px] border-[#E2E2E2] bg-white/90 px-3 py-2 shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15)] backdrop-blur-[15px]">
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] mb-1.5">
        {label}
      </p>

      {[
        { key: "feesUsd", name: "Ingresos", color: REVENUE_COLOR },
        { key: "costUsd", name: "Gastos", color: COST_COLOR },
      ].map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="size-[7px] shrink-0 rounded-full" style={{ background: row.color }} />
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {row.name}
          </span>
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] ml-auto pl-4">
            {formatUsd(point?.[row.key], { decimals: 4 })}
          </span>
        </div>
      ))}

      <div className="mt-1.5 pt-1.5 border-t-[0.7px] border-[rgba(25,54,63,0.08)] flex items-center gap-2">
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
          Margen
        </span>
        <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] ml-auto pl-4">
          {formatUsd(point?.marginUsd, { decimals: 4 })}
        </span>
      </div>
    </div>
  );
};

/**
 * Zero-fills the calendar so a quiet day draws an empty slot rather than closing
 * the gap. Only for daily buckets — week and month rows are already a complete
 * sequence, and re-deriving their boundaries here would risk disagreeing with how
 * the API grouped them.
 *
 * @param {{ date: string }[]} series
 * @param {string} from
 * @param {string} to
 * @return {{ date: string, feesUsd: number, costUsd: number, marginUsd: number }[]}
 */
const fillDays = (series, from, to) => {
  const byDate = new Map((series ?? []).map((point) => [point.date, point]));
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return series ?? [];
  }

  const out = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = toDayString(cursor);
    const point = byDate.get(date);
    out.push({
      date,
      feesUsd: point?.feesUsd ?? 0,
      costUsd: point?.costUsd ?? 0,
      marginUsd: point?.marginUsd ?? 0,
    });
  }
  return out;
};

/**
 * Revenue against cost over the selected window. Bars rather than a line: these
 * are per-period totals, not a level that carries between periods.
 *
 * @param {Object} props
 * @param {{ from: string, to: string, plan?: string, op?: string, chain?: string, user?: string }} props.filters
 */
const PnlDailyPanel = ({ filters }) => {
  const bucket = useMemo(() => bucketFor(filters.from, filters.to), [filters.from, filters.to]);

  const { data, error, isLoading, isFetching, refetch } = useGetPnlDaily({ ...filters, bucket });

  const series = useMemo(
    () => (bucket === "day" ? fillDays(data, filters.from, filters.to) : (data ?? [])),
    [data, bucket, filters.from, filters.to]
  );

  const hasActivity = (data ?? []).some(
    (point) => (point.feesUsd ?? 0) > 0 || (point.costUsd ?? 0) > 0
  );

  return (
    <Panel
      title="Costos vs. ingresos"
      description={`Ingresos contra costes agrupados por ${BUCKET_LABEL[bucket]}, del ${filters.from} al ${filters.to} — verde son comisiones recibidas, rojo el gas que subvencionamos. Pasa el cursor por una barra para ver el margen.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && !hasActivity}
        emptyLabel="No hubo movimiento en la ventana seleccionada."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }} barGap={1}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => (bucket === "month" ? value?.slice(0, 7) : value?.slice(5))}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(value) => formatUsd(value, { decimals: 0 })}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(25,54,63,0.04)" }} />
            <Legend
              align="right"
              verticalAlign="top"
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                  {value}
                </span>
              )}
            />
            <Bar dataKey="feesUsd" name="Ingresos" fill={REVENUE_COLOR} radius={[2, 2, 0, 0]} />
            <Bar dataKey="costUsd" name="Gastos" fill={COST_COLOR} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </QueryState>
    </Panel>
  );
};

export default PnlDailyPanel;
