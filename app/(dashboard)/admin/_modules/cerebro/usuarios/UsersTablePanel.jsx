"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetUsers } from "@/hooks/cerebro/useGetUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/utils";
import { formatUsd, shortenHash, toDayString } from "@/utils/format";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import ScopeTabs from "./ScopeTabs";
import { DETAIL_DRAWER_WIDTH, USER_PAGE_SIZE, USER_PAGE_SIZES } from "./constants";
import UserDetailDrawer from "./detail/UserDetailDrawer";
import { KycBadge, MembershipBadge, NftChip } from "./detail/parts";

gsap.registerPlugin(useGSAP);

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

const EyeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/**
 * An address or id with its copy button, truncated to fit.
 *
 * These are the cells nobody reads and everybody copies — a Privy DID is 30-odd
 * characters of which four carry information — so the button is not an affordance
 * to discover, it is the point of the column.
 */
const IdCell = ({ value, lead = 10, tail = 6 }) => {
  if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.6)]"
        title={value}
      >
        {shortenHash(value, { lead, tail })}
      </span>
      <CopyButton text={value} />
    </div>
  );
};

/**
 * Column ids are the API's `sort` vocabulary, so a header click maps straight to
 * the query param with no lookup table in between. The columns the endpoint cannot
 * order by — everything but created, tvl, cost, fees, net and plan — say so with
 * `enableSorting: false` rather than offering an arrow that would silently reorder
 * nothing.
 *
 * @param {(user: Object) => void} onOpen
 */
