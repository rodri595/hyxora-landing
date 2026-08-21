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
import { ratio, sumColumn } from "../../shared/aggregate";

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

/**
 * What each membership tier costs us against what it brings in, since the start —
 * `/costs/by-plan` takes no `days`, so this table is always lifetime.
 */
const CostsByPlanPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByPlan();

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => ({
        ...row,
        planLabel: cerebroPlanLabel(row.plan),
        costPerUser: ratio(row.costUsd, row.usersCount),
      })),
    [data]
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
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
        footer: ({ table }) => formatNumber(sumColumn(table, "usersCount")),
      },
      {
        accessorKey: "opsCount",
        header: "Ops",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
        footer: ({ table }) => formatNumber(sumColumn(table, "opsCount")),
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
        header: "Media / usuario",
        meta: { align: "right", label: "Media por usuario" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.55)]">
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
        footer: ({ table }) => <NetCell value={sumColumn(table, "marginUsd")} />,
      },
    ],
    []
  );

  return (
    <Panel
      title="Por plan (histórico)"
      description="Coste, ingresos y neto de cada plan desde el inicio: este endpoint no acepta ventana de días."
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

        <div className="mt-2.5">
          <PendingEndpoint
            needs="Faltan las dos columnas de usuarios activos del dashboard original: cuántos del plan operaron de verdad, y el coste medio por activo. `/costs/by-plan` solo trae `usersCount` (todos los registrados), y dividir el gasto entre todos ellos reparte el coste entre gente que no ha hecho ninguna operación."
            fields={["/costs/by-plan → activeUsersCount por fila"]}
            shape={{
              rows: [
                {
                  plan: "founder",
                  usersCount: 45,
                  activeUsersCount: 28,
                  opsCount: 322,
                  costUsd: 4.14,
                  feesUsd: 38.73,
                  marginUsd: 34.59,
                },
              ],
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default CostsByPlanPanel;
