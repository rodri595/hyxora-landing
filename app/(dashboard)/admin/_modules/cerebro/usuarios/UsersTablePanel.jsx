"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import { useGetUserStats } from "@/hooks/cerebro/useGetUserStats";
import { useGetUsers } from "@/hooks/cerebro/useGetUsers";
import { SWEEP_MAX_PAGES, useGetUsersSweep } from "@/hooks/cerebro/useGetUsersSweep";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/utils";
import { formatUsd, shortenHash, toDayString } from "@/utils/format";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";
import { PanelNote } from "../../shared/Explanations";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { firstNumber } from "../../shared/aggregate";
import BulkEmailDrawer, { BULK_EMAIL_DRAWER_WIDTH, collectRecipients } from "./BulkEmailDrawer";
import UserQueryPrompt from "./UserQueryPrompt";
import { DETAIL_DRAWER_WIDTH, GROWTH_DAYS, USER_PAGE_SIZE, USER_PAGE_SIZES } from "./constants";
import UserDetailDrawer from "./detail/UserDetailDrawer";
import { KycBadge, MembershipBadge, NftChip } from "./detail/parts";
import { findFounderUser, indexFounderUsers, withFounderFields } from "./founders";
import { matchesFilters } from "./userQuery";

const DEFAULT_SORTING = [{ id: "tvl", desc: true }];
const NO_FILTERS = {};

gsap.registerPlugin(useGSAP);

/**
 * Selection is keyed by row id, and the default id is the row's position in the
 * page. On a server-paginated table that means a tick stays on "the third row"
 * while the rows underneath it change — page forward and you would be exporting
 * somebody else. `privyId` is the one field every /users row carries.
 */
const getRowId = (row) => row.privyId;

/**
 * The pager's total, or null when nothing trustworthy says how many rows there are.
 *
 * Every page button sat disabled at 25, 50 and 200 rows a page, which is what a
 * `/users` `total` that is missing (0 pages) or that echoes the page it came with
 * (1 page) both look like. So a count is believed only if it could be one: never
 * below the rows already paged past, and not equal to a first page that came back
 * full — that is a page length. Null makes the pager run open-ended, one page at a
 * time for as long as pages come back full.
 *
 * @param {unknown[]} candidates Counts in order of preference, quoted or not.
 * @param {{ pageIndex: number, pageSize: number, loaded: number }} page
 * @return {number | null}
 */
const resolveTotal = (candidates, { pageIndex, pageSize, loaded }) => {
  const seen = pageIndex * pageSize + loaded;
  const firstPageFull = pageIndex === 0 && loaded >= pageSize;

  for (const candidate of candidates) {
    const value = firstNumber(candidate);
    if (value === null || value < seen) continue;
    if (firstPageFull && value === loaded) continue;
    return value;
  }
  return null;
};

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
    return <span className="text-[rgba(25,54,63,0.5)]">—</span>;
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
    return <span className="text-[rgba(25,54,63,0.5)]">—</span>;
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

const MailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M2 4.5l6 4.5 6-4.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  if (!value) return <span className="text-[rgba(25,54,63,0.5)]">—</span>;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.75)]"
        title={value}
      >
        {shortenHash(value, { lead, tail })}
      </span>
      <CopyButton text={value} />
    </div>
  );
};

/**
 * A row with no founders record means one of three things, and only one of them is
 * "no account on the founders site" — so the other two get a look of their own
 * rather than a dash that would read as that answer.
 *
 * @param {Object} props
 * @param {"loading" | "error" | "ready"} props.status
 */
const NoFounderCell = ({ status }) => {
  if (status === "loading") return <span className="text-[rgba(25,54,63,0.5)]">…</span>;

  if (status === "error") {
    return (
      <span className="whitespace-nowrap text-amber-700" title="/admin/getAllUsers no respondió">
        sin dato
      </span>
    );
  }

  return (
    <span
      className="text-[rgba(25,54,63,0.5)]"
      title="Sin cuenta en la web founders con este correo ni esta wallet"
    >
      —
    </span>
  );
};

/**
 * The founders-site account in one cell: how many payments it has and whether it
 * is an admin there — the two things on `/admin?tab=users` this table has no other
 * column for. The tooltip says which key made the match.
 */
