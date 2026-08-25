"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback, useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import AssetHolders from "./AssetHolders";
import { HOLDINGS_LIMIT, HOLDINGS_PAGE_SIZE } from "./constants";

const columns = [
  {
    accessorKey: "symbol",
    header: "Símbolo",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
    footer: () => "Total",
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "chainName",
    header: "Redes",
    cell: (info) => <span className="text-[rgba(25,54,63,0.5)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "holders",
    header: "Titulares",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatNumber(info.getValue())}
      </span>
    ),
    // Not summed on purpose — the same user holds several of these.
    footer: () => <span className="text-[rgba(25,54,63,0.3)]">—</span>,
  },
  {
    accessorKey: "totalUsd",
    header: "Valor total",
    meta: { align: "right" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-[#19363F]">
        {formatUsd(info.getValue(), { decimals: 2 })}
      </span>
    ),
    footer: ({ table }) => formatUsd(sumColumn(table, "totalUsd"), { decimals: 2 }),
  },
];

/**
 * Aggregate token exposure across every user, one row per token *and chain*: SOL on
 * Base and SOL on Solana are different positions and Cerebro reports them apart.
 *
 * Expanding a row lists who holds it, from `/holdings/holders`. That used to be the
 * one thing on this tab Cerebro could not answer — `/holdings` is an aggregate with
 * no way to ask who is behind a number — and we rebuilt the join ourselves by
 * sweeping every user's portfolio. The endpoint exists now, so the sweep is gone and
 * each row asks only for itself, when it is opened.
 *
 * Still two requests on purpose: a failing holder query costs the expanded list and
 * leaves the aggregates standing.
 */
const TopTokensPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetHoldings({
    limit: HOLDINGS_LIMIT,
  });

  const rows = useMemo(
    () =>
      (data?.tokens ?? []).map((row) => ({
        ...row,
        chainName: cerebroChainLabel(row),
      })),
    [data]
  );

  const renderSubRow = useCallback(
    (token) => (
      <AssetHolders
        query={token.symbol}
        row={token}
        label={`${token.symbol} en ${token.chainName}`}
      />
    ),
    []
  );

  const atCap = rows.length >= HOLDINGS_LIMIT;

  return (
    <Panel
      title="Principales tokens entre todos los usuarios"
      description={
        atCap
          ? `Tope de ${HOLDINGS_LIMIT} filas alcanzado — el máximo que acepta /holdings. Hay tokens por debajo del corte que no aparecen aquí, así que el total es un mínimo y esos activos no tienen fila que abrir.`
          : "Exposición agregada en USD por token, sumando las posiciones de todos los usuarios. Abre una fila para ver quién lo tiene."
      }
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay posiciones en tokens registradas."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-tokens"
          searchPlaceholder="Buscar por símbolo, nombre o red..."
          initialSorting={[{ id: "totalUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          enablePagination={rows.length > HOLDINGS_PAGE_SIZE}
          pageSize={HOLDINGS_PAGE_SIZE}
          renderSubRow={renderSubRow}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Los titulares no se suman: un mismo usuario cuenta en cada token que tiene, así que la
          columna no tiene total. La búsqueda de arriba solo filtra estas filas; la de titulares al
          abrir una es del servidor y busca por símbolo, no por red.
        </p>
      </QueryState>
    </Panel>
  );
};

export default TopTokensPanel;
