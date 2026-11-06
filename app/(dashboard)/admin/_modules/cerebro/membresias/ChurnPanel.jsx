"use client";

import { useGetMembershipsChurn } from "@/hooks/cerebro/useGetMembershipsChurn";
import { formatNumber, toDayString } from "@/utils/format";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import { PanelNote } from "../../shared/Explanations";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { firstNumber } from "../../shared/aggregate";
import FilterSelect from "../costos/FilterSelect";
import { CHURN_DAYS, CHURN_WINDOWS, MEMBERSHIP_HISTORY_START } from "./constants";

const AXIS = "rgba(25,54,63,0.68)";
const GRID = "rgba(25,54,63,0.08)";

const COLORS = {
  activations: "#10B981",
  upgrades: "#3B82F6",
  churned: "#F43F5E",
  downgrades: "#F59E0B",
  net: "#19363F",
};

const LEGEND = [
  { color: COLORS.activations, label: "Altas" },
  { color: COLORS.upgrades, label: "Subidas de plan" },
  { color: COLORS.churned, label: "Bajas efectivas" },
  { color: COLORS.downgrades, label: "Bajadas de plan" },
  { color: COLORS.net, label: "Neto" },
];

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Ceiling on the zero-fill, so one malformed date can't spin a render loop. */
const MAX_SPAN_DAYS = 400;

const toDay = (value) => (typeof value === "string" ? value.slice(0, 10) : "");
const count = (value) => firstNumber(value) ?? 0;
const formatDay = (day) => day.slice(5).split("-").reverse().join("/");

const TOOLTIP_ROWS = [
  { key: "activations", label: "Altas", color: COLORS.activations },
  { key: "upgrades", label: "Subidas de plan", color: COLORS.upgrades },
  { key: "downgrades", label: "Bajadas de plan", color: COLORS.downgrades },
  { key: "churned", label: "Bajas efectivas", color: COLORS.churned },
  { key: "netMembers", label: "Neto", color: COLORS.net, signed: true },
  { key: "cancellationsRequested", label: "Cancelaciones pedidas" },
  { key: "renewalsPaid", label: "Renovaciones pagadas (estimado)" },
];

const ChartTooltip = (props) => {
  const { visible, payload, label } = useHeldTooltip(props.active, props.payload, props.label);
  if (!payload) return null;
  const point = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.68)] mb-1">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">
        {TOOLTIP_ROWS.map(({ key, label: rowLabel, color, signed }) => {
          const value = point?.[key] ?? 0;
          return (
            <p
              key={key}
              className="flex items-center gap-1.5 font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.75)]"
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: color ?? "rgba(25,54,63,0.2)" }}
              />
              <span>{rowLabel}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums text-[#19363F]">
                {signed && value > 0 ? "+" : ""}
                {formatNumber(value)}
              </span>
            </p>
          );
        })}
      </div>
    </TooltipSurface>
  );
};

/**
 * Turns the `/memberships/churn` rows into one point per calendar day.
 *
 * The calendar runs from the first to the last `day` present in the rows, never
 * from `new Date()`: Cerebro resolves `?days=` against its own clock, and a span
 * built locally that disagrees with it by a day would probe the wrong keys and
 * read every count as 0 without saying so. Days inside that span with no row are
 * real quiet days, so they are filled with zeros.
 *
 * Bajas and bajadas are plotted as `churnedNeg` / `downgradesNeg` (the negative of
 * the count) so they hang below the zero line while altas and subidas stack above
 * it. They sit beside the raw counts rather than replacing them, because the
 * tooltip quotes the absolute figure — a baja is never shown as a negative number.
 *
 * @param {Record<string, unknown>[] | undefined} rows
 * @return {Record<string, number | string>[]}
 */
const toSeries = (rows) => {
  const byDay = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const day = toDay(row?.day);
    if (DAY_PATTERN.test(day)) byDay.set(day, row);
  }
  const days = [...byDay.keys()].sort();
  if (days.length === 0) return [];

  const start = new Date(`${days[0]}T00:00:00`);
  const end = new Date(`${days[days.length - 1]}T00:00:00`);
  const length = Math.min(Math.round((end - start) / 86_400_000) + 1, MAX_SPAN_DAYS);

  return Array.from({ length }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const day = toDayString(date);
    const row = byDay.get(day);
    const churned = count(row?.churned);
    const downgrades = count(row?.downgrades);
    return {
      day,
      activations: count(row?.activations),
      upgrades: count(row?.upgrades),
      downgrades,
      churned,
      churnedNeg: -churned,
      downgradesNeg: -downgrades,
      cancellationsRequested: count(row?.cancellationsRequested),
      renewalsPaid: count(row?.renewalsPaid),
      netMembers: count(row?.netMembers),
    };
  });
};

