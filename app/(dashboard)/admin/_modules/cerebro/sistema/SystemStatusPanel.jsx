"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains } from "@/constants/cerebro";
import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { cn } from "@/utils";
import { formatNumber, hoursSince, timeAgo } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

/**
 * An indexer that hasn't moved in this long is treated as stuck. The ported
 * dashboard greys out chains it knows are inactive; the v1 API doesn't expose
 * that flag, so every cursor is held to the same threshold here.
 */
const STALE_HOURS = 24;

const WarningIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M8 1.5 15 14H1L8 1.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
  </svg>
);

const SystemStatusPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const rows = useMemo(
    () =>
      (data?.system?.indexers ?? []).map((row) => ({
        ...row,
        chainName:
          cerebroChains[row.chainId] ?? (row.chainId ? `Chain ${row.chainId}` : "Multicadena"),
        hoursStale: hoursSince(row.updatedAt) ?? 0,
      })),
    [data]
  );

  const staleCount = rows.filter((row) => row.hoursStale > STALE_HOURS).length;

  const columns = useMemo(
    () => [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: (info) => <span className="text-[#19363F]">{info.getValue()}</span>,
      },
      {
        accessorKey: "kind",
        header: "Tipo",
        cell: (info) => (
          <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.6)]">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "lastBlock",
        header: "Último bloque",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.6)]">
            {formatNumber(info.getValue())}
          </span>
        ),
      },
      {
        // Sorts on hours-stale so "hace 3d" orders correctly against "hace 15h".
        accessorKey: "hoursStale",
        header: "Actualizado",
        meta: { align: "right", label: "Actualizado" },
        cell: ({ row }) => {
          const isStale = row.original.hoursStale > STALE_HOURS;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 tabular-nums",
                isStale ? "text-red-600 font-medium" : "text-[rgba(25,54,63,0.5)]"
              )}
            >
              {timeAgo(row.original.updatedAt)}
              {isStale && <WarningIcon />}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <Panel
      title="Estado del sistema"
      description="Cursores de los indexers y estado de la caché del backend. Un cursor parado significa que las cifras de las demás pestañas se quedan cortas hasta que se recupere."
      tone={staleCount > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {staleCount > 0 && (
          <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600 mb-2.5">
            {staleCount} {staleCount === 1 ? "cursor parado" : "cursores parados"} (&gt;{" "}
            {STALE_HOURS}h) — las cifras de otras pestañas pueden contar de menos mientras persista.
          </p>
        )}

        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-indexers"
          searchPlaceholder="Buscar cadena o tipo..."
          initialSorting={[{ id: "hoursStale", desc: true }]}
          enableSelection={false}
          bare
          dense
          maxHeight={340}
          emptyLabel="El endpoint no devolvió cursores de indexador."
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 pt-3 border-t-[0.7px] border-[rgba(25,54,63,0.06)]">
          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Caché del backend
            </span>
            <span
              className={cn(
                "font-inter text-[10px] font-medium tracking-[-0.4px]",
                data?.system?.backendCacheOk ? "text-emerald-700" : "text-red-600"
              )}
            >
              {data?.system?.backendCacheOk ? "OK" : "Con errores"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Última fee de tesorería
            </span>
            <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.65)]">
              {timeAgo(data?.data?.latestTreasuryFee)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Última operación de usuario
            </span>
            <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.65)]">
              {timeAgo(data?.data?.latestUserOp)}
            </span>
          </div>
        </div>
      </QueryState>
    </Panel>
  );
};

export default SystemStatusPanel;
