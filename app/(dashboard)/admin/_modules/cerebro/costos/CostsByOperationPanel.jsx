"use client";

import DataTable from "@/components/DataTable";
import { cerebroOperationLabels } from "@/constants/cerebro";
import { useGetCostsByOperation } from "@/hooks/cerebro/useGetCostsByOperation";
import { cn } from "@/utils";
import { formatNumber, formatPercent, formatUsd, formatUsdPrecise } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { firstNumber, ratio, sumColumn, sumColumnDefined } from "../../shared/aggregate";
import FilterSelect from "./FilterSelect";
import { COST_DAYS, OPERATION_WINDOWS } from "./constants";

/**
 * Gas in units, not USD — six or seven digits per op, so thousands are folded the
 * way the original dashboard folded them ("1095.4k").
 *
 * @param {number | null} value
 * @return {string}
 */
const formatGasUnits = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return "—";
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
};

/**
 * `admin.md` documents this row as `operation` / `opsCount` / `costUsd` / `feesUsd`
 * / `marginUsd`, and the API answers with the names the old dashboard's query
 * produced — `operationType`, `ops`, `totalCostUsd`, `totalFeeUsd`, `netUsd`. Every
 * column here read a documented name, so the whole table rendered "—" over nine
 * real rows. Same class of error as `/costs/by-plan`; read both spellings.
 *
 * The five columns beyond the documented ones are aggregates of the same
 * `sponsored_user_ops` group-by, so they arrive on the same row when they arrive at
 * all: success rate, average gas *units*, the bundler/paymaster split of the cost,
 * and the cheapest/dearest single op. What can be derived here is derived —
 * «Media / op», «Neto» and «Recuperación» are arithmetic on the totals — and what
 * cannot shows "—" with the ask below the table.
 *
 * @param {Object} row
 * @return {Object}
 */
