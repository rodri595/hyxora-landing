"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetCostsRecent } from "@/hooks/cerebro/useGetCostsRecent";
import { cn } from "@/utils";
import { formatDateTime, formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import TxLink from "../../shared/TxLink";
import { RECENT_OPS_PAGE_SIZE, RECENT_OPS_PAGE_SIZES } from "./constants";

/**
 * `/costs/recent` is the one endpoint here that answers in snake_case — these are
 * indexer rows handed straight through rather than a shaped response. Normalise at
 * the edge so the columns below read like every other table on the tab, and accept
 * the camelCase spellings too in case that gets tidied upstream.
 *
 * @param {Object} row
 * @return {Object}
 */
const toSponsoredOpRow = (row) => {
  const source = row.source ?? null;
  const chainId = row.chain_id ?? row.chainId ?? null;
  const gasUsd = Number(row.cost_usd ?? row.costUsd ?? 0);
  const invoiceUsd = Number(row.bundler_cost_usd ?? row.bundlerCostUsd ?? 0);

  return {
    // Chain id and source can disagree; `source` is the authoritative one, so a
    // Solana row is labelled Solana even if the numeric id means nothing to us.
    chainId,
    chainName: source === "solana" ? "Solana" : cerebroChainLabel({ chainId }),
    source,
    txHash: row.tx_hash ?? row.txHash ?? "",
    sender: row.sender ?? "",
    timestamp: row.block_timestamp ?? row.blockTimestamp ?? null,
    gasUsd: Number.isFinite(gasUsd) ? gasUsd : 0,
    invoiceUsd: Number.isFinite(invoiceUsd) ? invoiceUsd : 0,
  };
};

/**
 * What Pimlico adds on top of the gas, as a percentage.
 *
 * Rendered rather than left to be eyeballed across two columns: it is the number
 * that says whether the bundler is charging what we think it is. On Solana we pay
 * the fee-payer directly, so the two figures match and this reads 0%.
 */
const MarkupCell = ({ gasUsd, invoiceUsd }) => {
  if (!(gasUsd > 0) || !(invoiceUsd > 0)) {
    return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
  }

  const pct = (invoiceUsd / gasUsd - 1) * 100;
  if (!Number.isFinite(pct)) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <span
      className={cn(
        "tabular-nums",
        pct > 50 ? "text-amber-700" : "text-[rgba(25,54,63,0.5)]",
        Math.abs(pct) < 0.05 && "text-[rgba(25,54,63,0.3)]"
      )}
    >
      {pct >= 0 ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
};

const SenderCell = ({ sender, source }) => {
  if (!sender) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <span
      className="font-mono text-[10px] text-[rgba(25,54,63,0.55)]"
      title={source === "solana" ? `Fee-payer de Solana: ${sender}` : `Cuenta que firmó: ${sender}`}
    >
      {shortenHash(sender)}
    </span>
  );
};

// Nothing sorts: the endpoint orders by time and accepts no sort parameter, so a
// header click would reorder the 25 rows on screen as if it had reordered all of them.
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
    accessorKey: "sender",
    header: "Emisor",
    enableSorting: false,
    cell: (info) => <SenderCell sender={info.getValue()} source={info.row.original.source} />,
  },
  {
    accessorKey: "txHash",
    header: "Tx",
    enableSorting: false,
    cell: (info) => <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />,
  },
  {
    accessorKey: "gasUsd",
    header: "Gas on-chain",
    meta: { align: "right", label: "Gas" },
    enableSorting: false,
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatUsd(info.getValue(), { decimals: 6 })}
      </span>
    ),
  },
  {
    accessorKey: "invoiceUsd",
    header: "Facturado",
    meta: { align: "right" },
    enableSorting: false,
    cell: (info) => (
      <span className="font-medium tabular-nums text-red-600">
        {formatUsd(info.getValue(), { decimals: 6 })}
      </span>
    ),
  },
  {
    id: "markup",
    header: "Recargo",
    meta: { align: "right" },
    enableSorting: false,
    cell: (info) => (
      <MarkupCell gasUsd={info.row.original.gasUsd} invoiceUsd={info.row.original.invoiceUsd} />
    ),
  },
];

/**
 * Every sponsored operation, newest first, paginated by the server.
 *
 * This section was a `PendingEndpoint` until `/costs/recent` shipped.
 * `/costs/expensive` — still below, under «Disponible en Cerebro» — is a review
 * tool: it caps at 200 rows above a USD threshold, reports no total, and folds the
 * two cost figures into one. This walks the whole feed, EVM and Solana interleaved
 * by time, and keeps `cost_usd` (gas on chain) apart from `bundler_cost_usd` (what
 * Pimlico invoices). Only with both can a month be reconciled against
 * dashboard.pimlico.io, which is why the split is worth two columns and a percentage.
 *
 * No search box: the endpoint has no search parameter, and a filter that only reached
 * the rows on screen would read as though it had searched all of them.
 */
const RecentSponsoredOpsPanel = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: RECENT_OPS_PAGE_SIZE,
  });

  const { data, error, isLoading, isFetching, refetch } = useGetCostsRecent({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });

  const rows = useMemo(() => (data?.rows ?? []).map(toSponsoredOpRow), [data]);
  const total = data?.total ?? 0;

  return (
    <Panel
      title="Últimas ops patrocinadas"
      meta={total > 0 ? `${formatNumber(total)} en total` : undefined}
      description="Cada operación cuyo gas hemos pagado, de la más reciente a la más antigua, EVM y Solana en la misma lista."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay operaciones patrocinadas registradas."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-ops-patrocinadas-recientes"
          emptyLabel="No hay operaciones en esta página."
          enableSelection={false}
          enableSearch={false}
          showRowCount={false}
          enablePagination
          manualPagination
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSizeOptions={RECENT_OPS_PAGE_SIZES}
          isFetching={isFetching}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          «Gas on-chain» es lo que costó la transacción; «Facturado» es lo que cobra Pimlico con su
          recargo, y esa es la cifra que cuadra con dashboard.pimlico.io. En Solana pagamos desde el
          fee-payer directamente, así que las dos coinciden y el emisor es esa cuenta, no la del
          usuario. La exportación baja la página que estás viendo, no las {formatNumber(total)}{" "}
          filas.
        </p>
      </QueryState>
    </Panel>
  );
};

export default RecentSponsoredOpsPanel;
