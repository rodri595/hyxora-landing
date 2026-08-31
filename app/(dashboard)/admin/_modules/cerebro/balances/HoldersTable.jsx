"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { cn } from "@/utils";
import { formatUsd, hoursSince, timeAgo } from "@/utils/format";
import { holderLabel } from "./holders";

/**
 * How stale this user's positions are.
 *
 * Zerion positions are only refreshed when the backend's sweep rotates around to
 * this user, so a row can describe a token they already sold. Past a day that
 * stops being a detail and starts being a caveat, so it gets an amber tint —
 * copied from the old dashboard, which learned it the hard way.
 */
const SnapshotCell = ({ value }) => {
  const hours = hoursSince(value);
  if (hours === null) {
    return <span className="italic text-[rgba(25,54,63,0.3)]">nunca</span>;
  }

  return (
    <span
      className={cn(hours > 24 ? "text-amber-700" : "text-[rgba(25,54,63,0.5)]")}
      title={`Última actualización de Zerion: ${new Date(value).toISOString().slice(0, 16)}`}
    >
      {timeAgo(value)}
    </span>
  );
};

/**
 * The value a holder has in this asset.
 *
 * `/holdings/holders` sums across networks, so when a holder appears on more than
 * one the figure is wider than the row it was opened from. Marked rather than
 * silently shown as if it belonged to this chain alone.
 */
const ValueCell = ({ value, chainCount, chainsLabel }) => (
  <span
    className="font-medium tabular-nums text-[#19363F]"
    title={chainsLabel ? `Redes: ${chainsLabel}` : undefined}
  >
    {formatUsd(value, { decimals: 2 })}
    {chainCount > 1 && (
      <span className="ml-1 font-normal text-[10px] text-[rgba(25,54,63,0.35)]">
        ×{chainCount} redes
      </span>
    )}
  </span>
);

/**
 * The symbol is deliberately absent: this only ever renders inside an expanded row,
 * where it is the row directly above. Repeating it on every line would be the same
 * value copied down the table.
 */
const columns = [
  {
    accessorKey: "email",
    header: "Correo",
    cell: (info) => (
      <span className="text-[#19363F]" title={info.row.original.privyId}>
        {holderLabel(info.row.original)}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">{cerebroPlanLabel(info.getValue())}</span>
    ),
  },
  {
    accessorKey: "chainsLabel",
    header: "Redes",
    cell: (info) => <span className="text-[rgba(25,54,63,0.45)]">{info.getValue() || "—"}</span>,
  },
  {
    accessorKey: "tvlRefreshedAt",
    header: "Snapshot",
    cell: (info) => <SnapshotCell value={info.getValue()} />,
  },
  {
    accessorKey: "valueUsd",
    header: "Valor",
    meta: { align: "right" },
    cell: (info) => (
      <ValueCell
        value={info.getValue()}
        chainCount={info.row.original.chainCount}
        chainsLabel={info.row.original.chainsLabel}
      />
    ),
  },
];

/**
 * Who holds one asset — one row per user.
 *
 * No toolbar: every flag that would draw one is off, so the nested table reads as
 * part of the row it opened from rather than as a second table with its own search
 * and export sitting inside the first.
 *
 * @param {Object} props
 * @param {Object[]} props.holders Rows from `holdersOnChain`.
 * @param {string} [props.emptyLabel]
 */
const HoldersTable = ({ holders, emptyLabel }) => (
  <DataTable
    data={holders}
    columns={columns}
    initialSorting={[{ id: "valueUsd", desc: true }]}
    emptyLabel={emptyLabel}
    enableSelection={false}
    enableSearch={false}
    enableExport={false}
    showRowCount={false}
    enablePagination={holders.length > 25}
    pageSize={25}
    bare
    dense
  />
);

export default HoldersTable;
