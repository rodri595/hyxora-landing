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

const WhitelistedVaultsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetWhitelist("vaults");

  const rows = useMemo(
    () => normalizeWhitelistRows(data, "vaults").map((row) => ({ ...row, chain: chainLabel(row) })),
    [data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-medium",
              row.original.active ? "text-[#19363F]" : "text-[rgba(25,54,63,0.4)]"
            )}
          >
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "chain", header: "Cadena" },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: (info) => (
          <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "defiLlamaId",
        header: "DefiLlama ID",
        cell: (info) => {
          const id = info.getValue();
          if (!id) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.5)]">
                {id}
              </span>
              <CopyButton text={id} />
            </div>
          );
        },
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
      title="Vaults en lista blanca"
      description="Vaults disponibles para depósito. El DefiLlama ID es el que alimenta el APY mostrado en la app."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel={`Sin datos. Endpoint sin confirmar: GET ${WHITELIST_ENDPOINTS.vaults}`}
      >
        <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mb-2">
          {rows.length} vaults · {rows.filter((row) => row.active).length} activos
        </p>

        <DataTable
          data={rows}
          columns={columns}
          filename="hyxora-vaults-whitelist"
          searchPlaceholder="Buscar vault, cadena o tipo..."
          initialSorting={[{ id: "active", desc: true }]}
          enableSelection={false}
          bare
          dense
          maxHeight={480}
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
          Solo lectura. A diferencia del dashboard original —que usa un bot token y choca con
          mutaciones <code className="font-mono">adminOnly</code>— aquí ya viajamos con el JWT de un
          usuario con rol Admin, así que editar la lista blanca es posible cuando queramos
          construirlo.
        </p>
      </QueryState>
    </Panel>
  );
};

export default WhitelistedVaultsPanel;
