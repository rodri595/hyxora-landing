"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains } from "@/constants/cerebro";
import { useGetCostsByChain } from "@/hooks/cerebro/useGetCostsByChain";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { useGetTreasuryByToken } from "@/hooks/cerebro/useGetTreasuryByToken";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback, useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

const DAYS = 30;

/** /holdings returns the TOP tokens and vaults, not all of them. 100 is its max. */
const HOLDINGS_LIMIT = 100;

const sumBy = (rows, key) => rows.reduce((total, row) => total + (row[key] ?? 0), 0);

/** Muted zero, so a row with real activity stands out from an idle chain. */
const Count = ({ value }) => (
  <span className={cn("tabular-nums", value > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.3)]")}>
    {formatNumber(value)}
  </span>
);

const Usd = ({ value, decimals = 3 }) => (
  <span className="tabular-nums text-[rgba(25,54,63,0.7)]">{formatUsd(value, { decimals })}</span>
);

const ChainsPanel = () => {
  const costs = useGetCostsByChain({ days: DAYS });
  const treasury = useGetTreasuryByToken({ days: DAYS });
  const holdings = useGetHoldings({ limit: HOLDINGS_LIMIT });
  const health = useGetSystemHealth();

  const queries = [costs, treasury, holdings, health];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const error = queries.find((query) => query.error)?.error ?? null;

  const refetchAll = useCallback(() => {
    costs.refetch();
    treasury.refetch();
    holdings.refetch();
    health.refetch();
  }, [costs.refetch, treasury.refetch, holdings.refetch, health.refetch]);

  const rows = useMemo(() => {
    const byChain = new Map();

    const ensure = (chainId, chainName) => {
      if (chainId === undefined || chainId === null) return null;
      const key = String(chainId);

      if (!byChain.has(key)) {
        byChain.set(key, {
          chainId,
          chainName: cerebroChains[chainId] ?? `Chain ${chainId}`,
          tvlUsd: 0,
          opsCount: 0,
          costUsd: 0,
          feeTransfers: 0,
          feesUsd: 0,
          userOpsCursor: null,
          treasuryCursor: null,
        });
      }

      const row = byChain.get(key);
      // The API's own chainName wins over our static map — it knows about chains
      // that shipped after constants/cerebro.js was written.
      if (chainName) row.chainName = chainName;
      return row;
    };

    for (const entry of costs.data ?? []) {
      const row = ensure(entry.chainId, entry.chainName);
      if (!row) continue;
      row.opsCount += entry.opsCount ?? 0;
      row.costUsd += entry.costUsd ?? 0;
    }

    // Fees per chain are summed from the by-token rows: /fees/treasury/by-chain
    // has no `days` filter, so it can't answer a 30-day question.
    for (const entry of treasury.data ?? []) {
      const row = ensure(entry.chainId);
      if (!row) continue;
      row.feeTransfers += entry.transfers ?? 0;
      row.feesUsd += entry.totalUsd ?? 0;
    }

    for (const entry of [...(holdings.data?.tokens ?? []), ...(holdings.data?.vaults ?? [])]) {
      const row = ensure(entry.chainId, entry.chainName);
      if (!row) continue;
      row.tvlUsd += entry.totalUsd ?? 0;
    }

    for (const indexer of health.data?.system?.indexers ?? []) {
      const row = ensure(indexer.chainId);
      if (!row) continue;

      const kind = String(indexer.kind ?? "");
      const block = indexer.lastBlock ?? 0;

      // Several userops indexers can run per chain (safe / entrypoint /
      // etherscan) — the furthest one is the one that matters.
      if (kind.startsWith("userops")) {
        row.userOpsCursor = Math.max(row.userOpsCursor ?? 0, block);
      } else if (kind === "treasury") {
        row.treasuryCursor = Math.max(row.treasuryCursor ?? 0, block);
      }
    }

    return [...byChain.values()].map((row) => ({
      ...row,
      marginUsd: row.feesUsd - row.costUsd,
    }));
  }, [costs.data, treasury.data, holdings.data, health.data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
      },
      {
        accessorKey: "tvlUsd",
        header: "TVL",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[#19363F]">
            {formatUsd(info.getValue(), { decimals: 0 })}
          </span>
        ),
        footer: ({ table }) =>
          formatUsd(
            sumBy(
              table.getFilteredRowModel().rows.map((r) => r.original),
              "tvlUsd"
            ),
            {
              decimals: 0,
            }
          ),
      },
      {
        accessorKey: "opsCount",
        header: `Ops ${DAYS}d`,
        meta: { align: "right" },
        cell: (info) => <Count value={info.getValue()} />,
        footer: ({ table }) =>
          formatNumber(
            sumBy(
              table.getFilteredRowModel().rows.map((r) => r.original),
              "opsCount"
            )
          ),
      },
      {
        accessorKey: "costUsd",
        header: `Gastos ${DAYS}d`,
        meta: { align: "right" },
        cell: (info) => <Usd value={info.getValue()} />,
        footer: ({ table }) =>
          formatUsd(
            sumBy(
              table.getFilteredRowModel().rows.map((r) => r.original),
              "costUsd"
            ),
            {
              decimals: 3,
            }
          ),
      },
      {
        accessorKey: "feeTransfers",
        header: `Txs de comisión ${DAYS}d`,
        meta: { align: "right", label: "Txs de comisión" },
        cell: (info) => <Count value={info.getValue()} />,
        footer: ({ table }) =>
          formatNumber(
            sumBy(
              table.getFilteredRowModel().rows.map((r) => r.original),
              "feeTransfers"
            )
          ),
      },
      {
        accessorKey: "feesUsd",
        header: `Comisiones ${DAYS}d`,
        meta: { align: "right", label: "Comisiones" },
        cell: (info) => <Usd value={info.getValue()} />,
        footer: ({ table }) =>
          formatUsd(
            sumBy(
              table.getFilteredRowModel().rows.map((r) => r.original),
              "feesUsd"
            ),
            {
              decimals: 3,
            }
          ),
      },
      {
        accessorKey: "marginUsd",
        header: `Margen ${DAYS}d`,
        meta: { align: "right", label: "Margen" },
        cell: (info) => {
          const value = info.getValue();
          return (
            <span
              className={cn(
                "font-medium tabular-nums",
                value < 0 ? "text-red-600" : "text-emerald-700"
              )}
            >
              {formatUsd(value, { decimals: 3 })}
            </span>
          );
        },
        footer: ({ table }) => {
          const total = sumBy(
            table.getFilteredRowModel().rows.map((r) => r.original),
            "marginUsd"
          );
          return (
            <span className={total < 0 ? "text-red-600" : "text-emerald-700"}>
              {formatUsd(total, { decimals: 3 })}
            </span>
          );
        },
      },
      {
        accessorKey: "userOpsCursor",
        header: "cursor UserOps",
        meta: { align: "right", label: "cursor UserOps" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
            {info.getValue() === null ? "—" : formatNumber(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "treasuryCursor",
        header: "cursor de tesoro",
        meta: { align: "right", label: "cursor de tesoro" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
            {info.getValue() === null ? "—" : formatNumber(info.getValue())}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Panel
      title="Cadenas"
      description={`TVL, actividad y P&L de los últimos ${DAYS} días por red, junto al cursor de cada indexer. Un cursor parado explica por qué una cadena aparece con menos ops o comisiones de las que debería.`}
      action={<RefreshButton onClick={refetchAll} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-cadenas-${DAYS}d`}
          searchPlaceholder="Buscar cadena..."
          initialSorting={[{ id: "tvlUsd", desc: true }]}
          enableSelection={false}
          enableColumnToggle
          enableFooter
          bare
          dense
          emptyLabel="Ninguna cadena devolvió datos."
        />

        <div className="flex flex-col gap-1 mt-3">
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            TVL suma los {HOLDINGS_LIMIT} tokens y {HOLDINGS_LIMIT} vaults más grandes de /holdings,
            así que la cola larga queda fuera y la cifra por cadena se queda algo corta.
          </p>
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Comisiones y txs se agregan desde /fees/treasury/by-token (source: user-fees), porque el
            endpoint por cadena no acepta ventana de días. Margen = comisiones − gastos.
          </p>
        </div>
      </QueryState>
    </Panel>
  );
};

export default ChainsPanel;
