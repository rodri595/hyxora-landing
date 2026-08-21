"use client";

import { useGetPnlDaily } from "@/hooks/cerebro/useGetPnlDaily";
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
import { REVENUE_DAYS, REVENUE_LINE } from "./constants";

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
        <span className="size-[7px] shrink-0 rounded-full" style={{ background: REVENUE_LINE }} />
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
          Ingresos
        </span>
        <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] ml-auto pl-3">
          {formatUsd(point?.feesUsd, { decimals: 2 })}
        </span>
      </div>
    </div>
  );
};

/**
 * Zero-fills the calendar so a day with no activity draws a $0 point instead of a
 * gap: /pnl/daily omits empty days, and a line that skips them reads as a shorter
 * month rather than a quiet one.
 *
 * @param {{ date: string, feesUsd: number }[]} series
 * @param {string} from "YYYY-MM-DD"
 * @param {number} days
 * @return {{ date: string, feesUsd: number }[]}
 */
const fillDays = (series, from, days) => {
  const byDay = new Map((series ?? []).map((point) => [point.date, point]));
  const start = new Date(`${from}T00:00:00`);

  return Array.from({ length: days }, (_, index) => {
    const day = new Date(start);
    day.setDate(day.getDate() + index);
    const date = toDayString(day);
    return { date, feesUsd: byDay.get(date)?.feesUsd ?? 0 };
  });
};

const DailyRevenuePanel = () => {
  const range = useMemo(() => lastNDays(REVENUE_DAYS), []);
  const { data, error, isLoading, isFetching, refetch } = useGetPnlDaily(range);

  const series = useMemo(() => fillDays(data, range.from, REVENUE_DAYS), [data, range.from]);

  const hasRevenue = (data ?? []).some((point) => (point.feesUsd ?? 0) > 0);

  return (
    <Panel
      title={`Ingresos diarios recibidos (últimos ${REVENUE_DAYS} días)`}
      description={`Comisiones cobradas por día, del ${range.from} al ${range.to}. Los días sin actividad se dibujan a $0 — /pnl/daily los omite.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && !hasRevenue}
        emptyLabel="No hubo comisiones en la ventana."
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="cerebroRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REVENUE_LINE} stopOpacity={0.22} />
                <stop offset="100%" stopColor={REVENUE_LINE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.slice(5)}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(value) => formatUsd(value, { decimals: 0 })}
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
                  Ingresos
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="feesUsd"
              name="Ingresos"
              stroke={REVENUE_LINE}
              strokeWidth={1.6}
              fill="url(#cerebroRevenueFill)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </QueryState>
    </Panel>
  );
};

export default DailyRevenuePanel;
