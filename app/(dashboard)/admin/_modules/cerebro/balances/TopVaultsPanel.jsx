"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import CompositionBar from "../../shared/CompositionBar";
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
 *
 * Rows deliberately do *not* expand into a holder list the way the token rows do.
 * `/holdings/holders` matches its query against a position's symbol or name and
 * nothing else, while a vault row's `vaultName` is Zerion's *protocol* label
 * whenever it decomposed the position ("Morpho Blue", "Fluid") — a value that is in
 * neither column, so the lookup came back empty for exactly the rows most worth
 * opening. Falling back to the share-token symbol is not the same question either:
 * it answers "who holds aUSDC anywhere", not "who is in this vault". That needs an
 * endpoint that filters on protocol.
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

  // Grouped by vault name, not by row: the same vault on two chains is one place
  // the money is, and «cuánto pesa Morpho Blue» is the question the bar answers.
  const composition = useMemo(() => {
    const byVault = new Map();
    for (const row of rows) {
      const label = row.vaultName || row.symbol || "—";
      byVault.set(label, (byVault.get(label) ?? 0) + (Number(row.totalUsd) || 0));
    }
    return [...byVault].map(([label, value]) => ({ label, value }));
  }, [rows]);

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
        <div className="mb-3.5">
          <CompositionBar
            items={composition}
            formatValue={(value) => formatUsd(value, { decimals: 0 })}
            ariaLabel="Reparto de los depósitos en vaults"
            footnote="Reparto de los depósitos agrupando cada vault en todas sus redes."
          />
        </div>

        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-vaults"
          searchPlaceholder="Buscar por vault, símbolo o red..."
          initialSorting={[{ id: "totalUsd", desc: true }]}
          enableFooter
          bare
          dense
        />
      </QueryState>
    </Panel>
  );
};

export default TopVaultsPanel;
