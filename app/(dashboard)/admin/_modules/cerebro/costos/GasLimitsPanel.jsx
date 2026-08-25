"use client";

import DataTable from "@/components/DataTable";
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
    header: "Red",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "currentGwei",
    header: "Gas actual",
    meta: { align: "right" },
    cell: (info) => {
      const { error } = info.row.original;
      if (error) return <span className="font-inter text-[10px] text-red-600">{error}</span>;
      return (
        <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
          {formatNumber(info.getValue(), { decimals: 3 })} gwei
        </span>
      );
    },
  },
  {
    accessorKey: "maxGwei",
    header: "Límite",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      return value === null ? (
        <span className="text-[rgba(25,54,63,0.3)]">—</span>
      ) : (
        <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
          {formatNumber(value, { decimals: 3 })} gwei
        </span>
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
 * `source` ("default" vs hand-set override) is not in the API; the original
 * column can't be reproduced and is left out rather than guessed.
 */
const GasLimitsPanel = () => {
  const prices = useGetGasPrices();
  const limits = useGetGasLimits();

  const rows = useMemo(() => {
    const ceilings = new Map(
      (limits.data ?? []).map((limit) => [String(limit.chain).toLowerCase(), limit.maxGasGwei])
    );

    return (prices.data?.rows ?? []).map((row) => {
      // app-api spells Polygon both ways; accept either.
      const maxGwei =
        ceilings.get(row.chain) ?? (row.chain === "polygon" ? ceilings.get("matic") : undefined);
      const ceiling = typeof maxGwei === "number" ? maxGwei : null;

      return {
        ...row,
        maxGwei: ceiling,
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
            Los límites no se pudieron leer ({limits.error.message}), así que la columna «Límite» y
            el uso salen vacíos. Los precios actuales son reales.
          </p>
        )}

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Vista de solo lectura: los límites se editan en el Panel de Admin de la app (Configuración
          → Límites de Gas), no aquí.
        </p>
      </QueryState>
    </Panel>
  );
};

export default GasLimitsPanel;
