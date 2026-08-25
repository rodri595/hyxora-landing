"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel, cerebroOperationLabel } from "@/constants/cerebro";
import { useGetExpensiveOperations } from "@/hooks/cerebro/useGetExpensiveOperations";
import { formatDateTime, formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import TxLink from "../../shared/TxLink";
import FilterSelect from "./FilterSelect";
import { EXPENSIVE_LIMIT, EXPENSIVE_THRESHOLDS } from "./constants";

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * `/costs/expensive` is a port of the old dashboard's `getExpensiveSponsoredOps`
 * (`hyxora-admin-main/src/lib/queries.ts`), and it answers with that query's own
 * field names — `blockTimestamp`, and the user joined in **flat** as `email` /
 * `privyId` / `twitterUsername` next to the raw `sender`. `admin.md` documents
 * `timestamp` and a nested `user` object instead, which is why «Hora» and
 * «Usuario» rendered as dashes: `chainId`, `txHash` and `costUsd` are the only
 * three names the two shapes share.
 *
 * Both spellings are read here rather than one of them picked, so the table
 * survives the doc being made true upstream. `operation` is read the same way,
 * but the query it was ported from selects no such column — the tag lives in
 * `sponsored_user_ops.action_type` and this endpoint doesn't return it — so that
 * column only appears once a row carries one.
 *
 * @param {Object} row
 * @return {Object}
 */
const toExpensiveOpRow = (row) => {
  const chainId = row.chainId ?? row.chain_id ?? null;
  const user = row.user ?? null;
  const email = user?.email ?? row.email ?? null;
  const twitterUsername =
    user?.twitterUsername ?? row.twitterUsername ?? row.twitter_username ?? null;
  const privyId = user?.privyId ?? row.privyId ?? row.privy_id ?? null;
  const sender = row.sender ?? "";
  const operation =
    row.operation ?? row.operationType ?? row.operation_type ?? row.actionType ?? row.action_type;

  return {
    chainId,
    chainName: cerebroChainLabel({ ...row, chainId }),
    timestamp: row.timestamp ?? row.blockTimestamp ?? row.block_timestamp ?? null,
    txHash: row.txHash ?? row.tx_hash ?? "",
    operation: operation ?? null,
    operationLabel: operation ? cerebroOperationLabel(operation) : "",
    email,
    twitterUsername,
    privyId,
    sender,
    // Flattened so search and sorting reach a value spread over four fields.
    // Same fallback order the old dashboard used: a name when the safe-address
    // join found one, otherwise the address that signed.
    userLabel: email ?? (twitterUsername ? `@${twitterUsername}` : null) ?? privyId ?? sender ?? "",
    /** Pimlico bill: chain gas × surcharge — what we owe. */
    costUsd: toNumber(row.costUsd ?? row.cost_usd),
    /** Raw on-chain gas: what the block explorer shows for the tx. */
    bundlerCostUsd: toNumber(row.bundlerCostUsd ?? row.bundler_cost_usd),
  };
};

const UserCell = ({ row }) => {
  const { email, twitterUsername, privyId, sender } = row;

  if (email) {
    return (
      <span className="text-[rgba(25,54,63,0.7)]" title={sender || undefined}>
        {email}
      </span>
    );
  }
  if (twitterUsername) {
    return (
      <span className="text-[rgba(25,54,63,0.7)]" title={sender || undefined}>
        @{twitterUsername}
      </span>
    );
  }
  if (privyId) {
    return (
      <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]" title={privyId}>
        {shortenHash(privyId, { lead: 14, tail: 4 })}
      </span>
    );
  }
  if (sender) {
    // No known wallet matched the sender — an orphan op. The address beats a
    // dash: it's still the thread back to whoever's gas we paid.
    return (
      <span
        className="font-mono text-[10px] text-[rgba(25,54,63,0.4)]"
        title={`Sin usuario asociado — firmó ${sender}`}
      >
        {shortenHash(sender)}
      </span>
    );
  }
  return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
};

