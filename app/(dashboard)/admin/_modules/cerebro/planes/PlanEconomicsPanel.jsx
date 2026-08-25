"use client";

import DataTable from "@/components/DataTable";
import { useGetCostsByPlan } from "@/hooks/cerebro/useGetCostsByPlan";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

const sumBy = (rows, key) => rows.reduce((total, row) => total + (row[key] ?? 0), 0);

const totalOf = (table, key) =>
  sumBy(
    table.getFilteredRowModel().rows.map((r) => r.original),
    key
  );

const PlanEconomicsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByPlan();

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => ({
        ...row,
        marginUsd: row.marginUsd ?? (row.feesUsd ?? 0) - (row.costUsd ?? 0),
      })),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "plan",
        header: "Plan",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
      },
      {
        accessorKey: "usersCount",
        header: "Usuarios",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[#19363F]">{formatNumber(info.getValue())}</span>
        ),
        footer: ({ table }) => formatNumber(totalOf(table, "usersCount")),
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
        footer: ({ table }) => formatNumber(totalOf(table, "opsCount")),
      },
      {
        accessorKey: "costUsd",
        header: "Gastos",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatUsd(info.getValue(), { decimals: 2 })}
          </span>
        ),
        footer: ({ table }) => formatUsd(totalOf(table, "costUsd"), { decimals: 2 }),
      },
      {
        accessorKey: "feesUsd",
        header: "Comisiones",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatUsd(info.getValue(), { decimals: 2 })}
          </span>
        ),
        footer: ({ table }) => formatUsd(totalOf(table, "feesUsd"), { decimals: 2 }),
      },
      {
        accessorKey: "marginUsd",
        header: "Margen",
        meta: { align: "right" },
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={cn(
                "font-medium tabular-nums",
                value < 0 ? "text-red-600" : "text-emerald-700"
              )}
            >
              {formatUsd(value, { decimals: 2 })}
            </span>
          );
        },
        footer: ({ table }) => {
          const total = totalOf(table, "marginUsd");
          return (
            <span className={total < 0 ? "text-red-600" : "text-emerald-700"}>
              {formatUsd(total, { decimals: 2 })}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <Panel
      title="Economía por plan"
      description="Coste de gas patrocinado contra comisiones cobradas, por membresía. Un margen negativo significa que ese plan cuesta más de lo que ingresa."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="El endpoint no devolvió planes."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-economia-por-plan"
          searchPlaceholder="Buscar plan..."
          initialSorting={[{ id: "marginUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
          /costs/by-plan no acepta ventana de fechas, así que estas cifras son acumuladas. Para un
          rango concreto y el top de holdings por plan está `useGetPnlMembership`, que sí pide
          from/to.
        </p>
      </QueryState>
    </Panel>
  );
};

export default PlanEconomicsPanel;
