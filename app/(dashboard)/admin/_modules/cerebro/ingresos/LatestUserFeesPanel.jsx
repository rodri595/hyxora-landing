"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains, cerebroOperationLabels } from "@/constants/cerebro";
import { useGetFeesDiagnostics } from "@/hooks/cerebro/useGetFeesDiagnostics";
import { formatDateTime, formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import TxLink from "../../shared/TxLink";
import { DIAGNOSTICS_LIMIT, REVENUE_DAYS } from "./constants";

const columns = [
  {
    accessorKey: "timestamp",
    header: "Hora",
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.65)]">
        {formatDateTime(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "chainName",
    header: "Cadena",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "operation",
    header: "Op",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">
        {cerebroOperationLabels[info.getValue()] ?? info.getValue() ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Origen",
    cell: (info) => <span className="text-[rgba(25,54,63,0.45)]">{info.getValue() ?? "—"}</span>,
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
  {
    accessorKey: "txHash",
    header: "Tx",
    cell: (info) => <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />,
  },
];

/**
 * The individual fee inflows behind every number on this tab, newest first.
 *
 * Same query as the tagging panel — react-query serves both from one request, so
 * refreshing either updates both.
 */
const LatestUserFeesPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeesDiagnostics({
    days: REVENUE_DAYS,
    limit: DIAGNOSTICS_LIMIT,
  });

  const rows = useMemo(
    () =>
      [...(data ?? [])]
        .map((row) => ({
          ...row,
          chainName: cerebroChains[row.chainId] ?? `Chain ${row.chainId}`,
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [data]
  );

  return (
    <Panel
      title={`Últimas comisiones de usuario (${formatNumber(rows.length)})`}
      description={`Cada cobro individual de los últimos ${REVENUE_DAYS} días, del más reciente al más antiguo.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No se registraron comisiones en la ventana."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-comisiones-${REVENUE_DAYS}d`}
          searchPlaceholder="Buscar por cadena, operación o hash..."
          enableSelection={false}
          bare
          dense
          maxHeight={420}
        />

        <div className="mt-2.5">
          <PendingEndpoint
            needs={`El listado del dashboard original trae además quién pagó, con qué token y cuánto (0.007500 USDC), y pagina sobre el total. Aquí solo se ven las ${DIAGNOSTICS_LIMIT} filas más recientes: /fees/diagnostics es un endpoint de depuración, sin paginación, sin total y sin remitente ni token.`}
            fields={[
              "GET /fees?days=30&page=1&pageSize=25 → rows, page, pageSize, total",
              "por fila: from, tokenSymbol, tokenAmount, tokenDecimals",
            ]}
            shape={{
              rows: [
                {
                  chainId: 8453,
                  txHash: "0xc799b6...3bbf",
                  timestamp: "2026-08-19T01:26:00.000Z",
                  from: "0xb71e...3d96",
                  tokenSymbol: "USDC",
                  tokenAmount: 0.0075,
                  operation: "swap",
                  source: "hyxora",
                  feesUsd: 0.01,
                },
              ],
              page: 1,
              pageSize: 25,
              total: 178,
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default LatestUserFeesPanel;
