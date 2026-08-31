"use client";

import DataTable from "@/components/DataTable";
import { cerebroOperationLabel } from "@/constants/cerebro";
import { useGetFeesDiagnostics } from "@/hooks/cerebro/useGetFeesDiagnostics";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import { DIAGNOSTICS_DAYS, DIAGNOSTICS_LIMIT, DIAGNOSTICS_WINDOWS } from "./constants";

/**
 * Where the tag came from. The old query derives it in SQL — `operation_reason like
 * 'hyxora:%'` means the backend's authoritative `action_type` was cached (steps 0
 * and 0b of the tagger), anything else came off the router/method heuristic ladder —
 * so the two values are `hyxora` and `heuristic` and there is no third.
 *
 * A row that carries neither renders "—", never `heuristic`: guessing the field
 * would file every `hyxora` bucket under the ladder and hide exactly what this
 * column exists to show.
 */
const SourceBadge = ({ source }) => {
  if (!source) return <span className="text-[rgba(25,54,63,0.25)]">—</span>;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-1.5 py-0.5 font-inter text-[9px] font-medium tracking-[0.2px]",
        source.startsWith("hyxora")
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.04)] text-[rgba(25,54,63,0.55)]"
      )}
    >
      {source}
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
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">$0</span>;

      return (
        <span className="font-medium tabular-nums text-[#19363F]">
          {formatUsd(value, { decimals: 4 })}
        </span>
      );
    },
  },
];

/**
 * One row of `/fees/diagnostics`, in whatever spelling it arrives.
 *
 * The endpoint is a port of `getOpTagDiagnostics()` from the old dashboard, and
 * these ports keep the SQL's own column names more often than admin.md's: the doc
 * documents `operation` / `feesUsd` while the sibling `/fees/recent` sends
 * `operationType` / `amountUsd` for the very same treasury rows, and the query
 * itself aliases them `op` / `method` / `total_usd`. Reading every spelling is what
 * keeps the table from collapsing into a single «—» bucket.
 *
 * `transfers` only exists when the server already grouped. A row-level response has
 * none, and each row then counts as one transfer.
 *
 * `parentMethod` is empty far more often than not — the query `coalesce`s it to `''`
 * and the old lifetime table shows a method on one bucket out of twelve — so an
 * empty one is "this transfer had no parent method", not a missing field.
 *
 * @param {Object} row
 * @return {{ operation: string | null, source: string | null, parentMethod: string | null,
 * transfers: number, feesUsd: number, preGrouped: boolean }}
 */
const toTagRow = (row) => {
  const operation = row.operation ?? row.operationType ?? row.op ?? null;
  const reason = row.operationReason ?? row.reason ?? null;
  const transfers = Number(row.transfers ?? row.count ?? 0);
  const feesUsd = Number(row.feesUsd ?? row.totalUsd ?? row.amountUsd ?? 0);
  const preGrouped = Number.isFinite(transfers) && transfers > 0;

  return {
    operation: operation === "NULL" || operation === "" ? null : (operation ?? null),
    source:
      row.source ??
      (reason ? (String(reason).startsWith("hyxora") ? "hyxora" : "heuristic") : null),
    parentMethod: row.parentMethod || row.method || null,
    transfers: preGrouped ? transfers : 0,
    feesUsd: Number.isFinite(feesUsd) ? feesUsd : 0,
    preGrouped,
  };
};

/**
 * How the indexer is classifying fee inflows, one row per
 * `(operación, origen, método padre)` — the buckets the old dashboard's «Operation
 * tagging diagnostic» showed, and for the same purpose: a fat «Sin etiquetar» or
 * «Envío» bucket next to a recognisable parent method names exactly which router or
 * method is missing from `operation-tagger.ts`.
 *
 * The window defaults to a year because the old query ran with none at all; see
 * `DIAGNOSTICS_WINDOWS`. At 30 días the table was a strict subset of the old one —
 * same buckets, smaller counts — and had no `hyxora` row left in it.
 *
 * NFT sales are dropped the way the old query dropped them — treasury income, not a
 * user fee the tagger is meant to classify.
 */
const FeeTaggingPanel = () => {
  const [days, setDays] = useState(DIAGNOSTICS_DAYS);

  const { data, error, isLoading, isFetching, refetch } = useGetFeesDiagnostics({
    days,
    limit: DIAGNOSTICS_LIMIT,
  });

  const { rows, preGrouped, hasSource } = useMemo(() => {
    const buckets = new Map();
    let grouped = false;
    let withSource = false;

    for (const raw of data ?? []) {
      const row = toTagRow(raw);
      if (row.operation === "nft_sale") continue;
      if (row.preGrouped) grouped = true;
      if (row.source) withSource = true;

      const key = `${row.operation ?? "NULL"}|${row.source ?? ""}|${row.parentMethod ?? ""}`;
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
      hasSource: withSource,
    };
  }, [data]);

  const sampled = data?.length ?? 0;
  const truncated = !preGrouped && sampled >= DIAGNOSTICS_LIMIT;
  const windowLabel = days === 365 ? "último año" : `${days} días`;

  return (
    <Panel
      title="Diagnóstico de etiquetado de operaciones"
      meta={rows.length > 0 ? `${formatNumber(rows.length)} grupos · ${windowLabel}` : windowLabel}
      description="Cómo el indexer está etiquetando las entradas de comisiones. Sirve para detectar etiquetas que faltan: un grupo grande en «Sin etiquetar» o «Envío» con un método padre reconocible significa que ese router o método hay que añadirlo a operation-tagger.ts y volver a etiquetar. Los proveedores de on-ramp y off-ramp todavía no tienen ningún router registrado."
      action={
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] p-0.5">
            {DIAGNOSTICS_WINDOWS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                aria-pressed={days === option}
                className={cn(
                  "rounded-md px-2 py-1 font-inter text-[11px] font-medium tabular-nums tracking-[-0.44px] transition-colors",
                  days === option
                    ? "bg-[#19363F] text-white"
                    : "text-[rgba(25,54,63,0.55)] hover:bg-[rgba(25,54,63,0.04)]"
                )}
              >
                {option === 365 ? "1 a" : `${option} d`}
              </button>
            ))}
          </div>
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
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
          filename={`cerebro-etiquetado-comisiones-${days}d`}
          searchPlaceholder="Buscar operación, origen o método..."
          enableSelection={false}
          bare
          dense
        />

        <p className="mt-2.5 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          El dashboard antiguo leía esta tabla sin ventana, sobre todo el histórico. Cerebro exige
          una y la limita a 365 días, así que «1 a» es lo más parecido: a 30 días desaparecen los
          grupos etiquetados por el backend, que son más antiguos que la ventana.
        </p>

        {truncated && (
          <p className="mt-1.5 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Agrupado en el front sobre las {formatNumber(sampled)} filas más recientes de la ventana
            — el endpoint devuelve como mucho {DIAGNOSTICS_LIMIT} y no pagina, así que estos
            recuentos son una muestra, no el total.
          </p>
        )}

        {!hasSource && rows.length > 0 && (
          <div className="mt-2.5">
            <PendingEndpoint
              needs="Ninguna fila trae «origen», así que la columna va vacía: es el `case when operation_reason like 'hyxora:%'` de la consulta original, y separa las etiquetas que vienen del action_type del backend de las que salen de la escalera heurística de routers. Sin él no se puede saber cuánto está resolviendo cada una, que es la mitad del diagnóstico."
              fields={["GET /fees/diagnostics → source: 'hyxora' | 'heuristic'"]}
            />
          </div>
        )}
      </QueryState>
    </Panel>
  );
};

export default FeeTaggingPanel;
