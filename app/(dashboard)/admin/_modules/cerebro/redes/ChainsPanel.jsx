"use client";

import DataTable from "@/components/DataTable";
import { cerebroActiveChains } from "@/constants/cerebro";
import { useGetChainsSummary } from "@/hooks/cerebro/useGetChainsSummary";
import { cn } from "@/utils";
import { formatNumber, formatUsd, formatUsdAxis, formatUsdPrecise } from "@/utils/format";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import CompositionBar from "../../shared/CompositionBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { COST_COLOR, REVENUE_COLOR } from "../resumen/constants";

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

const AXIS = "rgba(25,54,63,0.4)";
const GRID = "rgba(25,54,63,0.08)";

const PnlTooltip = (props) => {
  const { visible, payload, label } = useHeldTooltip(props.active, props.payload, props.label);
  if (!payload) return null;
  const point = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] mb-1">
        {label}
      </p>
      {[
        { key: "feesUsd", name: "Comisiones", color: REVENUE_COLOR },
        { key: "costUsd", name: "Gastos", color: COST_COLOR },
      ].map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="size-[7px] shrink-0 rounded-full" style={{ background: row.color }} />
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {row.name}
          </span>
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F] ml-auto pl-3">
            {formatUsdPrecise(point?.[row.key])}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-1">
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
          Margen
        </span>
        <span
          className={cn(
            "font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] ml-auto pl-3",
            (point?.marginUsd ?? 0) < 0 ? "text-red-600" : "text-emerald-700"
          )}
        >
          {formatUsdPrecise(point?.marginUsd)}
        </span>
      </div>
    </TooltipSurface>
  );
};

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

  const tvlComposition = useMemo(
    () => rows.map((row) => ({ label: row.chainName, value: row.tvlUsd })),
    [rows]
  );

  // Only the chains with something to draw. A row of paired zero-length bars adds a
  // label and no information, and with every chain listed the chart is mostly that.
  const pnlRows = useMemo(
    () => rows.filter((row) => (row.feesUsd ?? 0) > 0 || (row.costUsd ?? 0) > 0),
    [rows]
  );

  return (
    <Panel
      title="Cadenas"
      description={`TVL, actividad y P&L de los últimos ${DAYS} días por red, junto al cursor de cada indexer. Un cursor parado explica por qué una cadena aparece con menos ops o comisiones de las que debería.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)] mb-2">
              Reparto del TVL por red
            </h4>
            <CompositionBar
              items={tvlComposition}
              limit={cerebroActiveChains.length}
              formatValue={(value) => formatUsd(value, { decimals: 0 })}
              ariaLabel="Reparto del TVL entre las redes"
              emptyLabel="Ninguna red reporta TVL."
            />
          </div>

          <div>
            <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)] mb-2">
              Comisiones contra gastos · {DAYS}d
            </h4>
            {/* layout="vertical": chain names read left-to-right at any width, where
                an X-axis category would collide or rotate on a phone. Height grows
                with the row count so the bars keep a constant thickness. */}
            {pnlRows.length === 0 ? (
              <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)] py-2">
                Ninguna red registró comisiones ni gastos en la ventana.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, pnlRows.length * 34 + 40)}>
                <BarChart
                  data={pnlRows}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 0, left: 4 }}
                  barGap={2}
                >
                  <CartesianGrid horizontal={false} stroke={GRID} />
                  <XAxis
                    type="number"
                    tickFormatter={formatUsdAxis}
                    tick={{ fontSize: 10, fill: AXIS }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                  />
                  <YAxis
                    type="category"
                    dataKey="chainName"
                    tick={{ fontSize: 10, fill: AXIS }}
                    tickLine={false}
                    axisLine={false}
                    width={78}
                  />
                  <Tooltip
                    content={<PnlTooltip />}
                    cursor={{ fill: "rgba(25,54,63,0.04)" }}
                    wrapperStyle={tooltipWrapperStyle}
                  />
                  <Legend
                    align="right"
                    verticalAlign="top"
                    iconType="circle"
                    iconSize={7}
                    formatter={(value) => (
                      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.6)]">
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="feesUsd"
                    name="Comisiones"
                    fill={REVENUE_COLOR}
                    radius={[0, 3, 3, 0]}
                  />
                  <Bar dataKey="costUsd" name="Gastos" fill={COST_COLOR} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-1">
              Las dos barras son cifras absolutas, no una resta: una red gana dinero cuando la verde
              pasa a la roja. El margen exacto está en el tooltip y en la tabla.
            </p>
          </div>
        </div>

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
