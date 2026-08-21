"use client";

import DataTable from "@/components/DataTable";
import { cerebroOperationLabels } from "@/constants/cerebro";
import { useGetFeesDiagnostics } from "@/hooks/cerebro/useGetFeesDiagnostics";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { DIAGNOSTICS_LIMIT, REVENUE_DAYS } from "./constants";

const SourceBadge = ({ source }) => {
  const isHyxora = source === "hyxora" || String(source ?? "").startsWith("hyxora");

  return (
    <span
      className={
        isHyxora
          ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-inter text-[9px] font-medium tracking-[0.2px] text-emerald-700"
          : "inline-flex rounded-full border border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.04)] px-1.5 py-0.5 font-inter text-[9px] font-medium tracking-[0.2px] text-[rgba(25,54,63,0.55)]"
      }
    >
      {source ?? "—"}
    </span>
  );
};

const columns = [
  {
    accessorKey: "operation",
    header: "Operación",
    cell: (info) => (
      <span className="font-medium text-[#19363F]">
        {cerebroOperationLabels[info.getValue()] ?? info.getValue() ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Origen",
    cell: (info) => <SourceBadge source={info.getValue()} />,
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
  },
  {
    accessorKey: "feesUsd",
    header: "USD",
    meta: { align: "right" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-[#19363F]">
        {formatUsd(info.getValue(), { decimals: 4 })}
      </span>
    ),
  },
];

/**
 * How the indexer is classifying fee inflows, grouped by (operación, origen).
 *
 * The grouping is done here, not by the API: `/fees/diagnostics` returns raw rows.
 * That means the counts describe the most recent page of rows in the window,
 * not the whole window — enough to spot a tagging gap, not a reporting figure.
 */
const FeeTaggingPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeesDiagnostics({
    days: REVENUE_DAYS,
    limit: DIAGNOSTICS_LIMIT,
  });

  const rows = useMemo(() => {
    const byTag = new Map();

    for (const row of data ?? []) {
      const key = `${row.operation}|${row.source}`;
      if (!byTag.has(key)) {
        byTag.set(key, {
          operation: row.operation,
          source: row.source,
          transfers: 0,
          feesUsd: 0,
        });
      }

      const tag = byTag.get(key);
      tag.transfers += 1;
      tag.feesUsd += row.feesUsd ?? 0;
    }

    return [...byTag.values()].sort((a, b) => b.transfers - a.transfers);
  }, [data]);

  const sampled = data?.length ?? 0;

  return (
    <Panel
      title="Diagnóstico de etiquetado de operaciones"
      description="Cómo el indexer está etiquetando las entradas de comisiones. Sirve para detectar etiquetas que faltan: muchas filas en «otros» o un origen heurístico dominante significa que hay un router o método sin mapear en el indexer."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="El endpoint no devolvió filas de diagnóstico."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-etiquetado-comisiones-${REVENUE_DAYS}d`}
          searchPlaceholder="Buscar operación u origen..."
          enableSelection={false}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
          Agrupado en el front sobre las {formatNumber(sampled)} filas más recientes de los últimos{" "}
          {REVENUE_DAYS} días — el endpoint devuelve como mucho {DIAGNOSTICS_LIMIT} y no pagina, así
          que estos recuentos son una muestra, no el total de la ventana.
        </p>

        <div className="mt-2.5">
          <PendingEndpoint
            needs="Falta la columna «método padre» del dashboard original: el nombre del método del contrato que originó la transferencia (multiSend, execute…). Es justo el dato que dice qué router hay que añadir a operation-tagger.ts. Con recuentos agregados por el servidor tampoco haría falta muestrear en el front."
            fields={[
              "GET /fees/diagnostics → parentMethod por fila",
              "GET /fees/diagnostics/summary?days=30 → operation, source, parentMethod, transfers, feesUsd",
            ]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default FeeTaggingPanel;
