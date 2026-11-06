"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetMembershipsOverview } from "@/hooks/cerebro/useGetMembershipsOverview";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import CompositionBar from "../../shared/CompositionBar";
import { PanelNote } from "../../shared/Explanations";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { firstNumber, sumColumn } from "../../shared/aggregate";
import { orderPlans } from "./plans";

const H4 =
  "font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2";

const count = (value) => firstNumber(value) ?? 0;

const cell = (value, warn = false) =>
  value > 0 ? (
    <span
      className={
        warn ? "font-medium tabular-nums text-amber-700" : "tabular-nums text-[rgba(25,54,63,0.85)]"
      }
    >
      {formatNumber(value)}
    </span>
  ) : (
    <span className="text-[rgba(25,54,63,0.5)]">—</span>
  );

const numericColumn = (id, header, warn = false) => ({
  id,
  header,
  accessorFn: (row) => row[id] ?? 0,
  meta: { align: "right" },
  cell: (info) => cell(info.getValue(), warn),
  footer: ({ table }) => cell(sumColumn(table, id), warn),
});

const planColumn = {
  accessorKey: "plan",
  header: "Plan",
  cell: (info) => (
    <span className="font-medium text-[#19363F]">{cerebroPlanLabel(info.getValue())}</span>
  ),
  footer: () => "Total",
};

const WINDOWS = [
  { id: "overdue", label: "Vencidas", warn: true },
  { id: "next7", label: "0–7 días" },
  { id: "next30", label: "8–30 días" },
  { id: "later", label: "Más tarde" },
];

const renewalColumns = [
  planColumn,
  ...WINDOWS.map(({ id, label, warn }) => numericColumn(id, label, warn)),
  numericColumn("total", "Total"),
];

const INTERVAL_LABELS = { month: "Mensual", year: "Anual" };

/**
 * When memberships come up for renewal, and how they are paid.
 *
 * Replaces what `/users/renewals` could say — one count for the next N days — with
 * the whole calendar per plan, overdue included. «Vencidas» is the actionable one: a
 * renew date in the past on a membership that hasn't moved means the payment didn't
 * land or the per-user sync hasn't reached them yet, and either way it is somebody
 * to look at before they lapse.
 *
 * The windows are read as a partition — overdue, the next week, the rest of the
 * month, later — because a `later` bucket only makes sense if the others don't
 * overlap. That is why the table can total across them.
 *
 * Payment channel and billing interval share the second table because they answer
 * the same question about a plan, «how does this money come in». The interval
 * columns only exist once migration #670 is applied.
 */
const RenewalsBillingPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMembershipsOverview();

  const renewals = useMemo(() => {
    const byPlan = new Map();
    for (const entry of data?.renewals ?? []) {
      const row = { plan: entry.plan, total: 0 };
      for (const { id } of WINDOWS) {
        row[id] = count(entry[id]);
        row.total += row[id];
      }
      byPlan.set(entry.plan, row);
    }
    return orderPlans([...byPlan.keys()]).map((plan) => byPlan.get(plan));
  }, [data]);

  const windowTotals = useMemo(
    () =>
      Object.fromEntries(
        WINDOWS.map(({ id }) => [id, renewals.reduce((sum, row) => sum + row[id], 0)])
      ),
    [renewals]
  );

  const billing = useMemo(() => {
    const byPlan = new Map();
    const channels = new Map();
    const row = (plan) => byPlan.get(plan) ?? byPlan.set(plan, { plan }).get(plan);

    for (const entry of data?.paymentTypes ?? []) {
      const channel = entry.paymentType || "sin canal";
      const users = count(entry.users);
      const target = row(entry.plan);
      target[`pay:${channel}`] = (target[`pay:${channel}`] ?? 0) + users;
      channels.set(channel, (channels.get(channel) ?? 0) + users);
    }

    const intervals = data?.lifecycle?.intervals ?? [];
    for (const entry of intervals) {
      const target = row(entry.plan);
      target["every:month"] = count(entry.month);
      target["every:year"] = count(entry.year);
    }

    const sortedChannels = [...channels].sort((a, b) => b[1] - a[1]);

    return {
      composition: sortedChannels.map(([label, value]) => ({ label, value })),
      rows: orderPlans([...byPlan.keys()]).map((plan) => byPlan.get(plan)),
      columns: [
        planColumn,
        ...sortedChannels.map(([channel]) => numericColumn(`pay:${channel}`, channel)),
        ...(intervals.length > 0
          ? Object.entries(INTERVAL_LABELS).map(([id, label]) =>
              numericColumn(`every:${id}`, label)
            )
          : []),
      ],
    };
  }, [data]);

  return (
    <Panel
      title="Renovaciones y cobro"
      description="Cuándo le toca renovar a cada membresía, por plan, y por qué canal y con qué periodicidad se cobra."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && renewals.length === 0 && billing.rows.length === 0}
        emptyLabel="El endpoint no devolvió renovaciones ni canales de pago."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <StatCard
              value={<AnimatedCount value={windowTotals.overdue ?? 0} />}
              label="Vencidas"
              tone={windowTotals.overdue > 0 ? "warning" : "muted"}
              hint="Fecha de renovación ya pasada"
            />
            <StatCard
              value={<AnimatedCount value={windowTotals.next7 ?? 0} />}
              label="Renuevan esta semana"
              tone={windowTotals.next7 > 0 ? "neutral" : "muted"}
            />
            <StatCard
              value={<AnimatedCount value={windowTotals.next30 ?? 0} />}
              label="Renuevan en 8–30 días"
              tone={windowTotals.next30 > 0 ? "neutral" : "muted"}
            />
          </div>

          {renewals.length > 0 && (
            <div>
              <h4 className={H4}>Vencimientos por plan</h4>
              <DataTable
                data={renewals}
                columns={renewalColumns}
                filename="cerebro-membresias-renovaciones"
                enableSelection={false}
                enableSearch={false}
                enableFooter
                bare
                dense
              />
            </div>
          )}

          {billing.composition.length > 0 && (
            <div>
              <h4 className={H4}>Canal de pago</h4>
              <CompositionBar
                items={billing.composition}
                formatValue={(value) => formatNumber(value)}
                ariaLabel="Reparto de las membresías entre canales de pago"
              />
            </div>
          )}

          {billing.rows.length > 0 && (
            <div>
              <h4 className={H4}>Cobro por plan</h4>
              <DataTable
                data={billing.rows}
                columns={billing.columns}
                filename="cerebro-membresias-cobro"
                enableSelection={false}
                enableSearch={false}
                enableFooter
                bare
                dense
              />
            </div>
          )}

          <PanelNote>
            Los vencimientos solo cuentan membresías con fecha de renovación. «Manual» es el cobro
            de los founders (mint único). Mensual y anual llegan con la migración #670 y no salen
            hasta entonces.
          </PanelNote>
        </div>
      </QueryState>
    </Panel>
  );
};

export default RenewalsBillingPanel;
