"use client";

import DataTable from "@/components/DataTable";
import { cerebroActiveChains, cerebroChainLabel, cerebroOperationLabel } from "@/constants/cerebro";
import { useGetTreasuryByToken } from "@/hooks/cerebro/useGetTreasuryByToken";
import { cn } from "@/utils";
import { formatNumber, formatUsd, formatUsdPrecise, shortenHash } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { REVENUE_TOKEN_DAYS, REVENUE_TOKEN_WINDOWS } from "./constants";

/** Deprecated chain, kept out of every per-chain breakdown — see `cerebroActiveChains`. */
const ETHEREUM_CHAIN_ID = 1;

/** Sentinel for «todas las cadenas» on the chain rail. */
const ALL_CHAINS = "all";

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
  const chainId = Number(row.chainId ?? Number.NaN);

  return {
    chainId: Number.isFinite(chainId) ? chainId : null,
    chainName: cerebroChainLabel(row),
    tokenSymbol: row.tokenSymbol ?? "native",
    tokenAddress: row.tokenAddress ?? null,
    operation,
    operationLabel: cerebroOperationLabel(operation),
    transfers: Number(row.transfers ?? 0),
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : null,
    totalUsd: Number.isFinite(totalUsd) ? totalUsd : 0,
  };
};

const sumBy = (table, key) =>
  table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original[key] ?? 0), 0);

/**
 * One cell of the chain rail: the network, what it brought in, and its share of the
 * window. Doubles as the table filter, which is what replaced the five stacked
 * mini-tables — a card inside a card inside a card was the hardest thing to read on
 * the tab.
 *
 * A chain with no entries still gets a cell, greyed and inert: Cerebro group-by
 * endpoints emit no row at all for a quiet network, and «$0» says more than a gap.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {number} props.entries
 * @param {number} props.totalUsd
 * @param {number} props.share 0–1, share of the window total.
 * @param {boolean} props.isActive
 * @param {boolean} props.isEmpty
 * @param {() => void} props.onSelect
 */
