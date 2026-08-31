"use client";

import DataTable from "@/components/DataTable";
import { appApiDefaultMaxGasGwei } from "@/constants/appApi";
import { useGetGasLimits } from "@/hooks/appApi/useGetGasLimits";
import { useGetGasPrices } from "@/hooks/monitoring/useGetGasPrices";
import { cn } from "@/utils";
import { formatNumber, formatPercent } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

/** Above this share of the ceiling, sponsorship is close to being refused. */
const USAGE_WARNING_PCT = 70;

const columns = [
  {
    accessorKey: "label",
    header: "Cadena",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "currentGwei",
    header: "Gas actual (gwei)",
    meta: { align: "right" },
    cell: (info) => {
      const { error } = info.row.original;
      if (error) return <span className="font-inter text-[10px] text-red-600">{error}</span>;
      return (
        <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
          {formatNumber(info.getValue(), { decimals: 3 })}
        </span>
      );
    },
  },
  {
    accessorKey: "maxGwei",
    header: "Límite máx (gwei)",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      return value === null ? (
        <span className="text-[rgba(25,54,63,0.3)]">—</span>
      ) : (
        <span className="tabular-nums font-medium text-[#19363F]">
          {formatNumber(value, { decimals: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Origen",
    cell: (info) => {
      const source = info.getValue();
      if (source === null) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
      return source === "override" ? (
        <span className="font-medium text-[#19363F]">Configurado</span>
      ) : (
        <span className="text-[rgba(25,54,63,0.45)]">Predeterminado</span>
      );
    },
  },
  {
    accessorKey: "usagePct",
    header: "Uso del límite",
    meta: { align: "right" },
    cell: (info) => {
      const pct = info.getValue();
      if (pct === null) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
      return (
        <span
          className={cn(
            "font-medium tabular-nums",
            pct >= USAGE_WARNING_PCT ? "text-amber-700" : "text-[#19363F]"
          )}
        >
          {formatPercent(pct, { decimals: 1 })}
        </span>
      );
    },
  },
];

/**
 * Current gas price against the configured ceiling, per chain.
 *
 * Two sources joined on `chain`: the live price comes from `eth_gasPrice` on
 * our own RPCs (`/api/monitoring/gas-prices`), the ceiling from app-api's
 * `/admin/gas-limits`. Deliberately two requests — the live prices still render
 * when the ceilings are unavailable, which matters because the bot token and
 * the RPC keys fail independently.
 *
 * `/admin/gas-limits` only returns rows someone *saved*: a chain nobody has
 * overridden simply isn't in the response, which is why this table used to show
 * a dash for every ceiling. The app itself falls back to a hardcoded default in
 * that case, so we mirror those defaults (`appApiDefaultMaxGasGwei`) and say in
 * the «Origen» column which of the two a row is showing — the same split the
 * app's own admin screen draws with its «Predeterminado» / «Anulación» badges.
 */
const GasLimitsPanel = () => {
  const prices = useGetGasPrices();
  const limits = useGetGasLimits();

  const rows = useMemo(() => {
    const overrides = new Map(
      (limits.data ?? []).map((limit) => [String(limit.chain).toLowerCase(), limit.maxGasGwei])
    );

    return (prices.data?.rows ?? []).map((row) => {
      // app-api spells Polygon both ways; accept either.
      const override =
        overrides.get(row.chain) ?? (row.chain === "polygon" ? overrides.get("matic") : undefined);
      const fallback = appApiDefaultMaxGasGwei[row.chain];

      const isOverride = typeof override === "number";
      const ceiling = isOverride ? override : typeof fallback === "number" ? fallback : null;

      return {
        ...row,
        maxGwei: ceiling,
        source: ceiling === null ? null : isOverride ? "override" : "default",
        usagePct:
          ceiling && ceiling > 0 && typeof row.currentGwei === "number"
            ? (row.currentGwei / ceiling) * 100
            : null,
      };
    });
  }, [prices.data, limits.data]);

  const nearCeiling = rows.filter(
    (row) => row.usagePct !== null && row.usagePct >= USAGE_WARNING_PCT
  ).length;

  const refetchAll = () => {
    prices.refetch();
    limits.refetch();
  };

  return (
    <Panel
      title="Límites de gas por cadena"
      description="Precio de gas actual contra el techo configurado en cada red, para ver cuánto margen queda antes de que se dejen de patrocinar operaciones."
      tone={nearCeiling > 0 ? "warning" : "neutral"}
      action={
        <RefreshButton onClick={refetchAll} isLoading={prices.isFetching || limits.isFetching} />
      }
    >
      <QueryState
        isLoading={prices.isLoading}
        error={prices.error}
        isEmpty={!prices.isLoading && !prices.error && rows.length === 0}
        emptyLabel="No hay redes configuradas."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="limites-gas"
          enableSelection={false}
          enableSearch={false}
          bare
          dense
        />

        {limits.error && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
            No se pudieron leer las anulaciones ({limits.error.message}), así que todas las filas
            salen como «Predeterminado». Si alguna red tiene un límite configurado a mano, aquí se
            está viendo el valor equivocado.
          </p>
        )}

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Vista de solo lectura: los límites se editan en el Panel de Admin de la app (Configuración
          → Límites de Gas), no aquí. «Predeterminado» significa que nadie ha guardado un límite
          para esa red y la app usa su valor por defecto.
        </p>
      </QueryState>
    </Panel>
  );
};

export default GasLimitsPanel;