const toOperationRow = (row) => {
  const operation = row.operation ?? row.operationType ?? row.operation_type ?? null;
  const opsCount = firstNumber(row.opsCount, row.ops, row.ops_count);
  const successfulOps = firstNumber(row.successfulOps, row.successful_ops);
  const costUsd = firstNumber(row.costUsd, row.totalCostUsd, row.cost_usd, row.total_cost_usd);
  const feesUsd = firstNumber(row.feesUsd, row.totalFeeUsd, row.fees_usd, row.total_fee_usd);
  const bundlerUsd = firstNumber(
    row.bundlerUsd,
    row.bundlerCostUsd,
    row.bundler_usd,
    row.bundler_cost_usd
  );
  const paymasterUsd = firstNumber(row.paymasterUsd, row.paymaster_usd);
  // The upstream mapper already multiplies the rate by 100; a bare `successRate`
  // does not, so anything at or below 1 is read as a fraction. 1 means 100%, never
  // 1%: an op type succeeding once in a hundred would be an outage, not a row.
  const successRate = firstNumber(row.successRate, row.success_rate);
  const successFromCounts = ratio(successfulOps, opsCount);
  const recoveryPct = firstNumber(row.costRecoveryPct, row.recoveryPct, row.cost_recovery_pct);
  const recovery = ratio(feesUsd, costUsd);

  return {
    operation,
    operationLabel: cerebroOperationLabels[operation] ?? operation ?? "—",
    opsCount,
    successfulOps,
    successPct:
      successFromCounts !== null
        ? successFromCounts * 100
        : successRate === null
          ? null
          : successRate <= 1
            ? successRate * 100
            : successRate,
    avgGasUnits: firstNumber(row.avgGasUnits, row.avgGasUsed, row.avg_gas_used),
    bundlerUsd,
    // Whatever Pimlico charged on top of the chain gas. It is the complement of the
    // bundler share, so a response carrying only one of the two still fills both.
    paymasterUsd:
      paymasterUsd ?? (costUsd !== null && bundlerUsd !== null ? costUsd - bundlerUsd : null),
    costUsd,
    costPerOp:
      firstNumber(row.avgCostUsd, row.costPerOp, row.avg_cost_usd) ?? ratio(costUsd, opsCount),
    minCostUsd: firstNumber(row.minCostUsd, row.min_cost_usd),
    maxCostUsd: firstNumber(row.maxCostUsd, row.max_cost_usd),
    feesUsd,
    marginUsd:
      firstNumber(row.marginUsd, row.netUsd, row.net_usd) ??
      (costUsd === null && feesUsd === null ? null : (feesUsd ?? 0) - (costUsd ?? 0)),
    recoveryPct: recoveryPct ?? (recovery === null ? null : recovery * 100),
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

  const rows = useMemo(() => (data ?? []).map(toOperationRow), [data]);

  // The five detail columns come out of one group-by upstream, so a single answer
  // covers the set: either the endpoint reports per-op detail or the ask stands.
  const hasOpDetail = rows.some(
    (row) =>
      row.successPct !== null ||
      row.avgGasUnits !== null ||
      row.bundlerUsd !== null ||
      row.minCostUsd !== null
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
          <span
            className={cn(
              "tabular-nums",
              info.getValue() === null ? "text-[rgba(25,54,63,0.3)]" : "text-[rgba(25,54,63,0.7)]"
            )}
          >
            {formatNumber(info.getValue())}
          </span>
        ),
        footer: ({ table }) => formatNumber(sumColumnDefined(table, "opsCount")),
      },
      {
        accessorKey: "successPct",
        header: () => <span title="Ops confirmadas sobre el total enviado">Éxito</span>,
        meta: { align: "right", label: "Éxito" },
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={cn(
                "tabular-nums",
                value === null
                  ? "text-[rgba(25,54,63,0.3)]"
                  : value < 95
                    ? "text-red-600"
                    : "text-[rgba(25,54,63,0.7)]"
              )}
            >
              {formatPercent(value, { decimals: 0 })}
            </span>
          );
        },
        footer: ({ table }) => {
          const rate = ratio(
            sumColumnDefined(table, "successfulOps"),
            sumColumnDefined(table, "opsCount")
          );
          return formatPercent(rate === null ? null : rate * 100, { decimals: 0 });
        },
      },
      {
        accessorKey: "avgGasUnits",
        header: () => <span title="Media de unidades de gas por op, no dólares">Gas medio</span>,
        meta: { align: "right", label: "Gas medio" },
        cell: (info) => (
          <span
            className={cn(
              "tabular-nums",
              info.getValue() === null ? "text-[rgba(25,54,63,0.3)]" : "text-[rgba(25,54,63,0.55)]"
            )}
          >
            {formatGasUnits(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "bundlerUsd",
        header: () => <span title="Parte del coste que se pagó como gas en cadena">Bundler</span>,
        meta: { align: "right", label: "Bundler" },
        cell: (info) => (
          <span
            className={cn(
              "tabular-nums",
              info.getValue() === null ? "text-[rgba(25,54,63,0.3)]" : "text-red-600"
            )}
          >
            {formatUsdPrecise(info.getValue())}
          </span>
        ),
        footer: ({ table }) => (
          <span className="text-red-600">
            {formatUsdPrecise(sumColumnDefined(table, "bundlerUsd"))}
          </span>
        ),
      },
      {
        accessorKey: "paymasterUsd",
        header: () => <span title="Recargo de Pimlico sobre el gas de cadena">Paymaster</span>,
        meta: { align: "right", label: "Paymaster" },
        cell: (info) => (
          <span
            className={cn(
              "tabular-nums",
              info.getValue() === null ? "text-[rgba(25,54,63,0.3)]" : "text-red-400"
            )}
          >
            {formatUsdPrecise(info.getValue())}
          </span>
        ),
        footer: ({ table }) => (
          <span className="text-red-400">
            {formatUsdPrecise(sumColumnDefined(table, "paymasterUsd"))}
          </span>
        ),
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
        footer: ({ table }) =>
          formatUsd(ratio(sumColumn(table, "costUsd"), sumColumnDefined(table, "opsCount")), {
            decimals: 6,
          }),
      },
      {
        accessorKey: "minCostUsd",
        header: () => <span title="Coste de la op más barata y de la más cara">Rango</span>,
        meta: { align: "right", label: "Rango" },
        cell: (info) => {
          const { minCostUsd, maxCostUsd } = info.row.original;
          if (minCostUsd === null && maxCostUsd === null) {
            return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          }
          return (
            <span className="whitespace-nowrap text-xs tabular-nums text-[rgba(25,54,63,0.55)]">
              {formatUsdPrecise(minCostUsd)} – {formatUsdPrecise(maxCostUsd)}
            </span>
          );
        },
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
  const totalOps = rows.reduce((total, row) => total + (row.opsCount ?? 0), 0);

  return (
    <Panel
      title="Por funcionalidad"
      description={`Qué cuesta y qué deja cada tipo de operación en los ${windowLabel.toLowerCase()}. «Bundler» es el gas pagado en cadena y «Paymaster» el recargo de Pimlico encima; «Gas medio» va en unidades de gas, no en dólares.`}
      action={
        <div className="flex items-center gap-2">
          {totalOps > 0 && (
            <span className="whitespace-nowrap text-xs tabular-nums text-[rgba(25,54,63,0.5)]">
              {formatNumber(totalOps)} ops en total
            </span>
          )}
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

        {!hasOpDetail && (
          <div className="mt-2.5">
            <PendingEndpoint
              needs="Las columnas «Éxito», «Gas medio», «Bundler», «Paymaster» y «Rango» ya están en la tabla, pero /costs/by-operation no las envía y se quedan vacías. Las cinco salen del mismo group-by sobre sponsored_user_ops que ya calcula el resto de la fila: éxito = ops con success sobre el total; gas medio = avg(actual_gas_used), en unidades de gas y no en USD; el reparto bundler/paymaster sale de prorratear cost_usd por chain_gas_cost_wei / actual_gas_cost_wei — esa parte es el bundler y el resto el paymaster; y el rango es min(cost_usd) excluyendo ceros junto a max(cost_usd). Ninguna se deduce desde los totales de la fila. El dashboard original ofrece además «Histórico»; aquí el máximo es 365 porque days no acepta más."
              fields={[
                "/costs/by-operation → successfulOps, avgGasUsed, bundlerUsd, paymasterUsd, minCostUsd, maxCostUsd",
                "days=0 (o all=true) para el histórico completo",
              ]}
              shape={{
                rows: [
                  {
                    operationType: "swap",
                    ops: 175,
                    successfulOps: 173,
                    avgGasUsed: 1095400,
                    bundlerUsd: 2.76,
                    paymasterUsd: 0.2763,
                    totalCostUsd: 3.04,
                    minCostUsd: 0.002449,
                    maxCostUsd: 0.2187,
                    totalFeeUsd: 66.67,
                    netUsd: 63.63,
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

export default CostsByOperationPanel;
