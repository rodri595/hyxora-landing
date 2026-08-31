"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetUsers } from "@/hooks/cerebro/useGetUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/utils";
import { formatUsd, toDayString } from "@/utils/format";
import { useCallback, useMemo, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import ScopeTabs from "./ScopeTabs";
import { USER_PAGE_SIZE, USER_PAGE_SIZES } from "./constants";

/**
 * Selection is keyed by row id, and the default id is the row's position in the
 * page. On a server-paginated table that means a tick stays on "the third row"
 * while the rows underneath it change — page forward and you would be exporting
 * somebody else. `privyId` is the one field every /users row carries.
 */
const getRowId = (row) => row.privyId;

const formatDay = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : toDayString(date);
};

/**
 * Zero and missing render the same "—": a user who never paid a fee and a user
 * whose fees we failed to attribute both mean "nothing here", and $0.000 reads as
 * a measurement.
 */
const MoneyCell = ({ value, tone }) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) {
    return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
  }

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        tone === "cost" ? "text-red-600" : "text-emerald-700"
      )}
    >
      {formatUsd(value, { decimals: 3 })}
    </span>
  );
};

const NetCell = ({ value }) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) {
    return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
  }

  return (
    <span
      className={cn("font-medium tabular-nums", value < 0 ? "text-red-600" : "text-emerald-700")}
    >
      {value > 0 ? "+" : ""}
      {formatUsd(value, { decimals: 3 })}
    </span>
  );
};

// Column ids are the API's `sort` vocabulary, so a header click maps straight to
// the query param with no lookup table in between.
const columns = [
  {
    id: "email",
    accessorKey: "email",
    header: "Correo",
    // /users sorts on created, tvl, cost, fees, net and plan — not on email.
    enableSorting: false,
    cell: (info) => (
      <span className="text-[#19363F]">{info.getValue() || info.row.original.username || "—"}</span>
    ),
  },
  {
    id: "plan",
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">{cerebroPlanLabel(info.getValue())}</span>
    ),
  },
  {
    id: "tvl",
    accessorKey: "tvlUsd",
    header: "TVL",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      const isBig = typeof value === "number" && Math.abs(value) >= 1000;
      return (
        <span className="font-medium tabular-nums text-[#19363F]">
          {formatUsd(value, { decimals: isBig ? 0 : 2 })}
        </span>
      );
    },
  },
  {
    id: "fees",
    accessorKey: "feesUsd",
    header: "Ingresos",
    meta: { align: "right" },
    cell: (info) => <MoneyCell value={info.getValue()} tone="fees" />,
  },
  {
    id: "cost",
    accessorKey: "costUsd",
    header: "Gastos",
    meta: { align: "right" },
    cell: (info) => <MoneyCell value={info.getValue()} tone="cost" />,
  },
  {
    id: "net",
    accessorKey: "netUsd",
    header: "Margen",
    meta: { align: "right" },
    cell: (info) => <NetCell value={info.getValue()} />,
  },
  {
    id: "created",
    accessorKey: "createdAt",
    header: "Registrado",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.5)]">{formatDay(info.getValue())}</span>
    ),
  },
];

/**
 * The user table, paginated, sorted and searched by the server.
 *
 * `/users` caps at 200 rows a page, so none of that can happen client-side — the
 * browser never holds more than one page. DataTable runs in its server-driven mode
 * and every control maps to a query param: the scope tabs to `scope`, the search
 * box to `search`, a header click to `sort` + `dir`, the pager to `page` and
 * `pageSize`.
 */
const UsersTablePanel = () => {
  const [scope, setScope] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState([{ id: "tvl", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: USER_PAGE_SIZE });

  const search = useDebouncedValue(searchInput, 350);

  const { data, error, isLoading, isFetching, refetch } = useGetUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sort: sorting[0]?.id,
    dir: sorting[0]?.desc ? "desc" : "asc",
    search: search || undefined,
    scope: scope === "inactive" ? "inactive" : undefined,
  });

  const resetPage = useCallback(
    () => setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 })),
    []
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);
      resetPage();
    },
    [resetPage]
  );

  const handleSortingChange = useCallback(
    (updater) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        // A third click would clear sorting, but the server always orders by
        // something — the table would show no arrow while rows came back sorted
        // by `created`. Keep the last choice instead.
        return next.length > 0 ? next : prev;
      });
      resetPage();
    },
    [resetPage]
  );

  const handleScopeChange = useCallback(
    (next) => {
      setScope(next);
      resetPage();
    },
    [resetPage]
  );

  const rows = useMemo(() => data?.users ?? [], [data]);
  const total = data?.total ?? 0;

  return (
    <Panel
      title="Usuarios"
      description="Cada usuario con su TVL, lo que ha dejado en comisiones y lo que nos ha costado patrocinarle el gas. El margen es ingresos menos gastos, solo de ese usuario."
      action={
        <div className="flex items-center gap-2">
          <ScopeTabs value={scope} onChange={handleScopeChange} />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-usuarios"
          searchPlaceholder="Busca por correo o usuario..."
          emptyLabel="Ningún usuario coincide con la búsqueda."
          showRowCount={false}
          getRowId={getRowId}
          enablePagination
          manualPagination
          manualSorting
          manualFiltering
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          globalFilter={searchInput}
          onGlobalFilterChange={handleSearchChange}
          pageSizeOptions={USER_PAGE_SIZES}
          isFetching={isFetching}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          La búsqueda de /users mira correo y nombre de usuario; el dashboard original busca además
          por wallet, signer y handle. Correo no ordena porque el endpoint no acepta esa columna, y
          la exportación baja la página que estás viendo, no las {total} filas — sube a 200 por
          página si necesitas menos tiradas. Si marcas filas, exporta solo esas, y la selección vive
          dentro de la página: al cambiar de página el navegador ya no tiene esas filas, así que
          marca y exporta página a página.
        </p>
      </QueryState>
    </Panel>
  );
};

export default UsersTablePanel;
