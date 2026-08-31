"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetCostsByChain } from "@/hooks/cerebro/useGetCostsByChain";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { firstNumber, sumColumn, sumColumnDefined } from "../../shared/aggregate";
import { COST_DAYS } from "./constants";

/**
 * `admin.md` documents this row as `chainName` / `opsCount`, and the API answers
 * with what the old dashboard's query produced — `chain_id` + `cost` + `ops`, no
 * name at all (`getCostsByChain` in `hyxora-admin-main/src/lib/queries.ts`; the
 * page resolved the label itself through `chainById()`). `costUsd` was the one
 * spelling the doc got right, which is why it was the only column that rendered.
 *
 * Same fix as `/costs/by-plan` and `/costs/by-operation`: read both spellings at
 * the edge, and resolve the chain through `cerebroChainLabel()`.
 *
 * @param {Object} row
 * @return {{ chainId: number | string, chainName: string, opsCount: number | null, costUsd: number | null }}
 */
const toChainRow = (row) => ({
  chainId: row.chainId ?? row.chain_id,
  chainName: cerebroChainLabel({
    ...row,
    chainId: row.chainId ?? row.chain_id,
  }),
  opsCount: firstNumber(row.opsCount, row.ops, row.ops_count),
  costUsd: firstNumber(row.costUsd, row.cost_usd, row.cost),
});

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
 * Sponsored gas per network. Same query and window as the operation counter in the
 * «Gastos» card above, so react-query serves both from one request.
 *
 * EVM only, like the old dashboard's table: Solana sponsorship is tracked in its
 * own `solana_fee_payer_costs` table and reaches us through `/costs/totals`, which
 * is where the summary card above already adds it in.
 */
const CostsByChainPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByChain({ days: COST_DAYS });

  const rows = useMemo(() => (data ?? []).map(toChainRow), [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
      },
      {
        accessorKey: "opsCount",
        header: "Operaciones",
        meta: { align: "right" },
        cell: (info) => <CountCell value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumColumnDefined(table, "opsCount")),
      },
      {
        accessorKey: "costUsd",
        header: "Gastos",
        meta: { align: "right" },
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
    ],
    []
  );

  return (
    <Panel
      title={`Por cadena (${COST_DAYS}d)`}
      description="Reparto del gas patrocinado entre redes. Solo aparecen las cadenas con actividad en la ventana."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ninguna cadena registró operaciones en la ventana."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-gastos-por-cadena-${COST_DAYS}d`}
          searchPlaceholder="Buscar cadena..."
          initialSorting={[{ id: "costUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />
      </QueryState>
    </Panel>
  );
};

export default CostsByChainPanel;
