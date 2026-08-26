"use client";

import DataTable from "@/components/DataTable";
import { cerebroOperationLabel } from "@/constants/cerebro";
import { useGetFeesDiagnostics } from "@/hooks/cerebro/useGetFeesDiagnostics";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { DIAGNOSTICS_LIMIT, REVENUE_DAYS } from "./constants";

const SourceBadge = ({ source }) => {
  const isHyxora = String(source ?? "").startsWith("hyxora");

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

/**
 * The bucket is untagged when the indexer never resolved an operation. The old
 * dashboard painted those rose because they are the rows the panel exists for;
 * `send` counts too — it is where the tagger lands when a router is missing.
 */
const isUntagged = (operation) =>
  operation === null || operation === "unknown" || operation === "send";

const columns = [
  {
    accessorKey: "operation",
    header: "Operación",
    cell: (info) => {
      const operation = info.getValue();

      return (
        <span
          className={
            isUntagged(operation) ? "font-medium text-rose-600" : "font-medium text-[#19363F]"
          }
        >
          {operation === null ? "Sin etiquetar" : cerebroOperationLabel(operation)}
        </span>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Origen",
    cell: (info) => <SourceBadge source={info.getValue()} />,
  },
  {
    accessorKey: "parentMethod",
    header: "Método padre",
    cell: (info) => {
      const method = info.getValue();
      if (!method) return <span className="text-[rgba(25,54,63,0.25)]">—</span>;

      return <span className="font-mono text-[10px] text-[rgba(25,54,63,0.6)]">{method}</span>;
    },
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
 * One row of `/fees/diagnostics`, in whatever spelling it arrives.
 *
 * The endpoint is a port of `getOpTagDiagnostics()` from the old dashboard, and
 * these ports keep the SQL's own column names more often than admin.md's: the doc
 * documents `operation` / `feesUsd` while the sibling `/fees/recent` sends
 * `operationType` / `amountUsd` for the very same treasury rows. Reading every
 * spelling is what keeps the table from collapsing into a single «—» bucket.
 *
 * `transfers` only exists when the server already grouped. A row-level response
 * has none, and each row then counts as one transfer.
 *
 * @param {Object} row
 * @return {{ operation: string | null, source: string, parentMethod: string | null,
 * transfers: number, feesUsd: number, preGrouped: boolean }}
 */
const toTagRow = (row) => {
  const operation = row.operation ?? row.operationType ?? row.op ?? null;
  const reason = String(row.operationReason ?? row.reason ?? "");
  const transfers = Number(row.transfers ?? row.count ?? 0);
  const feesUsd = Number(row.feesUsd ?? row.totalUsd ?? row.amountUsd ?? 0);
  const preGrouped = Number.isFinite(transfers) && transfers > 0;

  return {
    operation: operation === "NULL" || operation === "" ? null : (operation ?? null),
    source: row.source ?? (reason.startsWith("hyxora") ? "hyxora" : "heuristic"),
    parentMethod: row.parentMethod ?? row.method ?? row.parent_method ?? null,
    transfers: preGrouped ? transfers : 0,
    feesUsd: Number.isFinite(feesUsd) ? feesUsd : 0,
    preGrouped,
  };
};

/**
 * How the indexer is classifying fee inflows, one row per
 * `(operación, origen, método padre)` — the buckets the old dashboard's «Operation
 * tagging diagnostic» showed, and for the same purpose: a fat «Sin etiquetar» or
 * «Envío» bucket next to a recognisable parent method names exactly which router
 * or method is missing from `operation-tagger.ts`.
 *
 * NFT sales are dropped the way the old query dropped them — treasury income, not
 * a user fee the tagger is meant to classify.
 */
const FeeTaggingPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeesDiagnostics({
    days: REVENUE_DAYS,
    limit: DIAGNOSTICS_LIMIT,
  });

  const { rows, preGrouped, hasParentMethod } = useMemo(() => {
    const buckets = new Map();
    let grouped = false;
    let withMethod = false;

    for (const raw of data ?? []) {
      const row = toTagRow(raw);
      if (row.operation === "nft_sale") continue;
      if (row.preGrouped) grouped = true;
      if (row.parentMethod) withMethod = true;

      const key = `${row.operation ?? "NULL"}|${row.source}|${row.parentMethod ?? ""}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          operation: row.operation,
          source: row.source,
          parentMethod: row.parentMethod,
          transfers: 0,
          feesUsd: 0,
        });
      }

      const bucket = buckets.get(key);
      bucket.transfers += row.transfers || 1;
      bucket.feesUsd += row.feesUsd;
    }

    return {
      rows: [...buckets.values()].sort(
        (a, b) => b.transfers - a.transfers || b.feesUsd - a.feesUsd
      ),
      preGrouped: grouped,
      hasParentMethod: withMethod,
    };
  }, [data]);

  const sampled = data?.length ?? 0;

  return (
    <Panel
      title="Diagnóstico de etiquetado de operaciones"
      meta={
        rows.length > 0
          ? `${formatNumber(rows.length)} grupos · ${REVENUE_DAYS} días`
          : `Últimos ${REVENUE_DAYS} días`
      }
      description="Cómo el indexer está etiquetando las entradas de comisiones. Sirve para detectar etiquetas que faltan: un grupo grande en «Sin etiquetar» o «Envío» con un método padre reconocible significa que ese router o método hay que añadirlo a operation-tagger.ts y volver a etiquetar. Los proveedores de on-ramp y off-ramp todavía no tienen ningún router registrado."
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
          searchPlaceholder="Buscar operación, origen o método..."
          enableSelection={false}
          bare
          dense
        />

        {!preGrouped && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
            Agrupado en el front sobre las {formatNumber(sampled)} filas más recientes de los
            últimos {REVENUE_DAYS} días — el endpoint devuelve como mucho {DIAGNOSTICS_LIMIT} y no
            pagina, así que estos recuentos son una muestra, no el total de la ventana.
          </p>
        )}

        {!hasParentMethod && (
          <div className="mt-2.5">
            <PendingEndpoint
              needs="Ninguna fila trae «método padre»: el nombre del método del contrato que originó la transferencia (multiSend, execute…). Es justo el dato que dice qué router hay que añadir a operation-tagger.ts, y la columna ya está lista para pintarlo en cuanto el endpoint lo mande."
              fields={["GET /fees/diagnostics → parentMethod por fila"]}
            />
          </div>
        )}
      </QueryState>
    </Panel>
  );
};

export default FeeTaggingPanel;
