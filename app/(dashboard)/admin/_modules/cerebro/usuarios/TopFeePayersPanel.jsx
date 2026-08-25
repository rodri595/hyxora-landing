"use client";

import DataTable from "@/components/DataTable";
import { useGetTopFeePayers } from "@/hooks/cerebro/useGetTopFeePayers";
import { formatNumber, formatPercent, formatUsd, shortenHash } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";
import { RECENT_DAYS, TOP_PAYERS_LIMIT } from "./constants";

const PayerCell = ({ row }) => {
  const handle = row.twitterUsername;

  if (row.email) {
    return (
      <span className="text-[#19363F]" title={row.privyId}>
        {row.email}
      </span>
    );
  }
  if (handle) {
    return (
      <span className="text-[#19363F]" title={row.privyId}>
        {handle.startsWith("@") ? handle : `@${handle}`}
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]" title={row.privyId}>
      {shortenHash(row.privyId ?? "", { lead: 14, tail: 4 })}
    </span>
  );
};

const columns = [
  {
    id: "rank",
    header: "#",
    enableSorting: false,
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.35)]">{info.row.index + 1}</span>
    ),
    footer: () => "Total",
  },
  {
    accessorKey: "email",
    header: "Usuario",
    cell: (info) => <PayerCell row={info.row.original} />,
  },
  {
    accessorKey: "safeAddress",
    header: "Safe",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
      return (
        <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]" title={value}>
          {shortenHash(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "share",
    header: "% del top",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      if (!Number.isFinite(value)) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
      return (
        <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
          {formatPercent(value, { decimals: 1 })}
        </span>
      );
    },
    footer: () => <span className="text-[rgba(25,54,63,0.3)]">—</span>,
  },
  {
    accessorKey: "totalUsd",
    header: "Comisiones pagadas",
    meta: { align: "right", label: "Comisiones" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-emerald-700">
        {formatUsd(info.getValue(), { decimals: 2 })}
      </span>
    ),
    footer: ({ table }) => formatUsd(sumColumn(table, "totalUsd"), { decimals: 2 }),
  },
];

/**
 * Who is actually paying us, largest first.
 *
 * `/users?sort=fees` orders the same figure a page at a time; this endpoint returns
 * the head of the list directly, which is what a concentration read needs — if the
 * top three are most of the revenue, that is a risk worth seeing on one screen and
 * not something a paginated table makes obvious.
 *
 * «% del top» is a share of what this table shows, not of all revenue: the endpoint
 * returns the top N and no grand total, so a percentage of everything would need a
 * denominator nothing here has. The Ingresos tab holds the real total.
 */
const TopFeePayersPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetTopFeePayers({
    limit: TOP_PAYERS_LIMIT,
    days: RECENT_DAYS,
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    const total = list.reduce((sum, row) => sum + (Number(row.totalUsd) || 0), 0);

    return list.map((row) => ({
      ...row,
      totalUsd: Number(row.totalUsd) || 0,
      // formatPercent appends the sign, it does not scale — feed it percent units.
      share: total > 0 ? ((Number(row.totalUsd) || 0) / total) * 100 : null,
    }));
  }, [data]);

  // Revenue concentration in one number: how much of this table the top three are.
  const topThreeShare = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.totalUsd, 0);
    if (total <= 0) return null;
    return (rows.slice(0, 3).reduce((sum, row) => sum + row.totalUsd, 0) / total) * 100;
  }, [rows]);

  return (
    <Panel
      title="Quién paga las comisiones"
      meta={`últimos ${RECENT_DAYS} días`}
      description={`Los ${TOP_PAYERS_LIMIT} usuarios que más han dejado en el tesoro en la ventana, de mayor a menor.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Nadie pagó comisiones en la ventana."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename={`cerebro-top-comisiones-${RECENT_DAYS}d`}
          searchPlaceholder="Buscar por correo, handle o Safe..."
          initialSorting={[{ id: "totalUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />

        {topThreeShare !== null && rows.length > 3 && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
            Los tres primeros son el {formatPercent(topThreeShare, { decimals: 0 })} de estas{" "}
            {formatNumber(rows.length)} filas. Ojo con leerlo como cuota de todos los ingresos: el
            endpoint devuelve solo la cabeza de la lista, no el total — ese está en Ingresos.
          </p>
        )}
      </QueryState>
    </Panel>
  );
};

export default TopFeePayersPanel;