/**
 * Membership movements per day: who came in, who changed plan, who left.
 *
 * Entries (altas, subidas) stack upward and exits (bajas, bajadas) stack downward
 * from a zero line, with the day's net as a line across them, so a glance says
 * whether the base grew or shrank. The `totals` block drives the tiles; the net is
 * recomputed from its parts rather than summed off the series, so the tile and the
 * formula in the docs can't drift apart.
 *
 * History starts at `MEMBERSHIP_HISTORY_START`: a window reaching further back has
 * no rows there, which is missing data and not zero — the caveat below says so.
 */
const ChurnPanel = () => {
  const [days, setDays] = useState(CHURN_DAYS);
  const { data, error, isLoading, isFetching, refetch } = useGetMembershipsChurn({ days });

  const series = useMemo(() => toSeries(data?.series), [data]);

  const totals = data?.totals;
  const activations = count(totals?.activations);
  const upgrades = count(totals?.upgrades);
  const downgrades = count(totals?.downgrades);
  const churned = count(totals?.churned);
  const net = activations + upgrades - churned - downgrades;

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - days);
  const startsBeforeHistory = toDayString(windowStart) < MEMBERSHIP_HISTORY_START;

  return (
    <Panel
      title="Movimientos de membresía"
      meta={`últimos ${days} días`}
      description="Altas, cambios de plan y bajas de membresía día a día, según el registro de eventos de membresía. El neto es altas + subidas − bajas efectivas − bajadas."
      action={
        <div className="flex items-center gap-2">
          <FilterSelect
            value={days}
            onChange={setDays}
            options={CHURN_WINDOWS}
            label="Ventana de días"
          />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && series.length === 0}
        emptyLabel="Sin movimientos registrados en la ventana."
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <StatCard value={formatNumber(activations)} label="Altas" tone="good" />
          <StatCard value={formatNumber(upgrades)} label="Subidas de plan" />
          <StatCard value={formatNumber(downgrades)} label="Bajadas de plan" />
          <StatCard
            value={formatNumber(count(totals?.cancellationsRequested))}
            label="Cancelaciones pedidas"
            tone={count(totals?.cancellationsRequested) > 0 ? "warning" : "neutral"}
          />
          <StatCard
            value={formatNumber(churned)}
            label="Bajas efectivas"
            tone={churned > 0 ? "warning" : "neutral"}
          />
          <StatCard
            value={`${net > 0 ? "+" : ""}${formatNumber(net)}`}
            label="Neto"
            tone={net > 0 ? "good" : net < 0 ? "warning" : "neutral"}
          />
          <StatCard
            value={formatNumber(count(totals?.renewalsPaid))}
            label="Renovaciones pagadas"
            hint="estimado, no facturas"
          />
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="day"
              tickFormatter={formatDay}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(value) => formatNumber(Math.abs(value))}
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: GRID }}
              wrapperStyle={tooltipWrapperStyle}
            />
            <ReferenceLine y={0} stroke={GRID} />
            <Bar dataKey="activations" name="Altas" stackId="mov" fill={COLORS.activations} />
            <Bar dataKey="upgrades" name="Subidas de plan" stackId="mov" fill={COLORS.upgrades} />
            <Bar dataKey="churnedNeg" name="Bajas efectivas" stackId="mov" fill={COLORS.churned} />
            <Bar
              dataKey="downgradesNeg"
              name="Bajadas de plan"
              stackId="mov"
              fill={COLORS.downgrades}
            />
            <Line
              type="monotone"
              dataKey="netMembers"
              name="Neto"
              stroke={COLORS.net}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {LEGEND.map(({ color, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]"
            >
              <span className="size-1.5 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>

        {startsBeforeHistory && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
            El historial de movimientos empieza el 10/06/2026. Antes de esa fecha no hay filas — no
            son ceros.
          </p>
        )}

        <PanelNote className="mt-2">
          «Renovaciones pagadas» cuenta cada salto de la fecha de renovación que empuja el webhook
          de pagos, así que es una estimación y no un recuento de facturas. Una reactivación cuenta
          como «Alta».
        </PanelNote>
      </QueryState>
    </Panel>
  );
};

export default ChurnPanel;
