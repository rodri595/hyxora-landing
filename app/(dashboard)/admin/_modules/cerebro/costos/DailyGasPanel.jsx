"use client";

import { useGetCostsDaily } from "@/hooks/cerebro/useGetCostsDaily";
import { formatUsd, lastNDays, toDayString } from "@/utils/format";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { COST_DAYS, COST_LINE } from "./constants";

const AXIS = "rgba(25,54,63,0.4)";
const GRID = "rgba(25,54,63,0.08)";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="rounded-xl border-[0.7px] border-[#E2E2E2] bg-white/90 px-3 py-2 shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15)] backdrop-blur-[15px]">
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="size-[7px] shrink-0 rounded-full" style={{ background: COST_LINE }} />
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
          Gastos
        </span>
        <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] ml-auto pl-3">
          {formatUsd(point?.costUsd, { decimals: 4 })}
        </span>
      </div>
    </div>
  );
};

/**
 * Zero-fills the calendar so a day without sponsored ops draws a $0 point instead
 * of a gap — a line that skips quiet days reads as a shorter month rather than a
 * cheaper one.
 *
 * `/costs/daily` keys its points on `day`, not `date` like `/pnl/daily`.
 *
 * @param {{ day: string, costUsd: number }[]} series
 * @param {string} from "YYYY-MM-DD"
 * @param {number} days
 * @return {{ day: string, costUsd: number }[]}
 */
const fillDays = (series, from, days) => {
  const byDay = new Map((series ?? []).map((point) => [point.day, point]));
  const start = new Date(`${from}T00:00:00`);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const day = toDayString(date);
    return { day, costUsd: byDay.get(day)?.costUsd ?? 0 };
  });
};

/**
 * Daily sponsored-gas spend. Cost only — fees and margin come back on the same
 * endpoint but live on the Ingresos tab, and overlaying revenue here would bury a
 * spend spike under a much larger scale.
 */
const DailyGasPanel = () => {
  const range = useMemo(() => lastNDays(COST_DAYS), []);
  const { data, error, isLoading, isFetching, refetch } = useGetCostsDaily({ days: COST_DAYS });

  const series = useMemo(() => fillDays(data, range.from, COST_DAYS), [data, range.from]);
  const hasSpend = (data ?? []).some((point) => (point.costUsd ?? 0) > 0);

  return (
    <Panel
      title={`Patrocinio de gas diario (últimos ${COST_DAYS} días)`}
      description={`Coste del gas patrocinado por día, del ${range.from} al ${range.to}. Los días sin operaciones se dibujan a $0.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && !hasSpend}
        emptyLabel="No se patrocinó gas en la ventana."
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="cerebroCostFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COST_LINE} stopOpacity={0.22} />
                <stop offset="100%" stopColor={COST_LINE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="day"
              tickFormatter={(value) => value.slice(5)}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(value) => formatUsd(value, { decimals: 2 })}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID }} />
            <Legend
              align="right"
              verticalAlign="top"
              iconType="circle"
              iconSize={7}
              formatter={() => (
                <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                  Gastos
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="costUsd"
              name="Gastos"
              stroke={COST_LINE}
              strokeWidth={1.6}
              fill="url(#cerebroCostFill)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <p className="font-inter text-[10px] leading-[1.6] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Conciliación con Pimlico: el dashboard original calcula el gasto como gas on-chain × 1.10
          (el recargo de Pimlico), y concilia contra <em>Verifying Paymaster Spending</em> en
          dashboard.pimlico.io. Cerebro devuelve un único <code>costUsd</code> por día, sin separar
          gas de factura, así que desde aquí no se puede cuadrar día a día.
        </p>
      </QueryState>
    </Panel>
  );
};

export default DailyGasPanel;