const buildColumns = (onOpen) => [
  {
    id: "email",
    accessorKey: "email",
    header: "Usuario",
    // /users sorts on created, tvl, cost, fees, net and plan — not on email.
    enableSorting: false,
    cell: (info) => {
      const row = info.row.original;
      const email = info.getValue();
      // A Twitter login has no email at all, so the handle is the identity rather
      // than a secondary label. Only show both lines when there are two things to say.
      const handle = row.username ? `@${row.username}` : null;
      const primary = email || handle || shortenHash(row.privyId, { lead: 12, tail: 6 });

      return (
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate font-inter text-[11px] tracking-[-0.44px] text-[#19363F]"
              title={primary}
            >
              {primary}
            </span>
            {email && handle && (
              <span className="truncate font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                {handle}
              </span>
            )}
          </div>
          {email && <CopyButton text={email} title="Copiar correo" />}
        </div>
      );
    },
  },
  {
    id: "privyId",
    accessorKey: "privyId",
    header: "Privy ID",
    enableSorting: false,
    meta: { label: "Privy ID" },
    cell: (info) => <IdCell value={info.getValue()} lead={12} tail={6} />,
  },
  {
    id: "plan",
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => (
      <div className="flex items-center gap-1.5">
        <span className="whitespace-nowrap text-[rgba(25,54,63,0.65)]">
          {cerebroPlanLabel(info.getValue())}
        </span>
        <NftChip balance={info.row.original.nftBalance} tokenIds={info.row.original.nftTokenIds} />
      </div>
    ),
  },
  {
    id: "membership",
    accessorKey: "membershipStatus",
    header: "Membresía",
    enableSorting: false,
    cell: (info) => {
      const renew = info.row.original.membershipRenewDate;

      return (
        <div className="flex flex-col gap-0.5">
          <MembershipBadge status={info.getValue()} />
          {renew && (
            <span className="whitespace-nowrap font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              renueva {formatDay(renew)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "kyc",
    accessorKey: "kycStatus",
    header: "KYC",
    enableSorting: false,
    cell: (info) => <KycBadge status={info.getValue()} />,
  },
  {
    id: "safe",
    accessorKey: "safeAddress",
    header: "Safe",
    enableSorting: false,
    cell: (info) => <IdCell value={info.getValue()} />,
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
      <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.5)]">
        {formatDay(info.getValue())}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    // The way into the drawer can't be hidden by the column menu, unlike every
    // other column here.
    enableHiding: false,
    size: 44,
    meta: { label: "Acciones", align: "right" },
    cell: ({ row }) => (
      <button
        type="button"
        aria-label={`Ver detalle de ${row.original.email || row.original.privyId}`}
        onClick={() => onOpen(row.original)}
        className="flex size-6 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F]"
      >
        <EyeIcon />
      </button>
    ),
  },
];

/**
 * The user table, paginated, sorted and searched by the server, with a per-user
 * drawer behind the eye button on each row.
 *
 * `/users` caps at 200 rows a page, so none of that can happen client-side — the
 * browser never holds more than one page. DataTable runs in its server-driven mode
 * and every control maps to a query param: the scope tabs to `scope`, the search
 * box to `search`, a header click to `sort` + `dir`, the pager to `page` and
 * `pageSize`.
 *
 * The table is wide on purpose — identity, membership, KYC and our economics on the
 * user are four different questions and each is somebody's first column — so the
 * column menu is on. Hiding a column is per-session and per-browser, which is the
 * right scope for "I am looking at billing today".
 */
const UsersTablePanel = () => {
  const [scope, setScope] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState([{ id: "tvl", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: USER_PAGE_SIZE });

  // `isOpen` drives the animation; `selected` persists through the close so the
  // drawer's content doesn't vanish mid-slide.
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

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

  const handleOpen = useCallback((user) => {
    setSelected(user);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // A fixed overlay rather than the inline width animation `UsersModule` uses: this
  // panel is one card in a scrolling column of them, so there is no full-height
  // column beside the table to grow into. Sliding over it also keeps the table's
  // own layout — and its horizontal scroll position — untouched while you read.
  useGSAP(
    () => {
      const drawer = drawerRef.current;
      const backdrop = backdropRef.current;
      if (!drawer || !backdrop) return;

      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(drawer, { x: "0%", duration: 0.35, ease: "power3.out", overwrite: true });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(drawer, {
          x: "100%",
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => setSelected(null),
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  const columns = useMemo(() => buildColumns(handleOpen), [handleOpen]);
  const rows = useMemo(() => data?.users ?? [], [data]);
  const total = data?.total ?? 0;

  return (
    <Panel
      title="Usuarios"
      description="Cada usuario con su plan, su estado de membresía y KYC, su TVL, lo que ha dejado en comisiones y lo que nos ha costado patrocinarle el gas. El margen es ingresos menos gastos, solo de ese usuario. Abre una fila con el ojo para ver su cartera, sus operaciones y sus órdenes SEPA."
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
          enableColumnToggle
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
          por wallet, signer y handle. Correo, membresía, KYC y Safe no ordenan porque el endpoint
          no acepta esas columnas. La exportación baja la página que estás viendo, no las {total}{" "}
          filas — sube a 200 por página si necesitas menos tiradas. Si marcas filas, exporta solo
          esas, y la selección vive dentro de la página: al cambiar de página el navegador ya no
          tiene esas filas, así que marca y exporta página a página.
        </p>
      </QueryState>

      {/* Backdrop. Present at every breakpoint — the drawer overlays the table on a
          desktop too, so a click outside has to close it there as well. */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 bg-black/20"
        style={{ opacity: 0, pointerEvents: "none" }}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
        onClick={handleClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") handleClose();
        }}
      />

      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-50 p-2"
        style={{
          transform: "translateX(100%)",
          width: `min(${DETAIL_DRAWER_WIDTH}px, 100vw)`,
        }}
      >
        {selected && (
          // Keyed on the user so switching rows remounts rather than reconciling —
          // the tabs, the transactions pager and every scroll position inside belong
          // to one account and none of them should carry over to the next.
          <UserDetailDrawer key={selected.privyId} user={selected} onClose={handleClose} />
        )}
      </div>
    </Panel>
  );
};

export default UsersTablePanel;
