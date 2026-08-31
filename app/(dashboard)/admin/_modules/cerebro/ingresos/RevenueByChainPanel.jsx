"use client";

import DataTable from "@/components/DataTable";
import { cerebroActiveChains } from "@/constants/cerebro";
import { useGetTreasuryByChain } from "@/hooks/cerebro/useGetTreasuryByChain";
import { cn } from "@/utils";
import { formatNumber, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

const sumBy = (table, key) =>
  table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original[key] ?? 0), 0);

/**
 * `user_fees_usd` in the upstream query, and the only column the old dashboard's
 * «Earnings by chain» ever showed: inflows whose sender is a known user Safe, minus
 * `nft_sale` rows. `total_usd` next to it also counts team funding, internal swaps
 * and NFT sales, so labelling it "comisiones de usuario" — which is what this panel
 * used to do — overstates revenue on any chain the treasury was topped up on.
 *
 * `admin.md` documents neither field, only `totalUsd`. It documented neither of
 * `/fees/diagnostics`' real names either; the endpoints are ports of
 * `hyxora-admin-main/src/lib/queries.ts` and answer with the SQL spellings. If
 * `userFeesUsd` ever stops arriving the column drops out rather than quietly
 * showing the total under the wrong header — see `hasUserFees` below.
 *
 * @param {Object} [row] The `/fees/treasury/by-chain` row for this chain, if any.
 * @return {number | null}
 */
const userFeesOf = (row) => {
  const value = Number(row?.userFeesUsd ?? row?.user_fees_usd ?? Number.NaN);
  return Number.isFinite(value) ? value : null;
};

/**
 * Treasury inflows per network.
 *
 * Rows come from `cerebroActiveChains`, not from the response: the endpoint groups
 * by `chain_id` and so returns nothing at all for a chain with no inflows, and a
 * row for deprecated Ethereum that no per-chain breakdown should count. Iterating
 * the registry and looking each row up is how the old dashboard renders the same
 * table — a quiet chain reads $0 instead of vanishing.
 *
 * `/fees/treasury/by-chain` takes no `days`, so this table is all-time and can't be
 * compared line for line with the 30-day panels above it. The per-token panel is
 * the one to use for a window.
 *
 * @param {Object} props
 * @param {boolean} [props.includeNonWhitelisted] Owned by `IngresosModule`, which
 * drives the whole tab from one control.
 */
const RevenueByChainPanel = ({ includeNonWhitelisted = false }) => {
  const { data, error, isLoading, isFetching, refetch } = useGetTreasuryByChain({
    includeNonWhitelisted,
  });

  const rows = useMemo(() => {
    const byChainId = new Map((data ?? []).map((row) => [Number(row.chainId), row]));

    return cerebroActiveChains.map(({ chainId, name }) => {
      const row = byChainId.get(chainId);
      return {
        chainId,
        chainName: name,
        transfers: Number(row?.transfers ?? 0),
        tokens: Number(row?.tokens ?? 0),
        userFeesUsd: userFeesOf(row) ?? 0,
        totalUsd: Number(row?.totalUsd ?? 0),
      };
    });
  }, [data]);

  const hasUserFees = useMemo(() => (data ?? []).some((row) => userFeesOf(row) !== null), [data]);

  const columns = useMemo(() => {
    /**
     * Two USD columns share this: a chain that earned nothing greys its zero out
     * rather than dressing it in the same emerald as real revenue, and sub-dollar
     * amounts keep four decimals — several chains only ever see cents here.
     */
    const usdColumn = (key, header, label) => ({
      accessorKey: key,
      header,
      meta: { align: "right", label },
      cell: (info) => {
        const value = info.getValue() ?? 0;
        return (
          <span
            className={cn(
              "font-medium tabular-nums",
              value > 0 ? "text-emerald-700" : "text-[rgba(25,54,63,0.3)]"
            )}
          >
            {formatUsd(value, { decimals: value > 0 && value < 1 ? 4 : 2 })}
          </span>
        );
      },
      footer: ({ table }) => (
        <span className="text-emerald-700">{formatUsd(sumBy(table, key), { decimals: 2 })}</span>
      ),
    });

    return [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
        footer: () => "Total",
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
        accessorKey: "tokens",
        header: "Tokens",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
            {formatNumber(info.getValue())}
          </span>
        ),
      },
      ...(hasUserFees ? [usdColumn("userFeesUsd", "Comisiones de usuario", "Comisiones")] : []),
      usdColumn("totalUsd", "Total de entradas", "Total"),
    ];
  }, [hasUserFees]);

  return (
    <Panel
      title="Ingresos por cadena"
      description="Entradas al tesoro agrupadas por red, desde el inicio: este endpoint no acepta ventana de días."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-ingresos-por-cadena"
          searchPlaceholder="Buscar cadena..."
          enableSelection={false}
          enableFooter
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          {hasUserFees
            ? "«Comisiones de usuario» son las entradas que pagó un Safe de usuario, sin las ventas de NFT; «Total de entradas» suma además el fondeo del equipo y los swaps internos. "
            : "«Total de entradas» incluye el fondeo del equipo y los swaps internos, no solo lo que pagaron los usuarios. "}
          Las redes salen siempre todas y en el mismo orden, con $0 si aún no registraron entradas.
          Ethereum queda fuera: la app dejó de usarla y su histórico no cuenta en ningún desglose.
        </p>
      </QueryState>
    </Panel>
  );
};

export default RevenueByChainPanel;