const FounderCell = ({ row, status }) => {
  if (!row.founderMatch) return <NoFounderCell status={status} />;

  const count = row.founderPayments ?? 0;

  return (
    <div
      className="flex items-center gap-1.5"
      title={row.founderMatch === "wallet" ? "Vinculado por wallet" : "Vinculado por correo"}
    >
      <span
        className={cn(
          "whitespace-nowrap tabular-nums",
          count > 0 ? "font-medium text-[#19363F]" : "text-[rgba(25,54,63,0.68)]"
        )}
      >
        {count} {count === 1 ? "pago" : "pagos"}
      </span>
      {row.founderRole === "Admin" && (
        <span className="inline-flex items-center rounded-[5px] bg-[#19363F] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.36px] text-white">
          Admin
        </span>
      )}
    </div>
  );
};

/**
 * Column ids are the API's `sort` vocabulary, so a header click maps straight to
 * the query param with no lookup table in between. The columns the endpoint cannot
 * order by — everything but created, tvl, cost, fees, net and plan — say so with
 * `enableSorting: false` rather than offering an arrow that would silently reorder
 * nothing. The two founders columns can't sort either: `/users` has never heard of
 * them, and ordering one page client-side would pass for ordering the table.
 *
 * @param {(user: Object) => void} onOpen
 * @param {"loading" | "error" | "ready"} foundersStatus
 */
const buildColumns = (onOpen, foundersStatus) => [
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
              <span className="truncate font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
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
        <span className="whitespace-nowrap text-[rgba(25,54,63,0.85)]">
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
            <span className="whitespace-nowrap font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
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
    id: "phone",
    accessorKey: "founderPhone",
    header: "Teléfono",
    enableSorting: false,
    cell: (info) => {
      const phone = info.getValue();
      if (!phone) {
        return info.row.original.founderMatch ? (
          <span className="text-[rgba(25,54,63,0.5)]">—</span>
        ) : (
          <NoFounderCell status={foundersStatus} />
        );
      }

      return (
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.85)]">{phone}</span>
          <CopyButton text={phone} title="Copiar teléfono" />
        </div>
      );
    },
  },
  {
    id: "founders",
    accessorKey: "founderPayments",
    header: "Web founders",
    enableSorting: false,
    meta: { label: "Web founders" },
    cell: (info) => <FounderCell row={info.row.original} status={foundersStatus} />,
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
      <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.75)]">
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
        className="flex size-6 items-center justify-center rounded-md text-[rgba(25,54,63,0.68)] transition-colors hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F]"
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
 * It runs in one of two modes, and `UserQueryPrompt` — the sentence above the table
 * — is what switches between them:
 *
 * - **Paged**, the default. `/users` caps at 200 rows a page, so DataTable runs
 *   server-driven and every control maps to a query param: the prompt's scope to
 *   `scope`, the search box to `search`, a header click or the prompt's order to
 *   `sort` + `dir`, the pager to `page` and `pageSize`.
 * - **Swept**, while any prompt filter is on. `/users` has no parameter for plan,
 *   KYC, membership, balance, margin, NFT or signup date, and filtering the one page
 *   the browser holds would pass for filtering the table. So `useGetUsersSweep` reads
 *   every row for the same scope, search and order, `matchesFilters` narrows it here,
 *   and DataTable pages the result client-side. Sort and search still go to the
 *   server, so they mean exactly what they mean in paged mode.
 *
 * The table is wide on purpose — identity, membership, KYC and our economics on the
 * user are four different questions and each is somebody's first column — so the
 * column menu is on. Hiding a column is per-session and per-browser, which is the
 * right scope for "I am looking at billing today".
 */
