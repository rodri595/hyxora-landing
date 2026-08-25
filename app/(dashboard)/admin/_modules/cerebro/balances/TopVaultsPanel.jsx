"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback, useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import AssetHolders from "./AssetHolders";
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
 *
 * Rows expand the same way the token rows do. `/holdings/holders` matches on vault
 * *name* as well as token symbol, which is what made this possible: the fan-out it
 * replaced only ever indexed token positions, so vaults never had a list to open.
 */
const TopVaultsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetHoldings({
    limit: HOLDINGS_LIMIT,
  });

  const rows = useMemo(
    () =>
      (data?.vaults ?? []).map((row) => ({
        ...row,
        chainName: cerebroChainLabel(row),
      })),
    [data]
  );

  // Searched by name, not symbol: two vaults on different protocols can share a
  // share-token symbol, and the name is what /holdings/holders indexes them under.
  const renderSubRow = useCallback(
    (vault) => (
      <AssetHolders
        query={vault.vaultName ?? vault.symbol}
        row={vault}
        label={`${vault.vaultName ?? vault.symbol} en ${vault.chainName}`}
      />
    ),
    []
  );

  // A row with no name and no symbol has nothing to search on, so it stays flat
  // rather than opening onto a query that cannot be made.
  const isRowExpandable = useCallback((vault) => Boolean(vault?.vaultName || vault?.symbol), []);

  return (
    <Panel
      title="Principales vaults entre todos los usuarios"
      description="Depósitos agregados en USD por vault, sumando las posiciones de todos los usuarios. Solo aparecen los vaults con saldo. Abre una fila para ver quién está dentro."
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
          renderSubRow={renderSubRow}
          isRowExpandable={isRowExpandable}
          bare
          dense
        />
      </QueryState>
    </Panel>
  );
};

export default TopVaultsPanel;
