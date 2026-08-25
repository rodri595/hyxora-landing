"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetCostsByPlan } from "@/hooks/cerebro/useGetCostsByPlan";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { ratio, sumColumn, sumColumnDefined } from "../../shared/aggregate";

/**
 * First finite number among alternative spellings of the same field. Numeric
 * strings count: the upstream query aggregates Postgres `numeric`, which some
 * serialisers hand over quoted.
 *
 * @param {...(number | string | null | undefined)} values
 * @return {number | null}
 */
const firstNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

/**
 * `admin.md` documents this row as `usersCount` / `opsCount` / `marginUsd`, and the
 * API answers with the names the old dashboard's query produced — `totalUsers`,
 * `activeUsers`, `ops`, `netUsd`. The two spellings the doc got right, `costUsd`
 * and `feesUsd`, were the only two columns that rendered, which is what gave it
 * away. Read both, the way `/costs/recent` does.
 *
 * `activeUsers` and `avgCostPerActiveUser` were never in the doc at all. «Activos»
 * is `count(distinct privy_id)` over `sponsored_user_ops`, so a user who signed up
 * and never operated is not one, and the average is
 * `avg(cost_usd) filter (where cost_usd > 0)` grouped by user — every active user
 * weighted equally rather than by spend. Neither can be rebuilt from the totals on
 * this row, so when they are missing the request below stays on screen.
 *
 * @param {Object} row
 * @return {Object}
 */
const toPlanRow = (row) => {
  const costUsd = firstNumber(row.costUsd, row.cost_usd);
  const feesUsd = firstNumber(row.feesUsd, row.fees_usd);
  const usersCount = firstNumber(row.usersCount, row.totalUsers, row.total_users);

  return {
    plan: row.plan,
    planLabel: cerebroPlanLabel(row.plan),
    usersCount,
    activeUsersCount: firstNumber(row.activeUsersCount, row.activeUsers, row.active_users),
    opsCount: firstNumber(row.opsCount, row.ops, row.ops_count),
    costUsd,
    // Gasto entre todos los usuarios del plan: a plain division, ours to do
    // whether or not the API sends it.
    costPerUser:
      firstNumber(row.avgCostPerUserUsd, row.avgCostPerUser, row.avg_cost_per_user) ??
      ratio(costUsd, usersCount),
    costPerActiveUser: firstNumber(
      row.avgCostPerActiveUserUsd,
      row.avgCostPerActiveUser,
      row.avg_cost_per_active_user
    ),
    feesUsd,
    // Neto = ingresos − gastos, the same subtraction the old dashboard did in JS.
    marginUsd:
      firstNumber(row.marginUsd, row.netUsd, row.net_usd) ??
      (costUsd === null && feesUsd === null ? null : (feesUsd ?? 0) - (costUsd ?? 0)),
  };
};

const NetCell = ({ value }) => (
  <span
    className={cn(
      "font-medium tabular-nums",
      value === null ? "text-[rgba(25,54,63,0.3)]" : value < 0 ? "text-red-600" : "text-emerald-700"
    )}
  >
    {value !== null && value > 0 ? "+" : ""}
    {formatUsd(value, { decimals: 4 })}
  </span>
);

const CountCell = ({ value }) => (
  <span
    className={cn(
      "tabular-nums",
      value === null ? "text-[rgba(25,54,63,0.3)]" : "text-[rgba(25,54,63,0.7)]"
    )}
  >
    {formatNumber(value)}
  </span>
);

/**
 * What each membership tier costs us against what it brings in, since the start —
 * `/costs/by-plan` takes no `days`, so this table is always lifetime.
 */
const CostsByPlanPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByPlan();

  const rows = useMemo(() => (data ?? []).map(toPlanRow), [data]);

  // Both active-user columns come out of the same upstream aggregate, so one
  // answer covers the pair: either the endpoint reports actives or the ask stands.
  const hasActiveUsers = rows.some(
    (row) => row.activeUsersCount !== null || row.costPerActiveUser !== null
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "planLabel",
        header: "Plan",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
      },
      {
        accessorKey: "usersCount",
        header: "Usuarios",
        meta: { align: "right" },
        cell: (info) => <CountCell value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumColumnDefined(table, "usersCount")),
      },
      {
        accessorKey: "activeUsersCount",
        header: () => (
          <span title="Usuarios del plan con al menos una op patrocinada">Activos</span>
        ),
        meta: { align: "right", label: "Activos" },
        cell: (info) => <CountCell value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumColumnDefined(table, "activeUsersCount")),
      },
      {
        accessorKey: "opsCount",
        header: "Ops",
        meta: { align: "right" },
        cell: (info) => <CountCell value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumColumnDefined(table, "opsCount")),
      },
      {
        accessorKey: "costUsd",
        header: "Gastos totales",
        meta: { align: "right", label: "Gastos" },
        cell: (info) => (
          <span className="font-medium tabular-nums text-red-600">
            {formatUsd(info.getValue(), { decimals: 4 })}
          </span>
        ),
        footer: ({ table }) => (
          <span className="text-red-600">
            {formatUsd(sumColumn(table, "costUsd"), { decimals: 4 })}
          </span>
        ),
      },
      {
        accessorKey: "costPerUser",
        header: () => (
          <span title="Gasto del plan dividido entre todos sus usuarios, hayan operado o no">
            Media / usuario
          </span>
        ),
        meta: { align: "right", label: "Media por usuario" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.55)]">
            {formatUsd(info.getValue(), { decimals: 6 })}
          </span>
        ),
      },
      {
        accessorKey: "costPerActiveUser",
        header: () => (
          <span title="Media del gasto entre los usuarios activos — no es el gasto total dividido entre ellos">
            Media / activo
          </span>
        ),
        meta: { align: "right", label: "Media por activo" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatUsd(info.getValue(), { decimals: 6 })}
          </span>
        ),
      },
      {
        accessorKey: "feesUsd",
        header: "Ingresos",
        meta: { align: "right" },
        cell: (info) => {
          const value = info.getValue() ?? 0;
          return (
            <span
              className={cn(
                "font-medium tabular-nums",
                value > 0 ? "text-emerald-700" : "text-[rgba(25,54,63,0.3)]"
              )}
            >
              {value > 0 ? formatUsd(value, { decimals: 2 }) : "—"}
            </span>
          );
        },
        footer: ({ table }) => (
          <span className="text-emerald-700">
            {formatUsd(sumColumn(table, "feesUsd"), { decimals: 2 })}
          </span>
        ),
      },
      {
        accessorKey: "marginUsd",
        header: "Neto",
        meta: { align: "right" },
        cell: (info) => <NetCell value={info.getValue() ?? null} />,
        footer: ({ table }) => <NetCell value={sumColumnDefined(table, "marginUsd")} />,
      },
    ],
    []
  );

  return (
    <Panel
      title="Por plan (histórico)"
      description="Coste, ingresos y neto de cada plan desde el inicio: este endpoint no acepta ventana de días. «Activos» son los usuarios con al menos una op patrocinada, y «Media / activo» reparte el gasto solo entre ellos."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ningún plan registró actividad."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-gastos-por-plan"
          searchPlaceholder="Buscar plan..."
          initialSorting={[{ id: "costUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />

        {!hasActiveUsers && (
          <div className="mt-2.5">
            <PendingEndpoint
              needs="Las columnas «Activos» y «Media / activo» ya están en la tabla, pero /costs/by-plan no las envía y se quedan vacías. La consulta de origen ya las calcula: «Activos» es count(distinct privy_id) sobre sponsored_user_ops — los que han operado, no los que solo se registraron — y la media es avg(cost_usd) filter (where cost_usd > 0) agrupando por usuario, que pesa igual a cada activo en vez de por gasto. Ninguna de las dos se puede deducir desde aquí: repartir el gasto entre todos los usuarios lo diluye con gente que nunca ha operado, y dividirlo entre los activos tampoco da la misma cifra. Basta con exponer las dos que ya se calculan."
              fields={["/costs/by-plan → activeUsers, avgCostPerActiveUser por fila"]}
              shape={{
                rows: [
                  {
                    plan: "founder",
                    totalUsers: 46,
                    activeUsers: 29,
                    ops: 328,
                    costUsd: 4.3647,
                    avgCostPerActiveUser: 0.1505,
                    feesUsd: 68.46,
                    netUsd: 64.09,
                  },
                ],
              }}
            />
          </div>
        )}
      </QueryState>
    </Panel>
  );
};

export default CostsByPlanPanel;
