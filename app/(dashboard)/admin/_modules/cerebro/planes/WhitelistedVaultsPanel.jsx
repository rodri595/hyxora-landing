"use client";

import DataTable from "@/components/DataTable";
import { appApiChainLabels } from "@/constants/appApi";
import { useGetWhitelistedVaults } from "@/hooks/appApi/useGetWhitelistedVaults";
import { shortenHash } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatusBadge from "../../shared/StatusBadge";

/** A DefiLlama id is a UUID; anything much shorter is a leftover test value. */
const looksLikePlaceholder = (id) => Boolean(id) && id.length < 12;

const columns = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "chainLabel",
    header: "Red",
    cell: (info) => <span className="text-[rgba(25,54,63,0.5)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "type",
    header: "Protocolo",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "defillamaId",
    header: "DefiLlama ID",
    cell: (info) => {
      const id = info.getValue();
      if (!id) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

      return (
        <code
          className={
            looksLikePlaceholder(id)
              ? "font-mono text-[10px] tracking-tight text-amber-700 bg-amber-50 border border-amber-200 rounded-[4px] px-1 py-0.5"
              : "font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.55)]"
          }
        >
          {id}
        </code>
      );
    },
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
 * Vault whitelist, from app-api's `/admin/vaults`.
 *
 * `defillamaId` is surfaced because it feeds the APY the app displays: a vault
 * carrying a placeholder id shows a wrong yield to users, and the only way to
 * catch it is to read the ids. Short ones are highlighted amber.
 */
const WhitelistedVaultsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetWhitelistedVaults();

  const rows = useMemo(
    () =>
      (data ?? []).map((vault) => ({
        ...vault,
        chainLabel: appApiChainLabels[vault.chain] ?? vault.chain ?? `Chain ${vault.chainId}`,
        isActive: vault.isActive !== false,
      })),
    [data]
  );

  const activeCount = rows.filter((row) => row.isActive).length;

  return (
    <Panel
      title="Vaults en lista blanca"
      description={
        rows.length > 0
          ? `Vaults disponibles para depósito — ${activeCount} activos de ${rows.length}.`
          : "Vaults disponibles para depósito, activos e inactivos."
      }
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay vaults en lista blanca."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="vaults-lista-blanca"
          searchPlaceholder="Buscar por nombre, red, protocolo o dirección..."
          initialSorting={[{ id: "name", desc: false }]}
          enableSelection={false}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Vista de solo lectura. Un DefiLlama ID marcado en ámbar es sospechosamente corto para un
          UUID — suele ser un valor de prueba que dejaría el APY mal en la app.
        </p>
      </QueryState>
    </Panel>
  );
};

export default WhitelistedVaultsPanel;