const UsersTablePanel = () => {
  const [scope, setScope] = useState("all");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState(DEFAULT_SORTING);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: USER_PAGE_SIZE });

  // `isOpen` drives the animation; `selected` persists through the close so the
  // drawer's content doesn't vanish mid-slide.
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  // The same drawer, holding the composer for the ticked rows instead of one user.
  const [mailing, setMailing] = useState(null);

  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  const search = useDebouncedValue(searchInput, 350);

  // The whole founders list, not a page of it: `/admin/getAllUsers` has no paging,
  // and it is the same cached query `/admin?tab=users` and the email composer read.
  // `isPending` rather than `isLoading`: a query still disabled behind its role gate
  // is not loading, and "ready" there would render every row as "no account".
  const founders = useGetAllUsers();
  const founderIndex = useMemo(() => indexFounderUsers(founders.data), [founders.data]);
  const foundersStatus = founders.isError ? "error" : founders.isPending ? "loading" : "ready";

  const refined = Object.keys(filters).length > 0;
  const serverQuery = {
    sort: sorting[0]?.id,
    dir: sorting[0]?.desc ? "desc" : "asc",
    search: search || undefined,
    scope: scope === "inactive" ? "inactive" : undefined,
  };

  // Only one of the two is ever enabled, so a mode costs its own requests and nothing
  // for the other.
  const paged = useGetUsers(
    { ...serverQuery, page: pagination.pageIndex + 1, pageSize: pagination.pageSize },
    { enabled: !refined }
  );
  const sweep = useGetUsersSweep(serverQuery, { enabled: refined });
  const { data, error, isLoading, isFetching, refetch } = refined ? sweep : paged;

  // The query `UserGrowthPanel` already makes on this tab, so it costs no request.
  // Its `totalUsers` is the whole population: the pager's count when `/users` sends
  // none worth believing and neither a search nor a scope narrows the list.
  const stats = useGetUserStats({ days: GROWTH_DAYS });

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

  // One entry point for everything the prompt can change, so a suggestion that sets
  // scope, order and filters at once is one page reset, not three.
  const handleQueryChange = useCallback(
    (next) => {
      if (next.scope !== undefined) setScope(next.scope);
      if (next.sorting !== undefined) setSorting([next.sorting]);
      if (next.filters !== undefined) setFilters(next.filters);
      resetPage();
    },
    [resetPage]
  );

  const handleReset = useCallback(() => {
    setScope("all");
    setSorting(DEFAULT_SORTING);
    setFilters(NO_FILTERS);
    setSearchInput("");
    resetPage();
  }, [resetPage]);

  const handleOpen = useCallback((user) => {
    setMailing(null);
    setSelected(user);
    setIsOpen(true);
  }, []);

  // Recipients are a snapshot of the selection at the click: the composer reads them
  // once, and `id` keys it so reopening with other rows ticked is a fresh email.
  const handleCompose = useCallback(
    (selectedRows) => {
      setSelected(null);
      setMailing({ id: Date.now(), ...collectRecipients(selectedRows, founderIndex) });
      setIsOpen(true);
    },
    [founderIndex]
  );

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
          onComplete: () => {
            setSelected(null);
            setMailing(null);
          },
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  const columns = useMemo(
    () => buildColumns(handleOpen, foundersStatus),
    [handleOpen, foundersStatus]
  );
  const rows = useMemo(() => {
    const users = refined
      ? (sweep.data?.rows ?? []).filter((user) => matchesFilters(user, filters))
      : (paged.data?.users ?? []);
    return users.map((user) => withFounderFields(founderIndex, user));
  }, [refined, sweep.data, paged.data, filters, founderIndex]);

  // Swept, every match is in hand and the count is just how many there are. Paged,
  // `totalUsers` is what the old page called this count, and a port may have kept it.
  // `unfiltered` stays about the /users query alone: prompt filters never reach it,
  // they switch the table to the sweep.
  const unfiltered = !search && scope !== "inactive";
  const total = refined
    ? rows.length
    : resolveTotal([data?.total, data?.totalUsers, unfiltered ? stats.data?.totalUsers : null], {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        loaded: rows.length,
      });

  const isDefaultQuery =
    scope === "all" &&
    !refined &&
    !searchInput &&
    sorting[0]?.id === DEFAULT_SORTING[0].id &&
    sorting[0]?.desc === DEFAULT_SORTING[0].desc;

  // Looked up at render rather than captured on open, so a drawer opened before the
  // founders list arrived fills in when it does.
  const selectedFounder = useMemo(
    () => findFounderUser(founderIndex, selected),
    [founderIndex, selected]
  );

  return (
    <Panel
      title="Usuarios"
      description="Cada usuario con su plan, su estado de membresía y KYC, su TVL, lo que ha dejado en comisiones y lo que nos ha costado patrocinarle el gas. El margen es ingresos menos gastos, solo de ese usuario. Teléfono y Web founders salen de su cuenta en la web founders, la misma que lista la pestaña Usuarios. Abre una fila con el ojo para ver su cartera, sus operaciones, sus órdenes SEPA y su cuenta founders, o para escribirle un email."
      action={
        <div className="flex items-center gap-2">
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      {/* Outside QueryState: a failing or slow /users must not take away the controls
          that change what is being asked of it. */}
      <UserQueryPrompt
        scope={scope}
        sorting={sorting[0]}
        filters={filters}
        search={searchInput}
        onChange={handleQueryChange}
        onClearSearch={() => handleSearchChange("")}
        onReset={handleReset}
        isDefault={isDefaultQuery}
        result={{
          count: total,
          population: refined ? (sweep.data?.rows.length ?? null) : null,
          isLoading,
          isFetching,
          isError: Boolean(error),
        }}
      />

      {refined && sweep.data?.truncated && (
        <p className="mb-2 rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[11px] leading-[1.5] tracking-[-0.4px] text-amber-700">
          La lectura paró en {SWEEP_MAX_PAGES} páginas con {sweep.data.rows.length} usuarios: el
          filtro solo ve esos, así que puede faltar gente.
        </p>
      )}

      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-usuarios"
          searchPlaceholder="Busca por correo o usuario..."
          emptyLabel={
            refined
              ? "Nadie cumple todos los filtros. Quita alguno en la frase de arriba."
              : "Ningún usuario coincide con la búsqueda."
          }
          showRowCount={false}
          enableColumnToggle
          selectionActions={(selectedRows) => (
            <button
              type="button"
              onClick={() => handleCompose(selectedRows)}
              className="flex h-7.5 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#19363F] px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-[#0f2228]"
            >
              <MailIcon />
              Enviar email ({selectedRows.length})
            </button>
          )}
          getRowId={getRowId}
          enablePagination
          // Swept, the rows are every match and DataTable pages them itself. Sort and
          // search stay manual in both modes: the sweep already asked the server.
          manualPagination={!refined}
          manualSorting
          manualFiltering
          rowCount={refined ? undefined : total}
          hasNextPage={rows.length >= pagination.pageSize}
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

        <PanelNote className="mt-2">
          La búsqueda de /users mira correo y nombre de usuario; el dashboard original busca además
          por wallet, signer y handle. Correo, membresía, KYC y Safe no ordenan porque el endpoint
          no acepta esas columnas.{" "}
          {refined
            ? "Con un filtro puesto, /users no sabe filtrar por él, así que la tabla lee todos los usuarios de la búsqueda y filtra aquí: el recuento es exacto y la exportación baja todos los que cumplen, no solo esta página. Si marcas filas, exporta solo esas."
            : `La exportación baja la página que estás viendo, no ${
                total === null ? "la lista entera" : `las ${total} filas`
              } — sube a 200 por página si necesitas menos tiradas. Si marcas filas, exporta solo esas, y la selección vive dentro de la página: al cambiar de página el navegador ya no tiene esas filas, así que marca y exporta página a página.`}{" "}
          Con filas marcadas aparece «Enviar email», que abre el redactor de la pestaña Emails con
          esas filas como destinatarios — las mismas que exportaría — usando el correo de la web
          founders cuando Cerebro no tiene uno. «Con saldo» es más de $0,50, el mismo umbral que el
          embudo de activación de Sistema. «Inactivos» es el scope de /users, basado en la última
          actividad registrada, que no es lo mismo que no haber usado nunca el producto. Teléfono y
          Web founders se cruzan con la web founders por correo y, si no coincide, por wallet; «—»
          es que no tiene cuenta allí. No ordenan ni entran en la búsqueda ni en los filtros porque
          /users no los conoce.
        </PanelNote>
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
          width: `min(${mailing ? BULK_EMAIL_DRAWER_WIDTH : DETAIL_DRAWER_WIDTH}px, 100vw)`,
        }}
      >
        {mailing && (
          <BulkEmailDrawer
            key={mailing.id}
            emails={mailing.emails}
            selected={mailing.selected}
            missing={mailing.missing}
            onClose={handleClose}
          />
        )}
        {selected && (
          // Keyed on the user so switching rows remounts rather than reconciling —
          // the tabs, the transactions pager and every scroll position inside belong
          // to one account and none of them should carry over to the next.
          <UserDetailDrawer
            key={selected.privyId}
            user={selected}
            founder={selectedFounder}
            foundersStatus={foundersStatus}
            foundersError={founders.error}
            onClose={handleClose}
          />
        )}
      </div>
    </Panel>
  );
};

export default UsersTablePanel;
