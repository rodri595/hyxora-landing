"use client";

import DataTable from "@/components/DataTable";
import {
  cerebroMembershipKey,
  cerebroMembershipLabel,
  cerebroMembershipStatuses,
  cerebroPlanLabel,
} from "@/constants/cerebro";
import { useGetMembershipsOverview } from "@/hooks/cerebro/useGetMembershipsOverview";
import { formatDateTime, formatNumber, timeAgo } from "@/utils/format";
import { useMemo } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import { PanelNote } from "../../shared/Explanations";
import MeterBar from "../../shared/MeterBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { firstNumber, sumColumn } from "../../shared/aggregate";
import { orderPlans } from "./plans";

const H4 =
  "font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2";

/** Lifecycle order for the matrix columns; unknown statuses are appended after. */
const STATUS_ORDER = [...Object.keys(cerebroMembershipStatuses), "none"];

const count = (value) => firstNumber(value) ?? 0;

const cell = (value) =>
  value > 0 ? (
    <span className="tabular-nums text-[rgba(25,54,63,0.85)]">{formatNumber(value)}</span>
  ) : (
    <span className="text-[rgba(25,54,63,0.5)]">—</span>
  );

const numericColumn = (id, header) => ({
  id,
  header,
  accessorFn: (row) => row[id] ?? 0,
  meta: { align: "right" },
  cell: (info) => cell(info.getValue()),
  footer: ({ table }) => cell(sumColumn(table, id)),
});

const capitalise = (text) => text[0].toUpperCase() + text.slice(1);

/**
 * Pivots `matrix` into one row per plan with a column per status.
 *
 * @param {{ plan: string, status: string | null, users: number }[]} matrix
 */
const pivotMatrix = (matrix = []) => {
  const byPlan = new Map();
  const statuses = new Set();

  for (const entry of matrix) {
    const status = cerebroMembershipKey(entry.status);
    const row = byPlan.get(entry.plan) ?? { plan: entry.plan, total: 0 };
    const users = count(entry.users);
    row[status] = (row[status] ?? 0) + users;
    row.total += users;
    byPlan.set(entry.plan, row);
    statuses.add(status);
  }

  const ordered = [
    ...STATUS_ORDER.filter((status) => statuses.has(status)),
    ...[...statuses].filter((status) => !STATUS_ORDER.includes(status)),
  ];

  return {
    rows: orderPlans([...byPlan.keys()]).map((plan) => byPlan.get(plan)),
    columns: [
      {
        accessorKey: "plan",
        header: "Plan",
        cell: (info) => (
          <span className="font-medium text-[#19363F]">{cerebroPlanLabel(info.getValue())}</span>
        ),
        footer: () => "Total",
      },
      ...ordered.map((status) => numericColumn(status, capitalise(cerebroMembershipLabel(status)))),
      numericColumn("total", "Total"),
    ],
  };
};

/**
 * Where every account stands today: paying, on the way out, gone, or never paid.
 *
 * The four tiles are the lifecycle groups of `cerebroMembershipStatuses`, the same
 * ones the users-table filter offers, so «En riesgo 11» here is the list you get by
 * filtering that table to «en riesgo». The matrix underneath is the raw plan ×
 * status split the groups are summed from.
 *
 * Freshness stays visible rather than folded: status and dates come from a per-user
 * sync that walks 25 accounts per tick, so a user who cancelled an hour ago may not
 * have been reached yet, and an account never enriched counts as «sin membresía»
 * whatever it actually pays.
 */
const StatusOverviewPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMembershipsOverview();

  const totals = data?.totals ?? {};
  const total = count(totals.totalUsers);
  const active = count(totals.active);
  const pipeline =
    count(totals.toCancel) + count(totals.toDowngrade) + count(totals.pendingPayment);
  const lapsed = count(totals.suspended) + count(totals.cancelled);
  const none = count(totals.withoutMembership);

  const matrix = useMemo(() => pivotMatrix(data?.matrix), [data]);

  const sync = data?.sync ?? {};
  const neverEnriched = count(sync.neverEnriched);
  const lifecycle = data?.lifecycle;

  return (
    <Panel
      title="Estado de las membresías"
      meta={data?.asOf ? `instantánea ${timeAgo(data.asOf)}` : undefined}
      description="Cuántas cuentas pagan hoy, cuántas están de salida y cuántas nunca han pagado, con el reparto por plan y estado debajo."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <StatCard
              value={<AnimatedCount value={active} />}
              label="Activas"
              tone="good"
              hint={`${formatNumber(count(totals.registeredActive))} vivas en el último sync del backend`}
            />
            <StatCard
              value={<AnimatedCount value={pipeline} />}
              label="En riesgo"
              tone={pipeline > 0 ? "warning" : "muted"}
              hint={`${formatNumber(count(totals.toCancel))} cancelarán · ${formatNumber(count(totals.toDowngrade))} bajarán · ${formatNumber(count(totals.pendingPayment))} sin pagar`}
            />
            <StatCard
              value={<AnimatedCount value={lapsed} />}
              label="Caídas"
              tone={lapsed > 0 ? "neutral" : "muted"}
              hint={`${formatNumber(count(totals.suspended))} suspendidas · ${formatNumber(count(totals.cancelled))} canceladas`}
            />
            <StatCard
              value={<AnimatedCount value={none} />}
              label="Sin membresía"
              tone="muted"
              hint={`de ${formatNumber(total)} cuentas`}
            />
          </div>

          <MeterBar
            label="Cuentas con membresía activa"
            value={active}
            total={total}
            tone="good"
            hint={`de ${formatNumber(total)}`}
          />

          {lifecycle ? (
            <div className="flex flex-wrap gap-2">
              <StatCard
                value={formatNumber(count(lifecycle.founderSold))}
                label="Founder NFT vendida"
                tone={count(lifecycle.founderSold) > 0 ? "warning" : "muted"}
              />
              <StatCard
                value={formatNumber(count(lifecycle.founderGracePeriod))}
                label="Founder en gracia"
                tone={count(lifecycle.founderGracePeriod) > 0 ? "warning" : "muted"}
              />
              <StatCard
                value={formatNumber(count(lifecycle.founderExpired))}
                label="Founder caducado"
                tone="muted"
              />
            </div>
          ) : (
            <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700">
              Datos de cancelación, periodicidad y estado founder pendientes de la migración #670:
              hasta que se aplique en la base de datos de Cerebro esos bloques llegan vacíos.
            </p>
          )}

          {matrix.rows.length > 0 && (
            <div>
              <h4 className={H4}>Plan × estado</h4>
              <DataTable
                data={matrix.rows}
                columns={matrix.columns}
                filename="cerebro-membresias-plan-estado"
                enableSelection={false}
                enableSearch={false}
                enableFooter
                bare
                dense
              />
            </div>
          )}

          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
            Detalle sincronizado para {formatNumber(count(sync.enriched))} cuentas
            {sync.lastSyncedAt &&
              `, el último ${timeAgo(sync.lastSyncedAt)} (${formatDateTime(sync.lastSyncedAt)})`}
            .
            {neverEnriched > 0 && (
              <span className="text-amber-700">
                {" "}
                {formatNumber(neverEnriched)} aún no se han enriquecido y cuentan como «sin
                membresía» hasta que el sync pase por ellas.
              </span>
            )}
          </p>

          <PanelNote>
            El plan se sincroniza con el backend cada 15 minutos; el estado, las fechas y la
            cancelación van por usuario, 25 por pasada, y tardan unas 2 horas en dar la vuelta
            completa. «Activas» son las que pagan y están vigentes; «vivas en el último sync» son
            las que además aparecieron en la última sincronización masiva. «En riesgo» sigue dentro
            de su periodo pagado.
          </PanelNote>
        </div>
      </QueryState>
    </Panel>
  );
};

export default StatusOverviewPanel;