const ChainCell = ({ label, entries, totalUsd, share, isActive, isEmpty, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={isEmpty}
    aria-pressed={isActive}
    className={cn(
      "flex flex-col gap-1.5 rounded-lg border-[0.7px] px-2.5 py-2 text-left transition-colors",
      isActive
        ? "border-[#19363F] bg-[rgba(25,54,63,0.04)]"
        : "border-[rgba(25,54,63,0.08)] hover:bg-[rgba(25,54,63,0.02)]",
      isEmpty && "opacity-40 cursor-default hover:bg-transparent"
    )}
  >
    <span className="flex items-baseline justify-between gap-2">
      <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
        {label}
      </span>
      <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
        {formatNumber(entries)}
      </span>
    </span>

    <span
      className={cn(
        "font-inter text-[13px] font-semibold tabular-nums tracking-[-0.52px]",
        totalUsd > 0 ? "text-emerald-700" : "text-[rgba(25,54,63,0.3)]"
      )}
    >
      {formatUsd(totalUsd, { decimals: totalUsd > 0 && totalUsd < 1 ? 4 : 2 })}
    </span>

    <span className="block h-0.75 w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]">
      <span
        className="block h-full rounded-full bg-emerald-500"
        style={{ width: `${Math.min(100, share > 0 ? Math.max(share * 100, 2) : 0)}%` }}
      />
    </span>
  </button>
);

/**
 * Treasury inflows per (chain, token, operation).
 *
 * **One flat table, not one per chain.** The port stacked a bordered box per
 * network, each wrapping its own table inside the panel card — three nested frames
 * around what is a single list — and it made tokens impossible to compare across
 * networks, since nothing could be sorted or searched past its own chain. The rail
 * above carries the per-chain totals those boxes existed for, and doubles as the
 * filter.
 *
 * Rows come from the API; the **rail** is `cerebroActiveChains` plus anything else
 * the response carried, so a network with no inflows in the window reads $0 instead
 * of vanishing. Ethereum is dropped — the app stopped routing through it and the
 * endpoint does not filter its history — exactly as «Ingresos por cadena» does.
 *
 * The window defaults to a year because the old dashboard ran this query with no
 * window at all; see `REVENUE_TOKEN_WINDOWS`.
 *
 * @param {Object} props
 * @param {boolean} [props.includeNonWhitelisted] Owned by `IngresosModule`, which
 * drives the whole tab from one control.
 */
const RevenueByChainTokenPanel = ({ includeNonWhitelisted = false }) => {
  const [days, setDays] = useState(REVENUE_TOKEN_DAYS);
  const [chainFilter, setChainFilter] = useState(ALL_CHAINS);

  const { data, error, isLoading, isFetching, refetch } = useGetTreasuryByToken({
    days,
    includeNonWhitelisted,
  });

  const rows = useMemo(
    () =>
      (data ?? [])
        .map(toTokenRow)
        .filter((row) => row.chainId !== ETHEREUM_CHAIN_ID)
        .sort((a, b) => b.totalUsd - a.totalUsd),
    [data]
  );

  /** Every network worth a cell: the registry first, then anything new the API sent. */
  const chains = useMemo(() => {
    const totals = new Map();
    for (const row of rows) {
      const current = totals.get(row.chainId) ?? { entries: 0, totalUsd: 0, name: row.chainName };
      current.entries += 1;
      current.totalUsd += row.totalUsd;
      totals.set(row.chainId, current);
    }

    const known = cerebroActiveChains.map(({ chainId, name }) => ({
      chainId,
      name,
      entries: totals.get(chainId)?.entries ?? 0,
      totalUsd: totals.get(chainId)?.totalUsd ?? 0,
    }));

    const extra = [...totals.entries()]
      .filter(([chainId]) => !cerebroActiveChains.some((chain) => chain.chainId === chainId))
      .map(([chainId, value]) => ({ chainId, ...value }));

    return [...known, ...extra];
  }, [rows]);

  const totalUsd = useMemo(() => rows.reduce((sum, row) => sum + row.totalUsd, 0), [rows]);

  const visibleRows = useMemo(
    () => (chainFilter === ALL_CHAINS ? rows : rows.filter((row) => row.chainId === chainFilter)),
    [rows, chainFilter]
  );

  const columns = useMemo(() => {
    const showChain = chainFilter === ALL_CHAINS;

    return [
      ...(showChain
        ? [
            {
              accessorKey: "chainName",
              header: "Cadena",
              cell: (info) => (
                <span className="font-medium text-[rgba(25,54,63,0.7)]">{info.getValue()}</span>
              ),
              footer: () => "Total",
            },
          ]
        : []),
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
        footer: () => (showChain ? null : "Total"),
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
        footer: ({ table }) => formatNumber(sumBy(table, "transfers")),
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
          if (value <= 0) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-medium tabular-nums text-emerald-700">
              {formatUsdPrecise(value)}
            </span>
          );
        },
        footer: ({ table }) => (
          <span className="text-emerald-700">{formatUsd(sumBy(table, "totalUsd"))}</span>
        ),
      },
    ];
  }, [chainFilter]);

  return (
    <Panel
      title="Ingresos por cadena × token"
      meta={days === 365 ? "último año" : `últimos ${days} días`}
      description="Qué token entró al tesoro, en qué cantidad y por qué operación. Cada fila agrega las comisiones de usuario de una tupla (cadena, token, operación)."
      action={
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] p-0.5">
            {REVENUE_TOKEN_WINDOWS.map((option) => (
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
        emptyLabel="Ningún token entró al tesoro en la ventana."
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
          <ChainCell
            label="Todas"
            entries={rows.length}
            totalUsd={totalUsd}
            share={1}
            isActive={chainFilter === ALL_CHAINS}
            isEmpty={false}
            onSelect={() => setChainFilter(ALL_CHAINS)}
          />

          {chains.map((chain) => (
            <ChainCell
              key={chain.chainId}
              label={chain.name}
              entries={chain.entries}
              totalUsd={chain.totalUsd}
              share={totalUsd > 0 ? chain.totalUsd / totalUsd : 0}
              isActive={chainFilter === chain.chainId}
              isEmpty={chain.entries === 0}
              onSelect={() => setChainFilter(chain.chainId)}
            />
          ))}
        </div>

        <div className="mt-3">
          <DataTable
            data={visibleRows}
            columns={columns}
            filename={`cerebro-ingresos-token-${days}d`}
            searchPlaceholder="Buscar token u operación..."
            emptyLabel="Esta cadena no registró entradas en la ventana."
            initialSorting={[{ id: "totalUsd", desc: true }]}
            maxHeight={520}
            enableSelection={false}
            enableFooter
            bare
            dense
          />
        </div>

        <p className="mt-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          Las redes salen siempre todas, con $0 si no registraron entradas en la ventana. Ethereum
          queda fuera: la app dejó de usarla y su histórico no cuenta en ningún desglose. El total
          del pie sigue al filtro y a la búsqueda de la tabla.
        </p>
      </QueryState>
    </Panel>
  );
};

export default RevenueByChainTokenPanel;
