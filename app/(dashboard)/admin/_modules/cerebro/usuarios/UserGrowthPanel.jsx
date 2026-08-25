"use client";

import { useGetUserStats } from "@/hooks/cerebro/useGetUserStats";
import { formatNumber, lastNDays, toDayString } from "@/utils/format";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { GROWTH_DAYS, GROWTH_LINE, RECENT_DAYS } from "./constants";

const AXIS = "rgba(25,54,63,0.4)";
const GRID = "rgba(25,54,63,0.08)";

const ChartTooltip = (props) => {
  const { visible, payload, label } = useHeldTooltip(props.active, props.payload, props.label);
  if (!payload) return null;
  const point = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] mb-1">
        {label}
      </p>
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
        <span className="font-semibold tabular-nums text-[#19363F]">
          {formatNumber(point?.users)}
        </span>{" "}
        usuarios
        {point?.count > 0 && (
          <span className="text-emerald-700"> · +{formatNumber(point.count)} ese día</span>
        )}
      </p>
    </TooltipSurface>
  );
};

/**
 * Turns the daily signup counts into the running total the chart draws.
 *
 * Walked backwards from `totalUsers` rather than forwards from zero: the series
 * only covers the window, so counting up from 0 would draw a product that launched
 * 90 days ago. Anchoring the last point to `totalUsers` also keeps the curve and
 * the headline figure from disagreeing.
 *
 * @param {{ day: string, count: number }[]} signups
 * @param {number | null | undefined} totalUsers
 * @param {string} from "YYYY-MM-DD"
 * @param {number} days
 * @return {{ day: string, count: number, users: number }[]}
 */
const toCumulative = (signups, totalUsers, from, days) => {
  if (typeof totalUsers !== "number" || !Number.isFinite(totalUsers)) return [];

  const byDay = new Map((signups ?? []).map((point) => [point.day, point.count ?? 0]));
  const start = new Date(`${from}T00:00:00`);

  // Zero-fill first, so a week without signups draws a flat line rather than
  // collapsing the x-axis onto the days that happen to have rows.
  const filled = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const day = toDayString(date);
    return { day, count: byDay.get(day) ?? 0 };
  });

  let running = totalUsers;
  const series = new Array(filled.length);
  for (let index = filled.length - 1; index >= 0; index -= 1) {
    series[index] = { ...filled[index], users: running };
    running -= filled[index].count;
  }
  return series;
};

/**
 * Cumulative user count over the window, with the signups that produced it.
 */
const UserGrowthPanel = () => {
  const range = useMemo(() => lastNDays(GROWTH_DAYS), []);
  const { data, error, isLoading, isFetching, refetch } = useGetUserStats({ days: GROWTH_DAYS });

  const series = useMemo(
    () => toCumulative(data?.signups, data?.totalUsers, range.from, GROWTH_DAYS),
    [data, range.from]
  );

  // Summed off the series rather than read from `newUsers`, which reports the
  // requested window (90 días) and not the 30 quoted here.
  const recentSignups = useMemo(
    () => series.slice(-RECENT_DAYS).reduce((total, point) => total + point.count, 0),
    [series]
  );

  return (
    <Panel
      title={`Crecimiento de usuarios (últimos ${GROWTH_DAYS} días)`}
      description={`Total acumulado de usuarios registrados, del ${range.from} al ${range.to}.`}
      action={
        <div className="flex items-center gap-2.5">
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.45)] whitespace-nowrap hidden sm:inline">
            {formatNumber(data?.totalUsers)} usuarios ·{" "}
            <span className="text-emerald-700">
              +{formatNumber(recentSignups)} últimos {RECENT_DAYS}d
            </span>
          </span>
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && series.length === 0}
        emptyLabel="Sin datos de registro en la ventana."
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="cerebroGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GROWTH_LINE} stopOpacity={0.22} />
                <stop offset="100%" stopColor={GROWTH_LINE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="day"
              tickFormatter={(value) => value.slice(5).split("-").reverse().join("/")}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(value) => formatNumber(value)}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: GRID }}
              wrapperStyle={tooltipWrapperStyle}
            />
            <Area
              type="monotone"
              dataKey="users"
              name="Usuarios"
              stroke={GROWTH_LINE}
              strokeWidth={1.6}
              fill="url(#cerebroGrowthFill)"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </QueryState>
    </Panel>
  );
};

export default UserGrowthPanel;
