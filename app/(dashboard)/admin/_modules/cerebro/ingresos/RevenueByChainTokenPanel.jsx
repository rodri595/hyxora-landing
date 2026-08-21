"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains, cerebroOperationLabels } from "@/constants/cerebro";
import { useGetTreasuryByToken } from "@/hooks/cerebro/useGetTreasuryByToken";
import { formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import WhitelistToggle from "./WhitelistToggle";
import { REVENUE_DAYS } from "./constants";

const columns = [
  {
    accessorKey: "tokenSymbol",
    header: "Token",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium text-[#19363F]">{info.getValue() ?? "—"}</span>
        <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.35)]">
          {shortenHash(info.row.original.tokenAddress)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "operation",
    header: "Tipo de op",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">
        {cerebroOperationLabels[info.getValue()] ?? info.getValue() ?? "—"}
      </span>
    ),
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
    accessorKey: "totalUsd",
    header: "Valor USD",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue() ?? 0;
      return (
        <span className="font-medium tabular-nums text-[#19363F]">
          {formatUsd(value, { decimals: value > 0 && value < 1 ? 4 : 2 })}
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
 */
const RevenueByChainTokenPanel = () => {
  const [includeNonWhitelisted, setIncludeNonWhitelisted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useGetTreasuryByToken({
    days: REVENUE_DAYS,
    includeNonWhitelisted,
  });

  const groups = useMemo(() => {
    const byChain = new Map();

    for (const row of data ?? []) {
      const key = String(row.chainId);
      if (!byChain.has(key)) {
        byChain.set(key, {
          chainId: row.chainId,
          chainName: cerebroChains[row.chainId] ?? `Chain ${row.chainId}`,
          totalUsd: 0,
          rows: [],
        });
      }

      const group = byChain.get(key);
      group.totalUsd += row.totalUsd ?? 0;
      group.rows.push(row);
    }

    return [...byChain.values()]
      .map((group) => ({
        ...group,
        rows: [...group.rows].sort((a, b) => (b.totalUsd ?? 0) - (a.totalUsd ?? 0)),
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd);
  }, [data]);

  return (
    <Panel
      title="Ingresos por cadena × token"
      description={`Qué token entró al tesoro, por qué operación, en los últimos ${REVENUE_DAYS} días. Fuente: comisiones de usuario.`}
      action={
        <div className="flex items-center gap-2">
          <WhitelistToggle value={includeNonWhitelisted} onChange={setIncludeNonWhitelisted} />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
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

        <div className="mt-2.5">
          <PendingEndpoint
            needs="El dashboard original muestra también la cantidad de token recibida (16.9607 EURC), no solo su valor en USD. /fees/treasury/by-token devuelve `transfers` y `totalUsd`, pero no el importe en unidades del token ni sus decimales."
            fields={["GET /fees/treasury/by-token → tokenAmount, tokenDecimals"]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default RevenueByChainTokenPanel;
