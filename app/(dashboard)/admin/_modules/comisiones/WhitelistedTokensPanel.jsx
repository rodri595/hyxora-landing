"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import { WHITELIST_ENDPOINTS, useGetWhitelist } from "@/hooks/admin/useGetWhitelist";
import { cn, shortenAddress } from "@/utils";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../shared/Panel";
import QueryState from "../shared/QueryState";
import StatusBadge from "../shared/StatusBadge";
import { chainLabel, normalizeWhitelistRows } from "./normalize";

const WhitelistedTokensPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetWhitelist("tokens");

  const rows = useMemo(
    () => normalizeWhitelistRows(data, "tokens").map((row) => ({ ...row, chain: chainLabel(row) })),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "symbol",
        header: "Símbolo",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-medium",
              row.original.active ? "text-[#19363F]" : "text-[rgba(25,54,63,0.4)]"
            )}
          >
            {row.original.symbol}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
          <span className={row.original.active ? "text-[#19363F]" : "text-[rgba(25,54,63,0.4)]"}>
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "chain", header: "Cadena" },
      {
        accessorKey: "decimals",
        header: "Decimales",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.6)]">{info.getValue() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "address",
        header: "Dirección",
        cell: (info) => {
          const address = info.getValue();
          if (!address) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.6)]">
                {shortenAddress(address)}
              </span>
              <CopyButton text={address} />
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Estado",
        cell: (info) => <StatusBadge active={info.getValue()} />,
      },
    ],
    []
  );

  return (
    <Panel
      title="Tokens en lista blanca"
      description="Tokens que la app acepta. Los inactivos siguen listados para poder reactivarlos sin volver a cargarlos."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel={`Sin datos. Endpoint sin confirmar: GET ${WHITELIST_ENDPOINTS.tokens}`}
      >
        <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mb-2">
          {rows.length} tokens · {rows.filter((row) => row.active).length} activos
        </p>

        <DataTable
          data={rows}
          columns={columns}
          filename="hyxora-tokens-whitelist"
          searchPlaceholder="Buscar símbolo, nombre o cadena..."
          initialSorting={[{ id: "active", desc: true }]}
          enableSelection={false}
          bare
          dense
          maxHeight={480}
        />
      </QueryState>
    </Panel>
  );
};

export default WhitelistedTokensPanel;
