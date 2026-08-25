"use client";

import DataTable from "@/components/DataTable";
import { cerebroOperationLabels } from "@/constants/cerebro";
import { useGetCostsByOperation } from "@/hooks/cerebro/useGetCostsByOperation";
import { cn } from "@/utils";
import { formatNumber, formatPercent, formatUsd } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { ratio, sumColumn } from "../../shared/aggregate";
import FilterSelect from "./FilterSelect";
import { COST_DAYS, OPERATION_WINDOWS } from "./constants";

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
 * Cost and margin per operation type — which features pay for themselves and which
 * ones we subsidise.
 *
 * «Recuperación» is fees ÷ cost: 100% means the fees exactly covered the gas we
 * sponsored. Operations we don't charge for (deploy, transferencias internas) sit
 * at 0% by design, not by mistake.
 */
const CostsByOperationPanel = () => {
  const [days, setDays] = useState(COST_DAYS);
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByOperation({ days });

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => {
        const recovery = ratio(row.feesUsd, row.costUsd);
        return {
          ...row,
          operationLabel: cerebroOperationLabels[row.operation] ?? row.operation ?? "—",
          costPerOp: ratio(row.costUsd, row.opsCount),
          recoveryPct: recovery === null ? null : recovery * 100,
        };
      }),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "operationLabel",
        header: "Operación",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
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
        accessorKey: "costPerOp",
        header: "Media / op",
        meta: { align: "right", label: "Media por op" },
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
      {
        accessorKey: "recoveryPct",
        header: "Recuperación",
        meta: { align: "right" },
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={cn(
                "tabular-nums",
                value === null
                  ? "text-[rgba(25,54,63,0.3)]"
                  : value >= 100
                    ? "text-emerald-700"
                    : "text-[rgba(25,54,63,0.55)]"
              )}
            >
              {formatPercent(value, { decimals: 0 })}
            </span>
          );
        },
        footer: ({ table }) => {
          const recovery = ratio(sumColumn(table, "feesUsd"), sumColumn(table, "costUsd"));
          return formatPercent(recovery === null ? null : recovery * 100, { decimals: 0 });
        },
      },
    ],
    []
  );

  const windowLabel =
    OPERATION_WINDOWS.find((option) => option.value === days)?.label ?? `${days} días`;

  return (
    <Panel
      title="Por funcionalidad"
      description={`Qué cuesta y qué deja cada tipo de operación en los ${windowLabel.toLowerCase()}.`}
      action={
        <div className="flex items-center gap-2">
          <FilterSelect
            value={days}
            onChange={setDays}
            options={OPERATION_WINDOWS}
            label="Ventana de días"
          />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ninguna operación registró actividad en la ventana."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-gastos-por-operacion-${days}d`}
          searchPlaceholder="Buscar operación..."
          initialSorting={[{ id: "costUsd", desc: true }]}
          enableSelection={false}
          enableColumnToggle
          enableFooter
          bare
          dense
        />

        <div className="mt-2.5">
          <PendingEndpoint
            needs="El dashboard original enseña cinco columnas más por operación que Cerebro no devuelve, todas agregados de la misma consulta sobre `sponsored_user_ops`: éxito = ops con `success` sobre el total; gas medio = `avg(actual_gas_used)`, en unidades de gas y no en USD; el reparto bundler/paymaster sale de prorratear `cost_usd` por `chain_gas_cost_wei / actual_gas_cost_wei` — esa parte es el bundler y el resto el paymaster; y el rango es `min(cost_usd)` excluyendo ceros junto a `max(cost_usd)`. También ofrece «Histórico»; aquí el máximo es 365 porque `days` no acepta más."
            fields={[
              "/costs/by-operation → successRate, avgGasUnits, bundlerUsd, paymasterUsd, minCostUsd, maxCostUsd",
              "days=0 (o all=true) para el histórico completo",
            ]}
            shape={{
              rows: [
                {
                  operation: "swap",
                  opsCount: 164,
                  successRate: 0.99,
                  avgGasUnits: 1036600,
                  bundlerUsd: 2.49,
                  paymasterUsd: 0.2487,
                  costUsd: 2.74,
                  minCostUsd: 0.002449,
                  maxCostUsd: 0.2187,
                  feesUsd: 36.82,
                  marginUsd: 34.09,
                },
              ],
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default CostsByOperationPanel;