const timeColumn = {
  accessorKey: "timestamp",
  header: "Hora",
  cell: (info) => (
    <span className="tabular-nums text-[rgba(25,54,63,0.65)]">
      {formatDateTime(info.getValue())}
    </span>
  ),
};

const chainColumn = {
  accessorKey: "chainName",
  header: "Cadena",
  cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
};

const operationColumn = {
  accessorKey: "operationLabel",
  header: "Operación",
  cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue() || "—"}</span>,
};

const userColumn = {
  accessorKey: "userLabel",
  header: "Usuario",
  cell: (info) => <UserCell row={info.row.original} />,
};

const txColumn = {
  accessorKey: "txHash",
  header: "Tx",
  cell: (info) => <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />,
};

const gasColumn = {
  accessorKey: "bundlerCostUsd",
  header: "Gas on-chain",
  meta: { align: "right", label: "Gas" },
  cell: (info) => (
    <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
      {formatUsd(info.getValue(), { decimals: 6 })}
    </span>
  ),
};

const costColumn = {
  accessorKey: "costUsd",
  header: "Coste (USD)",
  meta: { align: "right", label: "Coste" },
  cell: (info) => (
    <span className="font-medium tabular-nums text-red-600">
      {formatUsd(info.getValue(), { decimals: 6 })}
    </span>
  ),
};

/**
 * Individual sponsored operations, costliest first, for manual review.
 *
 * This is Cerebro's `/costs/expensive`, not the full feed the ported dashboard
 * paginates. A threshold of «Todas» asks for every op, which is what makes this
 * readable as a recent-activity list rather than only a list of outliers; the
 * endpoint still caps the response at 200 rows.
 */
const ExpensiveOpsPanel = () => {
  const [threshold, setThreshold] = useState(0);
  const { data, error, isLoading, isFetching, refetch } = useGetExpensiveOperations({
    threshold,
    limit: EXPENSIVE_LIMIT,
  });

  const rows = useMemo(() => (data ?? []).map(toExpensiveOpRow), [data]);

  // Two of these columns rest on fields the endpoint may or may not send, and a
  // column of dashes reads as missing data rather than as an absent field. Each
  // appears only once a row proves it exists.
  const columns = useMemo(() => {
    const hasOperation = rows.some((row) => row.operation);
    const hasGas = rows.some((row) => row.bundlerCostUsd !== null);

    return [
      timeColumn,
      chainColumn,
      ...(hasOperation ? [operationColumn] : []),
      userColumn,
      txColumn,
      ...(hasGas ? [gasColumn] : []),
      costColumn,
    ];
  }, [rows]);

  const atCap = rows.length >= EXPENSIVE_LIMIT;

  return (
    <Panel
      title={`Ops patrocinadas más caras (${formatNumber(rows.length)})`}
      description={
        atCap
          ? `Tope de ${EXPENSIVE_LIMIT} filas alcanzado: hay más operaciones por encima de este umbral de las que el endpoint devuelve. Sube el umbral para ver las más caras.`
          : "Cada operación patrocinada individualmente, con quién la lanzó y qué costó."
      }
      action={
        <div className="flex items-center gap-2">
          <FilterSelect
            value={threshold}
            onChange={setThreshold}
            options={EXPENSIVE_THRESHOLDS}
            label="Umbral de coste"
          />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ninguna operación superó el umbral."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-ops-patrocinadas"
          searchPlaceholder="Buscar por cadena, operación, usuario o hash..."
          initialSorting={[{ id: "costUsd", desc: true }]}
          enableSelection={false}
          enablePagination
          pageSize={25}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          «Usuario» es el correo o el Twitter de quien firmó la operación; cuando ninguna wallet
          conocida coincide con el emisor, se muestra su dirección. «Coste» es lo que factura
          Pimlico, recargo incluido.
        </p>
      </QueryState>
    </Panel>
  );
};

export default ExpensiveOpsPanel;
