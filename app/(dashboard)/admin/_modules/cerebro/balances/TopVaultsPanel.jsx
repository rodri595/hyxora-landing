"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains } from "@/constants/cerebro";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import { HOLDINGS_LIMIT } from "./constants";

const columns = [
  {
    accessorKey: "vaultName",
    header: "Vault",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue() ?? "—"}</span>,
    footer: () => "Total",
  },
  {
    accessorKey: "symbol",
    header: "Símbolo",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "chainName",
    header: "Redes",
    cell: (info) => <span className="text-[rgba(25,54,63,0.5)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "holders",
    header: "Titulares",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatNumber(info.getValue())}
      </span>
    ),
    // Not summed on purpose — a user in two vaults would be counted twice.
    footer: () => <span className="text-[rgba(25,54,63,0.3)]">—</span>,
  },
  {
    accessorKey: "totalUsd",
    header: "Valor total",
    meta: { align: "right" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-[#19363F]">
        {formatUsd(info.getValue(), { decimals: 2 })}
      </span>
    ),
    footer: ({ table }) => formatUsd(sumColumn(table, "totalUsd"), { decimals: 2 }),
  },
];

/**
 * Aggregate vault exposure across every user. Same `/holdings` request as the token
 * table above — react-query serves both from one response, so refreshing either
 * updates both.
 */
const TopVaultsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetHoldings({
    limit: HOLDINGS_LIMIT,
  });

  const rows = useMemo(
    () =>
      (data?.vaults ?? []).map((row) => ({
        ...row,
        chainName: row.chainName ?? cerebroChains[row.chainId] ?? `Chain ${row.chainId}`,
      })),
    [data]
  );

  return (
    <Panel
      title="Principales vaults entre todos los usuarios"
      description="Depósitos agregados en USD por vault, sumando las posiciones de todos los usuarios. Solo aparecen los vaults con saldo."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay depósitos en vaults registrados."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-vaults"
          searchPlaceholder="Buscar por vault, símbolo o red..."
          initialSorting={[{ id: "totalUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />
      </QueryState>
    </Panel>
  );
};

export default TopVaultsPanel;
