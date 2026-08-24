"use client";

import DataTable from "@/components/DataTable";
import { useGetServiceHealth } from "@/hooks/monitoring/useGetServiceHealth";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatusBadge from "../../shared/StatusBadge";

const columns = [
  {
    accessorKey: "name",
    header: "Servicio",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "env",
    header: "Entorno",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">
        {info.getValue() === "prod" ? "Producción" : "Staging"}
      </span>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: (info) => (
      <code className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.5)]">
        {info.getValue().replace(/^https?:\/\//, "")}
      </code>
    ),
  },
  {
    accessorKey: "httpStatus",
    header: "HTTP",
    meta: { align: "right" },
    cell: (info) => {
      const status = info.getValue();
      return (
        <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
          {status ?? <span className="text-[rgba(25,54,63,0.3)]">—</span>}
        </span>
      );
    },
  },
  {
    accessorKey: "latencyMs",
    header: "Latencia",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatNumber(info.getValue())} ms
      </span>
    ),
  },
  {
    accessorKey: "isUp",
    header: "Estado",
    cell: (info) => {
      const { error } = info.row.original;
      return (
        <div className="flex items-center gap-1.5">
          <StatusBadge active={info.getValue()} activeLabel="ARRIBA" inactiveLabel="CAÍDO" />
          {error && <span className="font-inter text-[9px] text-red-600">{error}</span>}
        </div>
      );
    },
  },
];

/**
 * Liveness of the API and the App, staging and production.
 *
 * A 401 or 404 counts as up: these hosts are auth-gated, so any HTTP response
 * proves the process is answering. Only a network error or timeout is down —
 * which is why the HTTP column can read 401 next to a green badge.
 */
const ServicesPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetServiceHealth();

  const rows = useMemo(
    () => (data?.services ?? []).map((row) => ({ ...row, isUp: row.status === "up" })),
    [data]
  );

  const downCount = rows.filter((row) => !row.isUp).length;

  return (
    <Panel
      title="Estado de servicios"
      description={
        rows.length > 0
          ? downCount === 0
            ? "Todos los servicios responden."
            : `${downCount} de ${rows.length} servicios no responden.`
          : "Latencia y código HTTP de la API y la App en staging y producción."
      }
      tone={downCount > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay servicios configurados."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="estado-servicios"
          enableSelection={false}
          enableSearch={false}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Un 401 o 404 cuenta como «arriba»: estos hosts piden autenticación, así que cualquier
          respuesta HTTP demuestra que el proceso está vivo. Solo un error de red o un timeout se
          consideran caída.
        </p>
      </QueryState>
    </Panel>
  );
};

export default ServicesPanel;
