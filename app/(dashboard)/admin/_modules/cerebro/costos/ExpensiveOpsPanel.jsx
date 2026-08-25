"use client";

import DataTable from "@/components/DataTable";
import { cerebroChains, cerebroOperationLabels } from "@/constants/cerebro";
import { useGetExpensiveOperations } from "@/hooks/cerebro/useGetExpensiveOperations";
import { formatDateTime, formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import TxLink from "../../shared/TxLink";
import FilterSelect from "./FilterSelect";
import { EXPENSIVE_LIMIT, EXPENSIVE_THRESHOLDS } from "./constants";

const UserCell = ({ user }) => {
  if (user?.email) {
    return <span className="text-[rgba(25,54,63,0.7)]">{user.email}</span>;
  }
  if (user?.privyId) {
    return (
      <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]">
        {shortenHash(user.privyId, { lead: 14, tail: 4 })}
      </span>
    );
  }
  return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
};

const columns = [
  {
    accessorKey: "timestamp",
    header: "Hora",
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.65)]">
        {formatDateTime(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "chainName",
    header: "Cadena",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "operationLabel",
    header: "Operación",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "userLabel",
    header: "Usuario",
    cell: (info) => <UserCell user={info.row.original.user} />,
  },
  {
    accessorKey: "txHash",
    header: "Tx",
    cell: (info) => <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />,
  },
  {
    accessorKey: "costUsd",
    header: "Coste (USD)",
    meta: { align: "right", label: "Coste" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-red-600">
        {formatUsd(info.getValue(), { decimals: 6 })}
      </span>
    ),
  },
];

/**
 * Individual sponsored operations, newest cost first, for manual review.
 *
 * This is Cerebro's `/costs/expensive`, not the full feed the ported dashboard
 * paginates — see the panel above. A threshold of «Todas» asks for every op, which
 * is what makes this readable as a recent-activity list rather than only a list of
 * outliers; the endpoint still caps the response at 200 rows.
 */
const ExpensiveOpsPanel = () => {
  const [threshold, setThreshold] = useState(0);
  const { data, error, isLoading, isFetching, refetch } = useGetExpensiveOperations({
    threshold,
    limit: EXPENSIVE_LIMIT,
  });

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => ({
        ...row,
        chainName: cerebroChains[row.chainId] ?? `Chain ${row.chainId}`,
        operationLabel: cerebroOperationLabels[row.operation] ?? row.operation ?? "—",
        // Flattened so search and sorting reach the nested user object.
        userLabel: row.user?.email ?? row.user?.privyId ?? "",
      })),
    [data]
  );

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
      </QueryState>
    </Panel>
  );
};

export default ExpensiveOpsPanel;
