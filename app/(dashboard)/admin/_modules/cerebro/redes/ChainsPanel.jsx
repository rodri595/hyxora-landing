"use client";

import DataTable from "@/components/DataTable";
import { cerebroActiveChains } from "@/constants/cerebro";
import { useGetChainsSummary } from "@/hooks/cerebro/useGetChainsSummary";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

/** `/chains` fixes its own window; the headers say which one. */
const DAYS = 30;

/** Solana's registry id — the sentinel `treasury_fees.chain_id` carries for non-EVM rows. */
const SOLANA_CHAIN_ID = 1399811149;

const sumBy = (table, key) =>
  table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original[key] ?? 0), 0);

const numberOrNull = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

/** Muted zero, so a row with real activity stands out from an idle chain. */
const Count = ({ value }) => {
  if (value === null) return <span className="tabular-nums text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <span
      className={cn("tabular-nums", value > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.3)]")}
    >
      {formatNumber(value)}
    </span>
  );
};

const Usd = ({ value, decimals = 3 }) => (
  <span className="tabular-nums text-[rgba(25,54,63,0.7)]">{formatUsd(value, { decimals })}</span>
);

const Cursor = ({ value }) => (
  <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
    {value === null ? "—" : formatNumber(value)}
  </span>
);

/**
 * Per-chain TVL, 30-day P&L and both indexer cursors, straight from `GET /chains`.
 *
 * This table used to assemble itself from four endpoints — `/costs/by-chain`,
 * `/fees/treasury/by-token`, `/holdings` and `/system/health` — which cost it both
 * rows and columns: TVL only ever covered the top 100 holdings rows, and a chain
 * with no cost, fee or indexer row never got created at all, so Polygon vanished
 * and Solana — non-EVM, absent from every one of those four — never appeared.
 * `/chains` is the same table the old dashboard's «Chains» page computes, done
 * upstream over everything.
 *
 * Rows still come from `cerebroActiveChains` rather than from the response, for the
 * usual reason: a quiet chain must read $0 instead of dropping out, and deprecated
 * Ethereum must not sneak a row in if the endpoint ever emits one.
 */
const ChainsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetChainsSummary();

  const rows = useMemo(() => {
    const byChainId = new Map((data?.chains ?? []).map((row) => [Number(row.chainId), row]));
    const solana = data?.solana ?? null;

    return cerebroActiveChains.map(({ chainId, name }) => {
      // Solana is non-EVM: no EntryPoint, no Safe, no block-cursor indexers, so it
      // travels in its own block of the response and its cursor cells stay "—"
      // rather than a misleading 0.
      if (chainId === SOLANA_CHAIN_ID) {
        const costUsd = Number(solana?.costs30dUsd ?? 0);
        const feesUsd = Number(solana?.earnings30dUsd ?? 0);

        return {
          chainId,
          chainName: name,
          nonEvm: true,
          tvlUsd: Number(solana?.tvlUsd ?? 0),
          // That block documents neither an op count nor a transfer count. If the
          // endpoint grows them they render; until then the cells say so instead
          // of reporting a zero nobody counted.
          opsCount: numberOrNull(solana?.ops30d),
          costUsd,
          feeTransfers: numberOrNull(solana?.feesCount30d),
          feesUsd,
          marginUsd: Number(solana?.margin30dUsd ?? feesUsd - costUsd),
          userOpsCursor: null,
          treasuryCursor: null,
        };
      }

      const row = byChainId.get(chainId);
      const costUsd = Number(row?.cost30dUsd ?? 0);
      const feesUsd = Number(row?.fees30dUsd ?? 0);

      return {
        chainId,
        // The API's own name wins — it knows about chains that shipped after
        // constants/cerebro.js was written.
        chainName: row?.name ?? name,
        nonEvm: false,
        tvlUsd: Number(row?.tvlUsd ?? 0),
        opsCount: Number(row?.ops30d ?? 0),
        costUsd,
        feeTransfers: Number(row?.feesCount30d ?? 0),
        feesUsd,
        marginUsd: Number(row?.margin30dUsd ?? feesUsd - costUsd),
        userOpsCursor: numberOrNull(row?.useropsLastBlock),
        treasuryCursor: numberOrNull(row?.treasuryLastBlock),
      };
    });
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: (info) => (
          <span className="flex items-center gap-2">
            <span className="font-medium text-[#19363F]">{info.getValue()}</span>
            {info.row.original.nonEvm ? (
              <span
                className="rounded bg-[rgba(25,54,63,0.06)] px-1.5 py-0.5 text-[10px] font-normal text-[rgba(25,54,63,0.5)]"
                title="Cadena no EVM: no hay UserOps ERC-4337 ni indexers por bloque, así que las columnas de ops y cursores no aplican."
              >
                no EVM
              </span>
            ) : null}
          </span>
        ),
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
        footer: ({ table }) => formatUsd(sumBy(table, "tvlUsd"), { decimals: 0 }),
      },
      {
        accessorKey: "opsCount",
        header: `Ops ${DAYS}d`,
        meta: { align: "right", label: "Ops" },
        cell: (info) => <Count value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumBy(table, "opsCount")),
      },
      {
        accessorKey: "costUsd",
        header: `Gastos ${DAYS}d`,
        meta: { align: "right", label: "Gastos" },
        cell: (info) => <Usd value={info.getValue()} />,
        footer: ({ table }) => formatUsd(sumBy(table, "costUsd"), { decimals: 3 }),
      },
      {
        accessorKey: "feeTransfers",
        header: `Txs de comisión ${DAYS}d`,
        meta: { align: "right", label: "Txs de comisión" },
        cell: (info) => <Count value={info.getValue()} />,
        footer: ({ table }) => formatNumber(sumBy(table, "feeTransfers")),
      },
      {
        accessorKey: "feesUsd",
        header: `Comisiones ${DAYS}d`,
        meta: { align: "right", label: "Comisiones" },
        cell: (info) => <Usd value={info.getValue()} />,
        footer: ({ table }) => formatUsd(sumBy(table, "feesUsd"), { decimals: 3 }),
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
          const total = sumBy(table, "marginUsd");
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
        cell: (info) => <Cursor value={info.getValue()} />,
      },
      {
        accessorKey: "treasuryCursor",
        header: "cursor de tesoro",
        meta: { align: "right", label: "cursor de tesoro" },
        cell: (info) => <Cursor value={info.getValue()} />,
      },
    ],
    []
  );

  return (
    <Panel
      title="Cadenas"
      description={`TVL, actividad y P&L de los últimos ${DAYS} días por red, junto al cursor de cada indexer. Un cursor parado explica por qué una cadena aparece con menos ops o comisiones de las que debería.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-cadenas-${DAYS}d`}
          searchPlaceholder="Buscar cadena..."
          enableSelection={false}
          enableColumnToggle
          enableFooter
          bare
          dense
          emptyLabel="Ninguna cadena devolvió datos."
        />

        <div className="flex flex-col gap-1 mt-3">
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Las redes salen siempre todas y en el mismo orden, con $0 si no registraron actividad en
            la ventana. La ventana la fija el endpoint en {DAYS} días. Margen = comisiones − gastos.
          </p>
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Comisiones cuenta solo lo que pagó un Safe de usuario, sin las ventas de NFT. Solana no
            es EVM: tiene TVL, comisiones y coste de fee-payer, pero ni UserOps ni cursores de
            bloque, y por eso esas celdas van con «—».
          </p>
        </div>
      </QueryState>
    </Panel>
  );
};

export default ChainsPanel;
