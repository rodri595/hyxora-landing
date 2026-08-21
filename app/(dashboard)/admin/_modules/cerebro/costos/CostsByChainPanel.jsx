"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains } from "@/constants/cerebro";
import { useGetCostsByChain } from "@/hooks/cerebro/useGetCostsByChain";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import { COST_DAYS } from "./constants";

/**
 * Sponsored gas per network. Same query and window as the operation counter in the
 * «Gastos» card above, so react-query serves both from one request.
 */
const CostsByChainPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetCostsByChain({ days: COST_DAYS });

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => ({
        ...row,
        chainName: row.chainName ?? cerebroChains[row.chainId] ?? `Chain ${row.chainId}`,
      })),
    [data]
  );

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
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
        footer: ({ table }) => formatNumber(sumColumn(table, "opsCount")),
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
