"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel, cerebroOperationLabels } from "@/constants/cerebro";
import { useGetFeesRecent } from "@/hooks/cerebro/useGetFeesRecent";
import { formatDateTime, formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useCallback, useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import TxLink from "../../shared/TxLink";
import WhitelistToggle from "./WhitelistToggle";
import { FEES_PAGE_SIZE, FEES_PAGE_SIZES } from "./constants";

/**
 * Field names are the ones `/fees/recent` documents, with the `/fees/diagnostics`
 * spellings accepted as fallbacks — the two endpoints report the same inflows and
 * this panel ran on the other one until recently.
 *
 * @param {Object} row
 * @return {Object}
 */
const toFeeRow = (row) => {
  const amountUsd = Number(row.amountUsd ?? row.feesUsd ?? row.totalUsd ?? 0);
  const operation = row.operationType ?? row.operation ?? null;

  return {
    chainId: row.chainId ?? null,
    chainName: cerebroChainLabel(row),
    txHash: row.txHash ?? "",
    from: row.fromAddress ?? row.from ?? "",
    to: row.toAddress ?? row.to ?? "",
    tokenSymbol: row.tokenSymbol ?? null,
    operation,
    operationLabel: cerebroOperationLabels[operation] ?? operation ?? "—",
    timestamp: row.blockTimestamp ?? row.timestamp ?? null,
    amountUsd: Number.isFinite(amountUsd) ? amountUsd : 0,
  };
};

const columns = [
  {
    accessorKey: "timestamp",
    header: "Hora",
    enableSorting: false,
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.65)]">
        {formatDateTime(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "chainName",
    header: "Cadena",
    enableSorting: false,
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "operationLabel",
    header: "Op",
    enableSorting: false,
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "from",
    header: "Pagador",
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
      return (
        <span className="font-mono text-[10px] text-[rgba(25,54,63,0.55)]" title={value}>
          {shortenHash(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "tokenSymbol",
    header: "Token",
    enableSorting: false,
    cell: (info) => (
      <span className="font-medium text-[rgba(25,54,63,0.7)]">{info.getValue() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "amountUsd",
    header: "USD",
    meta: { align: "right" },
    enableSorting: false,
    cell: (info) => (
      <span className="font-medium tabular-nums text-emerald-700">
        {formatUsd(info.getValue(), { decimals: 4 })}
      </span>
    ),
  },
  {
    accessorKey: "txHash",
    header: "Tx",
    enableSorting: false,
    cell: (info) => <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />,
  },
];

/**
 * The individual fee inflows behind every number on this tab, newest first.
 *
 * Ran on `/fees/diagnostics` until `/fees/recent` shipped, and the difference is why
 * this stopped being half a panel with an ask under it: diagnostics is a tagging
 * debug endpoint — 100 rows, no total, no payer and no token — while this paginates
 * over the whole ledger and carries both. The tagging panel above still reads
 * diagnostics, which is what it is for.
 *
 * The whitelist toggle is the same one the two revenue breakdowns carry, so the
 * detail can be reconciled against them under the same filter; off by default, like
 * the API.
 */
const LatestUserFeesPanel = () => {
  const [includeNonWhitelisted, setIncludeNonWhitelisted] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: FEES_PAGE_SIZE });

  const { data, error, isLoading, isFetching, refetch } = useGetFeesRecent({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    includeNonWhitelisted: includeNonWhitelisted || undefined,
  });

  // Switching the filter changes what row 1 is, so an old page index would land
  // somewhere arbitrary in the new list.
  const handleWhitelistChange = useCallback((next) => {
    setIncludeNonWhitelisted(next);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const rows = useMemo(() => (data?.rows ?? []).map(toFeeRow), [data]);
  const total = data?.total ?? 0;

  return (
    <Panel
      title="Últimas comisiones de usuario"
      meta={total > 0 ? `${formatNumber(total)} en total` : undefined}
      description="Cada cobro individual que ha entrado en el tesoro, del más reciente al más antiguo, con quién lo pagó y en qué token."
      action={
        <div className="flex items-center gap-2">
          <WhitelistToggle value={includeNonWhitelisted} onChange={handleWhitelistChange} />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No se registraron comisiones."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-comisiones-recientes"
          emptyLabel="No hay comisiones en esta página."
          enableSelection={false}
          enableSearch={false}
          showRowCount={false}
          enablePagination
          manualPagination
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSizeOptions={FEES_PAGE_SIZES}
          isFetching={isFetching}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Sin ventana de días: esto recorre el registro entero, no los últimos 30 días como el resto
          de la pestaña. El endpoint no acepta búsqueda ni orden, así que la tabla no los ofrece —
          filtrar solo esta página daría la impresión de haber buscado en todas. La exportación baja
          la página que estás viendo, no las {formatNumber(total)} filas.
        </p>
      </QueryState>
    </Panel>
  );
};

export default LatestUserFeesPanel;
