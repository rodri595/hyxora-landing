"use client";

import DataTable from "@/components/DataTable";
import { useGetUserTransactions } from "@/hooks/cerebro/useGetUserTransactions";
import { formatDateTime, formatNumber, formatUsdPrecise } from "@/utils/format";
import { useMemo, useState } from "react";
import QueryState from "../../../shared/QueryState";
import TxLink from "../../../shared/TxLink";
import { TX_PAGE_SIZE, TX_PAGE_SIZES } from "../constants";
import { readTxRows } from "./normalize";
import { Footnote, OperationBadge, SignedUsd } from "./parts";

/**
 * The «Detalle» column: what was swapped for what, and across which chains.
 *
 * Only rows the app backend tagged carry this — the heuristic tagger knows an op
 * happened but not what it moved — so a blank cell here means "we don't have the
 * activity record", not "nothing moved". Rendering a dash rather than guessing is
 * the same choice `ingresos/FeeTaggingPanel` makes about a missing `source`.
 */
const DetailCell = ({ detail }) => {
  const { from, to, hop } = detail;
  if (!from && !to) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <span className="whitespace-nowrap font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
      {from && to ? `${from} → ${to}` : (from ?? to)}
      {hop && <span className="ml-1.5 text-[10px] text-[rgba(25,54,63,0.35)]">· {hop}</span>}
    </span>
  );
};

/**
 * Cost is red because it is money out, and it is never zero on a real op — a row
 * showing "—" there is one whose gas we failed to price, which is worth being able
 * to see rather than reading as free.
 */
const columns = [
  {
    id: "time",
    accessorKey: "timestamp",
    header: "Hora",
    cell: (info) => (
      <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.55)]">
        {formatDateTime(info.getValue())}
      </span>
    ),
  },
  {
    id: "chain",
    accessorKey: "chainLabel",
    header: "Red",
    cell: (info) => (
      <span className="whitespace-nowrap text-[rgba(25,54,63,0.65)]">{info.getValue()}</span>
    ),
  },
  {
    id: "operation",
    accessorKey: "operation",
    header: "Operación",
    cell: (info) => <OperationBadge operation={info.getValue()} />,
  },
  {
    id: "detail",
    accessorKey: "detail",
    header: "Detalle",
    enableSorting: false,
    cell: (info) => <DetailCell detail={info.getValue()} />,
  },
  {
    id: "cost",
    accessorKey: "costUsd",
    header: "Coste",
    meta: { align: "right" },
    cell: (info) => {
      const row = info.row.original;
      const value = info.getValue();
      if (value === null) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

      return (
        <span
          className="tabular-nums text-red-600"
          // The split is the Pimlico bill: bundler gas plus the 10% paymaster
          // surcharge. Worth having, not worth two more columns in a drawer.
          title={
            row.bundlerCostUsd !== null
              ? `Bundler ${formatUsdPrecise(row.bundlerCostUsd)} · Paymaster ${formatUsdPrecise(row.paymasterCostUsd)}`
              : undefined
          }
        >
          {formatUsdPrecise(value)}
        </span>
      );
    },
  },
  {
    id: "fee",
    accessorKey: "feeUsd",
    header: "Comisión",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

      return (
        <span
          className="tabular-nums text-emerald-700"
          title={info.row.original.feeTokens ?? undefined}
        >
          {formatUsdPrecise(value)}
        </span>
      );
    },
  },
  {
    id: "net",
    accessorKey: "netUsd",
    header: "Margen",
    meta: { align: "right" },
    cell: (info) => <SignedUsd value={info.getValue()} dashZero />,
  },
  {
    id: "tx",
    accessorKey: "txHash",
    header: "Tx",
    enableSorting: false,
    cell: (info) =>
      info.getValue() ? (
        <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />
      ) : (
        <span className="text-[rgba(25,54,63,0.3)]">—</span>
      ),
  },
];

/**
 * Tab 3 — every sponsored operation, newest first.
 *
 * Paginated by the server through its own endpoint rather than by re-reading
 * `/users/{privyId}`: paging here would otherwise refetch the whole portfolio, the
 * ramp orders and the free-vs-paid split to change fifteen rows.
 *
 * The first page arrives embedded in the detail response, so it renders instantly
 * and this query only takes over from page two — hence `initialRows`, which stands
 * in while page 1 resolves on its own.
 *
 * @param {Object} props
 * @param {string} props.privyId
 * @param {Object[]} props.initialRows Already normalised by `readTxRows`.
 * @param {number} props.initialTotal
 */
const TransaccionesTab = ({ privyId, initialRows, initialTotal }) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: TX_PAGE_SIZE });

  const { data, error, isLoading, isFetching } = useGetUserTransactions(privyId, {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const rows = useMemo(() => {
    const fetched = readTxRows(data);
    // Page 1 at the default size is exactly what the detail response already
    // carried, so show that rather than a spinner over rows we have.
    if (fetched.length > 0) return fetched;
    return pagination.pageIndex === 0 ? initialRows : [];
  }, [data, initialRows, pagination.pageIndex]);

  const total = data?.total ?? initialTotal ?? 0;

  return (
    <div className="flex flex-col gap-3 p-4">
      <QueryState isLoading={isLoading && rows.length === 0} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename="usuario-transacciones"
          getRowId={(row) => row.id}
          emptyLabel="Este usuario no tiene ninguna operación patrocinada."
          showRowCount={false}
          enableSearch={false}
          // Row-level records, so the checkboxes stay: picking a handful of ops and
          // exporting just those is a real thing to want (CLAUDE.md), and export
          // already prefers the selection over the page.
          enablePagination
          manualPagination
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSizeOptions={TX_PAGE_SIZES}
          isFetching={isFetching}
          bare
          dense
        />

        <Footnote>
          {formatNumber(total)} operaciones patrocinadas, de la más reciente a la más antigua.
          «Coste» es la factura de Pimlico —bundler más el 10% de paymaster, en el tooltip— y
          «Comisión» lo que el usuario nos pagó en esa misma tx, en blanco si no pagó ninguna.
          «Detalle» solo aparece en las operaciones que etiquetó el backend: las que clasificó la
          heurística saben que hubo una operación pero no qué movió. La exportación baja la página
          que estás viendo, o solo las filas que marques.
        </Footnote>
      </QueryState>
    </div>
  );
};

export default TransaccionesTab;
