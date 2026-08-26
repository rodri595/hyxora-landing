"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel, cerebroOperationLabels } from "@/constants/cerebro";
import { useGetTreasuryByToken } from "@/hooks/cerebro/useGetTreasuryByToken";
import { formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { REVENUE_DAYS } from "./constants";

/**
 * Token units, not dollars. Precision has to slide across fourteen orders of
 * magnitude here — a swap can leave 4.06e-14 of a native token in the treasury and
 * 25.4329 USDC on the next row — so this mirrors the old dashboard's `fmtAmount`
 * instead of picking one decimal count for every token.
 *
 * @param {number | null | undefined} value
 * @return {string}
 */
const formatTokenAmount = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return "0";
  if (value < 0.0001) return value.toExponential(2);
  if (value < 1) return value.toFixed(6);
  if (value < 1000) return value.toFixed(4);
  return formatNumber(value, { decimals: 2 });
};

/**
 * `admin.md` documents this row as `operation`, and the API answers with the name
 * the old dashboard's query produced — `operationType` — which is why «Tipo de op»
 * rendered "—" on every row while the rows below it were already split by
 * operation. Same class of error as `/costs/by-operation`; read both spellings.
 *
 * `totalAmount` is the other half the old table showed and this one didn't: the
 * group-by is (chain, token, operación) and the upstream query sums
 * `amount_decimal` next to `amount_usd`. A token whose price the indexer never
 * resolved still has a quantity, so «Cantidad» stays readable while «Valor USD»
 * falls back to "—".
 *
 * @param {Object} row
 * @return {Object}
 */
const toTokenRow = (row) => {
  const operation = row.operationType ?? row.operation ?? row.operation_type ?? null;
  const totalAmount = Number(row.totalAmount ?? row.tokenAmount ?? row.amount ?? Number.NaN);
  const totalUsd = Number(row.totalUsd ?? 0);

  return {
    chainId: row.chainId ?? null,
    chainName: cerebroChainLabel(row),
    tokenSymbol: row.tokenSymbol ?? "native",
    tokenAddress: row.tokenAddress ?? null,
    operation,
    operationLabel: cerebroOperationLabels[operation] ?? operation ?? "—",
    transfers: Number(row.transfers ?? 0),
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : null,
    totalUsd: Number.isFinite(totalUsd) ? totalUsd : 0,
  };
};

const columns = [
  {
    accessorKey: "tokenSymbol",
    header: "Token",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium text-[#19363F]">{info.getValue()}</span>
        {info.row.original.tokenAddress ? (
          <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.35)]">
            {shortenHash(info.row.original.tokenAddress)}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "operationLabel",
    header: "Tipo de op",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue()}</span>,
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
    accessorKey: "totalAmount",
    header: "Cantidad",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      if (value === null) return <span className="text-[rgba(25,54,63,0.35)]">—</span>;
      return (
        <span className="tabular-nums text-[#19363F]">
          {formatTokenAmount(value)}{" "}
          <span className="text-[10px] text-[rgba(25,54,63,0.4)]">
            {info.row.original.tokenSymbol}
          </span>
        </span>
      );
    },
  },
  {
    accessorKey: "totalUsd",
    header: "Valor USD",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue() ?? 0;
      if (value <= 0) return <span className="text-[rgba(25,54,63,0.35)]">—</span>;
      return (
        <span className="font-medium tabular-nums text-[#19363F]">
          {formatUsd(value, { decimals: value < 1 ? 4 : 2 })}
        </span>
      );
    },
  },
];

/**
 * Treasury inflows per (chain, token, operation), one table per chain.
 *
 * Grouped rather than one flat table because the chain totals are the number
 * anyone reads first, and a single sortable list buries them.
 *
 * @param {Object} props
 * @param {boolean} [props.includeNonWhitelisted] Owned by `IngresosModule`, which
 * drives the whole tab from one control.
 */
const RevenueByChainTokenPanel = ({ includeNonWhitelisted = false }) => {
  const { data, error, isLoading, isFetching, refetch } = useGetTreasuryByToken({
    days: REVENUE_DAYS,
    includeNonWhitelisted,
  });

  const groups = useMemo(() => {
    const byChain = new Map();

    for (const raw of data ?? []) {
      const row = toTokenRow(raw);
      const key = String(row.chainId);
      if (!byChain.has(key)) {
        byChain.set(key, {
          chainId: row.chainId,
          chainName: row.chainName,
          totalUsd: 0,
          rows: [],
        });
      }

      const group = byChain.get(key);
      group.totalUsd += row.totalUsd;
      group.rows.push(row);
    }

    return [...byChain.values()]
      .map((group) => ({
        ...group,
        rows: [...group.rows].sort((a, b) => b.totalUsd - a.totalUsd),
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd);
  }, [data]);

  return (
    <Panel
      title="Ingresos por cadena × token"
      description={`Qué token entró al tesoro, en qué cantidad y por qué operación, en los últimos ${REVENUE_DAYS} días. Cada fila agrega las comisiones de usuario de una tupla (cadena, token, operación).`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && groups.length === 0}
        emptyLabel="Ningún token entró al tesoro en la ventana."
      >
        <div className="flex flex-col gap-2.5">
          {groups.map((group) => (
            <div
              key={group.chainId}
              className="rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 bg-[rgba(25,54,63,0.02)] px-3 py-2 border-b-[0.7px] border-[rgba(25,54,63,0.06)]">
                <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
                  {group.chainName}
                </span>
                <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
                  {formatNumber(group.rows.length)} entradas ·{" "}
                  <span className="font-semibold text-[#19363F]">
                    {formatUsd(group.totalUsd, { decimals: 2 })}
                  </span>
                </span>
              </div>

              <div className="px-3 pb-1">
                <DataTable
                  data={group.rows}
                  columns={columns}
                  filename={`cerebro-ingresos-${group.chainName}-${REVENUE_DAYS}d`}
                  enableSelection={false}
                  enableSearch={false}
                  enableExport={false}
                  showRowCount={false}
                  bare
                  dense
                />
              </div>
            </div>
          ))}
        </div>
      </QueryState>
    </Panel>
  );
};

export default RevenueByChainTokenPanel;
