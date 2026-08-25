"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetHoldings } from "@/hooks/cerebro/useGetHoldings";
import { useGetHoldingsIndex } from "@/hooks/monitoring/useGetHoldingsIndex";
import { formatNumber, formatUsd } from "@/utils/format";
import { useCallback, useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import HoldersTable from "./HoldersTable";
import { HOLDINGS_LIMIT, HOLDINGS_PAGE_SIZE } from "./constants";
import { holdersOfToken } from "./holders";

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
 * How far the holders sweep actually reached.
 *
 * Rendered whether or not it found anything, because «0 titulares» from a sweep
 * that skipped half the user base is indistinguishable from «nadie tiene esto»
 * unless the panel says how far it looked.
 */
const IndexCoverage = ({ data, error }) => {
  if (error) {
    return (
      <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
        Los titulares no están disponibles: {error.message} Las cifras agregadas de arriba vienen de
        Cerebro y no están afectadas.
      </p>
    );
  }

  if (!data) return null;

  const { scannedUsers, totalUsers, truncated, failures = [] } = data;

  return (
    <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
      Titulares construidos sobre {formatNumber(scannedUsers)} usuarios con saldo
      {typeof totalUsers === "number" && totalUsers > 0
        ? ` de ${formatNumber(totalUsers)} registrados`
        : ""}
      . Cerebro no expone quién tiene cada activo, así que se arma consultando la cartera de cada
      usuario y se cachea 5 minutos.
      {truncated > 0 && (
        <span className="text-amber-700">
          {" "}
          {formatNumber(truncated)} usuarios con saldo quedaron fuera del tope del barrido: las
          listas de titulares son parciales.
        </span>
      )}
      {failures.length > 0 && (
        <span className="text-amber-700">
          {" "}
          {formatNumber(failures.length)} carteras no respondieron y no están contadas.
        </span>
      )}
    </p>
  );
};

/**
 * Aggregate token exposure across every user, one row per token *and chain*: SOL on
 * Base and SOL on Solana are different positions and Cerebro reports them apart.
 *
 * Expanding a row lists who holds it. That comes from `/api/monitoring/holdings-index`
 * and not from `/holdings`, which only ever reports the aggregate. The two sources
 * are fetched separately on purpose, so a failing sweep costs the holder lists and
 * leaves the numbers standing.
 */
const TopTokensPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetHoldings({
    limit: HOLDINGS_LIMIT,
  });
  const {
    data: index,
    error: indexError,
    isLoading: indexLoading,
    isFetching: indexFetching,
    refetch: refetchIndex,
  } = useGetHoldingsIndex();

  const rows = useMemo(
    () =>
      (data?.tokens ?? []).map((row) => ({
        ...row,
        chainName: cerebroChainLabel(row),
      })),
    [data]
  );

  const renderSubRow = useCallback(
    (token) => {
      if (indexLoading) {
        return (
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Cargando titulares…
          </p>
        );
      }

      if (!index) {
        return (
          <p className="font-inter text-[10px] tracking-[-0.4px] text-amber-700">
            {indexError?.message ?? "El índice de titulares no está disponible."}
          </p>
        );
      }

      return (
        <HoldersTable
          holders={holdersOfToken(index.holders, token)}
          emptyLabel={`Ningún usuario del barrido tiene ${token.symbol} en ${token.chainName}.`}
        />
      );
    },
    [index, indexError, indexLoading]
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
      action={
        <RefreshButton
          onClick={() => {
            refetch();
            refetchIndex();
          }}
          isLoading={isFetching || indexFetching}
        />
      }
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
          columna no tiene total. La búsqueda de arriba solo filtra estas filas.
        </p>

        <IndexCoverage data={index} error={indexError} />
      </QueryState>
    </Panel>
  );
};

export default TopTokensPanel;
