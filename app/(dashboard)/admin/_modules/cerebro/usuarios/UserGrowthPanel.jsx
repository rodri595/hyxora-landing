"use client";

import { useGetUserStats } from "@/hooks/cerebro/useGetUserStats";
import { formatNumber, toDayString } from "@/utils/format";
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
 * Normalises whatever `/users/stats` puts in the day field down to "YYYY-MM-DD".
 *
 * admin.md documents a plain date, but a Postgres `date_trunc` serialises as a
 * full ISO timestamp, and matching that raw string against a locally built
 * calendar misses every single day. The failure is silent and looks plausible:
 * every count resolves to 0, so the backwards walk never decrements and the
 * chart draws a flat line at `totalUsers` instead of the growth curve.
 *
 * @param {unknown} value
 * @return {string} "" when there is nothing date-shaped to key on.
 */
const toDayKey = (value) => (typeof value === "string" ? value.slice(0, 10) : "");

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Ceiling on the zero-fill, so one malformed date can't spin a render loop. */
const MAX_SPAN_DAYS = 400;

/** Names the daily figure has been seen under. `count` is what admin.md documents. */
const COUNT_KEYS = ["count", "signups", "newUsers", "users", "total"];

/**
 * Resolves the daily figure on a signup row, and reports which key it came from.
 *
 * Reading `point.count` alone is what left this chart flat at `totalUsers`: the
 * day parses, the calendar lines up, every count silently reads 0 and the result
 * looks like a real answer. Known aliases are tried in order, then any other
 * number on the row — the date fields and booleans excepted.
 *
 * @param {Record<string, unknown>} point
 * @return {{ value: number, key: string | null }}
 */
const toCount = (point) => {
  for (const key of [...COUNT_KEYS, ...Object.keys(point ?? {})]) {
    if (key === "day" || key === "date") continue;
    const raw = point?.[key];
    if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return { value, key };
  }
  return { value: 0, key: null };
};

/**
 * Turns the daily signup counts into the running total the chart draws.
 *
 * The calendar is derived from the rows themselves, never from `new Date()`.
 * Cerebro resolves `?days=` against its own clock, so building the span locally
 * and probing it misses everything the moment the two disagree — and it misses
 * silently: every count falls back to 0, the walk below never decrements, and a
 * flat line at `totalUsers` gets drawn as if it were growth.
 *
 * Walked backwards from `totalUsers` rather than forwards from zero: the series
 * only covers the window, so counting up from 0 would draw a product that launched
 * 90 days ago. Anchoring the last point to `totalUsers` also keeps the curve and
 * the headline figure from disagreeing.
 *
 * @param {{ day: string, count: number }[]} signups
 * @param {number | null | undefined} totalUsers
 * @return {{ series: { day: string, count: number, users: number }[], rows: number, counted: number, countKey: string | null, span: { from: string, to: string } | null }}
 */
const toCumulative = (signups, totalUsers) => {
  const rows = Array.isArray(signups) ? signups : [];
  const dated = rows
    .map((point) => {
      const { value, key } = toCount(point);
      return { day: toDayKey(point?.day), count: value, key };
    })
    .filter((point) => DAY_PATTERN.test(point.day))
    .sort((a, b) => a.day.localeCompare(b.day));

  if (dated.length === 0 || typeof totalUsers !== "number" || !Number.isFinite(totalUsers)) {
    return { series: [], rows: rows.length, counted: 0, countKey: null, span: null };
  }

  const countKey = dated.find((point) => point.key)?.key ?? null;
  const counted = dated.reduce((total, point) => total + point.count, 0);
  const span = { from: dated[0].day, to: dated[dated.length - 1].day };
  const byDay = new Map(dated.map((point) => [point.day, point.count]));
  const start = new Date(`${span.from}T00:00:00`);
  const end = new Date(`${span.to}T00:00:00`);
  const length = Math.min(Math.round((end - start) / 86_400_000) + 1, MAX_SPAN_DAYS);

  // Zero-fill the gaps, so a quiet week draws a flat stretch rather than
  // collapsing the x-axis onto the days that happen to have rows.
  const filled = Array.from({ length }, (_, index) => {
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
  return { series, rows: rows.length, counted, countKey, span };
};

/**
 * Cumulative user count over the window, with the signups that produced it.
 */
const UserGrowthPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetUserStats({ days: GROWTH_DAYS });

  const { series, rows, counted, countKey, span } = useMemo(
    () => toCumulative(data?.signups, data?.totalUsers),
    [data]
  );

  // Summed off the series rather than read from `newUsers`, which reports the
  // requested window (90 días) and not the 30 quoted here.
  const recentSignups = useMemo(
    () => series.slice(-RECENT_DAYS).reduce((total, point) => total + point.count, 0),
    [series]
  );

  // Rows came back but none carried a "YYYY-MM-DD" day, so there is no calendar
  // to plot them against. Quote the first row verbatim rather than an empty
  // chart — the field name is the one thing needed to fix it.
  const malformed = rows > 0 && series.length === 0 ? JSON.stringify(data?.signups?.[0]) : null;

  // The calendar lines up and the rows parsed, but every day came back at zero —
  // so the curve is a flat line at `totalUsers`. That is a real render of the
  // response, not growth, and it should not be left to look like growth.
  const allZero = series.length > 0 && counted === 0 && Number(data?.totalUsers) > 0;

  return (
    <Panel
      title={`Crecimiento de usuarios (últimos ${GROWTH_DAYS} días)`}
      description={
        span
          ? `Total acumulado de usuarios registrados, del ${span.from} al ${span.to}.`
          : "Total acumulado de usuarios registrados."
      }
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
        emptyLabel={
          malformed
            ? `/users/stats devolvió ${rows} filas sin una fecha "YYYY-MM-DD" en \`day\`. La primera llegó así: ${malformed}`
            : "Sin datos de registro en la ventana."
        }
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

        {allZero && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
            Los {rows} días de <code>signups</code> llegaron a 0
            {countKey ? ` (leído de \`${countKey}\`)` : " y sin ningún campo numérico"}, así que la
            curva sale plana en {formatNumber(data?.totalUsers)} — es la respuesta tal cual, no
            crecimiento. Primera fila: {JSON.stringify(data?.signups?.[0])}
          </p>
        )}
      </QueryState>
    </Panel>
  );
};

export default UserGrowthPanel;
