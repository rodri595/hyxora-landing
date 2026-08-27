"use client";

import DataTable from "@/components/DataTable";
import { appApiChainLabels } from "@/constants/appApi";
import { useGetWhitelistedTokens } from "@/hooks/appApi/useGetWhitelistedTokens";
import { formatNumber, shortenHash } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatusBadge from "../../shared/StatusBadge";

const columns = [
  {
    accessorKey: "displaySymbol",
    header: "Símbolo",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "chainLabel",
    header: "Red",
    cell: (info) => <span className="text-[rgba(25,54,63,0.5)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "decimals",
    header: "Decimales",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatNumber(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: (info) => (
      <code className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.55)]">
        {shortenHash(info.getValue())}
      </code>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: (info) => <StatusBadge active={info.getValue()} />,
  },
];

/**
 * Token whitelist, from app-api's `/admin/tokens`.
 *
 * A row is identified by chain + address, never by symbol: USD exists on Base,
 * Arbitrum, Polygon and BSC as four different contracts. The search covers the
 * address too, so a contract can be looked up directly.
 */
const WhitelistedTokensPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetWhitelistedTokens();

  const rows = useMemo(
    () =>
      (data ?? []).map((token) => ({
        ...token,
        displaySymbol: token.displaySymbol || token.symbol,
        chainLabel:
          appApiChainLabels[token.chainName] ?? token.chainName ?? `Chain ${token.chainId}`,
        isActive: token.isActive !== false,
      })),
    [data]
  );

  const activeCount = rows.filter((row) => row.isActive).length;

  return (
    <Panel
      title="Tokens en lista blanca"
      description={
        rows.length > 0
          ? `Tokens que la app acepta — ${activeCount} activos de ${rows.length}.`
          : "Tokens que la app acepta, activos e inactivos."
      }
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay tokens en lista blanca."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="tokens-lista-blanca"
          searchPlaceholder="Buscar por símbolo, nombre, red o dirección..."
          initialSorting={[{ id: "displaySymbol", desc: false }]}
          enablePagination={rows.length > 25}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Vista de solo lectura. El mismo símbolo puede repetirse en varias redes — cada fila es un
          contrato distinto, así que compara por red y dirección, no por símbolo.
        </p>
      </QueryState>
    </Panel>
  );
};

export default WhitelistedTokensPanel;
