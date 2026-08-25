"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains } from "@/constants/cerebro";
import { useGetTreasuryByChain } from "@/hooks/cerebro/useGetTreasuryByChain";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import WhitelistToggle from "./WhitelistToggle";

const sumBy = (table, key) =>
  table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original[key] ?? 0), 0);

/**
 * Treasury inflows per network.
 *
 * `/fees/treasury/by-chain` takes no `days`, so this table is all-time and can't be
 * compared line for line with the 30-day panels above it. The per-token panel is
 * the one to use for a window.
 */
const RevenueByChainPanel = () => {
  const [includeNonWhitelisted, setIncludeNonWhitelisted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useGetTreasuryByChain({
    includeNonWhitelisted,
  });

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
        accessorKey: "transfers",
        header: "Transferencias",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
        footer: ({ table }) => formatNumber(sumBy(table, "transfers")),
      },
      {
        accessorKey: "tokens",
        header: "Tokens",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "totalUsd",
        header: "Comisiones de usuario",
        meta: { align: "right", label: "Comisiones" },
        cell: (info) => {
          const value = info.getValue() ?? 0;
          return (
            <span
              className={cn(
                "font-medium tabular-nums",
                value > 0 ? "text-emerald-700" : "text-[rgba(25,54,63,0.3)]"
              )}
            >
              {formatUsd(value, { decimals: value > 0 && value < 1 ? 4 : 2 })}
            </span>
          );
        },
        footer: ({ table }) => (
          <span className="text-emerald-700">
            {formatUsd(sumBy(table, "totalUsd"), { decimals: 2 })}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Panel
      title="Ingresos por cadena"
      description="Entradas al tesoro agrupadas por red, desde el inicio: este endpoint no acepta ventana de días."
      action={
        <div className="flex items-center gap-2">
          <WhitelistToggle value={includeNonWhitelisted} onChange={setIncludeNonWhitelisted} />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ninguna cadena registró entradas al tesoro."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-ingresos-por-cadena"
          searchPlaceholder="Buscar cadena..."
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

export default RevenueByChainPanel;
