"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetMembershipsTenure } from "@/hooks/cerebro/useGetMembershipsTenure";
import { formatNumber, formatPercent } from "@/utils/format";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import { PanelNote } from "../../shared/Explanations";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { firstNumber, sumColumn } from "../../shared/aggregate";
import { TENURE_BUCKETS, TENURE_DAYS } from "./constants";
import { orderPlans } from "./plans";

const AXIS = "rgba(25,54,63,0.68)";
const GRID = "rgba(25,54,63,0.08)";
const NEW_COLOR = "#3B82F6";
const ACTIVE_COLOR = "#10B981";

const LEGEND = [
  { color: NEW_COLOR, label: "Nuevos" },
  { color: ACTIVE_COLOR, label: "Siguen activos" },
];

/** "2026-05" → "05/26". */
const monthLabel = (month) => `${String(month).slice(5, 7)}/${String(month).slice(2, 4)}`;

const retention = (point) =>
  point?.newMembers > 0
    ? formatPercent((point.stillActive / point.newMembers) * 100, { decimals: 0 })
    : "—";

const cell = (value) =>
  value > 0 ? (
    <span className="tabular-nums text-[rgba(25,54,63,0.85)]">{formatNumber(value)}</span>
  ) : (
    <span className="text-[rgba(25,54,63,0.5)]">—</span>
  );

const numericColumn = (id, header, accessorFn) => ({
  id,
  header,
  accessorFn,
  meta: { align: "right" },
  cell: (info) => cell(info.getValue()),
  footer: ({ table }) => cell(sumColumn(table, id)),
});

const columns = [
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <span className="font-medium text-[#19363F]">{cerebroPlanLabel(info.getValue())}</span>
    ),
    footer: () => "Total",
  },
  ...TENURE_BUCKETS.map(({ id, label }) => numericColumn(id, label, (row) => row[id])),
  numericColumn("total", "Total", (row) => row.total),
];

const ChartTooltip = (props) => {
  const { visible, payload, label } = useHeldTooltip(props.active, props.payload, props.label);
  if (!payload) return null;
  const point = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.68)] mb-1">
        {monthLabel(label)}
      </p>
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.75)]">
        <span className="font-semibold tabular-nums text-[#19363F]">
          {formatNumber(point?.newMembers)}
        </span>{" "}
        nuevos ·{" "}
        <span className="font-semibold tabular-nums text-[#19363F]">
          {formatNumber(point?.stillActive)}
        </span>{" "}
        siguen activos
      </p>
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.75)]">
        Retención{" "}
        <span className="font-semibold tabular-nums text-[#19363F]">{retention(point)}</span>
      </p>
    </TooltipSurface>
  );
};

/**
 * How long current members have been members: median per plan, the spread across
 * tenure buckets, and monthly cohorts against how many are still inside today.
 *
 * Only current members exist in this data (`active`, `toCancel`, `toDowngrade`), so
 * a bucket is «how long has the person who is here been here», never a survival
 * curve. The cohort bars are the closest thing to retention, and they read high for
 * the youngest months for no better reason than those members have had little time
 * to leave — the note under the chart says so rather than letting it pass for loyalty.
 */
const TenurePanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMembershipsTenure({
    days: TENURE_DAYS,
  });

  const medians = useMemo(() => {
    const byPlan = new Map(
      (data?.medians ?? []).map((row) => [row.plan, firstNumber(row.medianDays)])
    );
    return orderPlans([...byPlan.keys()]).map((plan) => ({ plan, days: byPlan.get(plan) }));
  }, [data]);

  const rows = useMemo(() => {
    const byPlan = new Map();
    for (const row of data?.buckets ?? []) {
      const entry = byPlan.get(row.plan) ?? { plan: row.plan, total: 0 };
      const users = firstNumber(row.users) ?? 0;
      entry[row.bucket] = (entry[row.bucket] ?? 0) + users;
      entry.total += users;
      byPlan.set(row.plan, entry);
    }
    return orderPlans([...byPlan.keys()]).map((plan) => byPlan.get(plan));
  }, [data]);

  const cohorts = useMemo(
    () =>
      (data?.cohorts ?? [])
        .map((row) => ({
          month: row.month,
          newMembers: firstNumber(row.newMembers) ?? 0,
          stillActive: firstNumber(row.stillActive) ?? 0,
        }))
        .sort((a, b) => String(a.month).localeCompare(String(b.month))),
    [data]
  );

  const isEmpty = medians.length === 0 && rows.length === 0 && cohorts.length === 0;

  return (
    <Panel
      title="Antigüedad de los miembros"
      meta={`cohortes de ${TENURE_DAYS} días`}
      description="Cuánto llevan siendo miembros quienes lo son hoy: mediana por plan, reparto por tramos de antigüedad y cuántos de cada cohorte mensual siguen dentro."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && isEmpty}
        emptyLabel="No hay miembros actuales con antigüedad registrada."
      >
        <div className="flex flex-col gap-4">
          {medians.length > 0 && (
            <div>
              <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2">
                Mediana de antigüedad
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {medians.map(({ plan, days }) => (
                  <StatCard
                    key={plan}
                    value={days === null ? "—" : `${formatNumber(days)} días`}
                    label={cerebroPlanLabel(plan)}
                    hint={
                      days !== null && days >= 365
                        ? `≈ ${formatNumber(days / 365, { decimals: 1 }).replace(".", ",")} años`
                        : undefined
                    }
                    tone={days === null ? "muted" : "neutral"}
                  />
                ))}
              </div>
            </div>
          )}

          {rows.length > 0 && (
            <div>
              <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2">
                Reparto por antigüedad
              </h4>
              <DataTable
                data={rows}
                columns={columns}
                filename="cerebro-antiguedad"
                enableSelection={false}
                enableSearch={false}
                enableFooter
                bare
                dense
              />
            </div>
          )}

          {cohorts.length > 0 && (
            <div>
              <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2">
                Retención por cohorte
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cohorts} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={monthLabel}
                    tick={{ fontSize: 10, fill: AXIS }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <YAxis
                    tickFormatter={(value) => formatNumber(value)}
                    tick={{ fontSize: 10, fill: AXIS }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: GRID }}
                    wrapperStyle={tooltipWrapperStyle}
                  />
                  <Bar
                    dataKey="newMembers"
                    name="Nuevos"
                    fill={NEW_COLOR}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="stillActive"
                    name="Siguen activos"
                    fill={ACTIVE_COLOR}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {LEGEND.map(({ color, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]"
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <PanelNote>
            Solo cuentan los miembros actuales (activos, con cancelación o bajada de plan
            pendiente): quien ya canceló no aparece. Un miembro con cancelación pendiente sigue
            dentro de su periodo pagado, así que se cuenta. Las cohortes más recientes salen con
            retención alta simplemente porque han tenido menos tiempo para cancelar.
          </PanelNote>
        </div>
      </QueryState>
    </Panel>
  );
};

export default TenurePanel;
