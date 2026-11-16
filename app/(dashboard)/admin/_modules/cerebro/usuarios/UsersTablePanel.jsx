"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import { useGetAppUsers } from "@/hooks/appApi/useGetAppUsers";
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
import CrmExportDrawer, { CRM_EXPORT_DRAWER_WIDTH } from "./CrmExportDrawer";
import UserQueryPrompt from "./UserQueryPrompt";
import {
  INTERVALS,
  PAYMENT_TYPES,
  RENEWAL_WINDOW_DAYS,
  countryName,
  daysUntil,
  findAppUser,
  indexAppUsers,
  periodEnd,
  withAppFields,
} from "./appUsers";
import { DETAIL_DRAWER_WIDTH, GROWTH_DAYS, USER_PAGE_SIZE, USER_PAGE_SIZES } from "./constants";
import UserDetailDrawer from "./detail/UserDetailDrawer";
import { KycBadge, MembershipBadge, NftChip } from "./detail/parts";
import { findFounderUser, indexFounderUsers, withFounderFields } from "./founders";
import { matchesFilters, matchesSearch } from "./userQuery";

const DEFAULT_SORTING = [{ id: "tvl", desc: true }];
const NO_FILTERS = {};

/**
 * Out of the box the table shows the CRM export's default columns — name, email,
 * phone, country, plan, membership and its dates — with the membership badge
 * standing in for «Lead scoring», which is derived from it, plus «Última renovación»
 * so the client can check each renewal against its date. Everything else is one
 * tick away in the column menu.
 */
const DEFAULT_COLUMN_VISIBILITY = {
  privyId: false,
  membershipInterval: false,
  membershipPayment: false,
  kyc: false,
  founders: false,
  safe: false,
  signer: false,
  solana: false,
  tvl: false,
  fees: false,
  cost: false,
  net: false,
  created: false,
};

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

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2v8m0 0L5 7m3 3l3-3M2.5 11v1.5A1.5 1.5 0 004 14h8a1.5 1.5 0 001.5-1.5V11"
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
 * A field from app-api's `/admin/users` — name, country, the membership dates.
 * Same three-way miss as the founders cells: still loading and app-api down must
 * not read as "this user has no such value".
 *
 * @param {Object} props
 * @param {string | null | undefined} props.value Already formatted for display.
 * @param {Object} props.row
 * @param {"loading" | "error" | "ready"} props.status
 */
const AppCell = ({ value, row, status }) => {
  if (value) {
    return <span className="whitespace-nowrap text-[rgba(25,54,63,0.85)]">{value}</span>;
  }
  if (!row.appMatch && status === "loading") {
    return <span className="text-[rgba(25,54,63,0.5)]">…</span>;
  }
  if (!row.appMatch && status === "error") {
    return (
      <span
        className="whitespace-nowrap text-amber-700"
        title="/admin/users de app-api no respondió"
      >
        sin dato
      </span>
    );
  }
  return <span className="text-[rgba(25,54,63,0.5)]">—</span>;
};

const daysLabel = (days) => {
  if (days === 0) return "hoy";
  const n = Math.abs(days);
  const span = `${n} ${n === 1 ? "día" : "días"}`;
  return days > 0 ? `en ${span}` : `hace ${span}`;
};

/** A day with a second, smaller line under it — how far off it is, or what's odd about it. */
const DayCell = ({ day, note, tone = "muted", title }) => (
  <div className="flex flex-col gap-0.5" title={title}>
    <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.85)]">
      {formatDay(day)}
    </span>
    <span
      className={cn(
        "whitespace-nowrap font-inter text-[10px] tabular-nums tracking-[-0.4px]",
        tone === "bad"
          ? "text-red-600"
          : tone === "warning"
            ? "text-amber-700"
            : "text-[rgba(25,54,63,0.68)]"
      )}
    >
      {note}
    </span>
  </div>
);

const MANUAL_OVERDUE_TITLE =
  "Membresía manual: no se renueva sola. Pasada esta fecha la app ya la trata como caducada y le pide mejorar el plan, aunque el backend la siga marcando activa.";

/**
 * Column ids are the API's `sort` vocabulary, so a header click maps straight to
 * the query param with no lookup table in between. The columns the endpoint cannot
 * order by — everything but created, tvl, cost, fees, net and plan — say so with
 * `enableSorting: false` rather than offering an arrow that would silently reorder
 * nothing. The founders and app-api columns can't sort either: `/users` has never
 * heard of them, and ordering one page client-side would pass for ordering the table.
 *
 * @param {(user: Object) => void} onOpen
 * @param {"loading" | "error" | "ready"} foundersStatus
 * @param {"loading" | "error" | "ready"} appStatus
 */
const buildColumns = (onOpen, foundersStatus, appStatus) => [
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
    id: "name",
    header: "Nombre",
    enableSorting: false,
    accessorFn: (row) =>
      row.fullName || [row.firstName, row.lastName].filter(Boolean).join(" ") || row.founderName,
    cell: (info) => <AppCell value={info.getValue()} row={info.row.original} status={appStatus} />,
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
        {/* app-api's live plan, Cerebro's as the fallback; sorting stays Cerebro's. */}
        <span className="whitespace-nowrap text-[rgba(25,54,63,0.85)]">
          {info.row.original.planName ?? cerebroPlanLabel(info.getValue())}
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
    cell: (info) => <MembershipBadge status={info.getValue()} />,
  },
  {
    id: "trial",
    header: "Prueba",
    enableSorting: false,
    meta: { label: "Prueba gratuita" },
    // app-api's `isTrial` (#223). A trial is stored as manual + toCancel, so the badge
    // beside it says «cancelará»; this column is what tells it from a client leaving,
    // and the «Prueba gratuita» filter uses it to keep only paying members.
    accessorFn: (row) => row.isTrial,
    cell: (info) => {
      const value = info.getValue();
      if (value === true) {
        return (
          <span className="inline-flex items-center whitespace-nowrap rounded-[5px] border-[0.7px] border-blue-200 bg-blue-50 px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.36px] text-[#2D68FF]">
            Gratuita
          </span>
        );
      }
      if (value === false) {
        return <span className="text-[rgba(25,54,63,0.68)]">No</span>;
      }
      return <AppCell value={null} row={info.row.original} status={appStatus} />;
    },
  },
  {
    id: "membershipStart",
    header: "Inicio membresía",
    enableSorting: false,
    accessorFn: (row) => row.membershipStartDate,
    cell: (info) => (
      <AppCell
        value={info.getValue() && formatDay(info.getValue())}
        row={info.row.original}
        status={appStatus}
      />
    ),
  },
  {
    id: "membershipEnd",
    header: "Final membresía",
    enableSorting: false,
    // The renewal date, or the cancellation date for someone on their way out —
    // the same day the CRM export's «Final Membresía» carries.
    accessorFn: (row) => periodEnd(row),
    cell: (info) => {
      const row = info.row.original;
      // A founder holding the NFT has no end: its renew date is noise, so it isn't shown.
      if (row.membershipStatus === "founder") {
        return (
          <span
            className="whitespace-nowrap font-medium text-emerald-700"
            title="Tiene el NFT founder: el plan no caduca mientras lo conserve."
          >
            permanente
          </span>
        );
      }
      const end = info.getValue();
      const days = daysUntil(end);
      if (!end || days === null) {
        return <AppCell value={null} row={row} status={appStatus} />;
      }
      // A trial's end is its cancellation date: say it's the trial that ends.
      if (row.isTrial === true) {
        return (
          <DayCell
            day={end}
            note={
              days >= 0
                ? `fin de la prueba ${daysLabel(days)}`
                : `prueba terminó ${daysLabel(days)}`
            }
          />
        );
      }
      if (days >= 0) return <DayCell day={end} note={daysLabel(days)} />;

      // Passed. A manual membership has simply ended — the app already asks them to
      // upgrade — while a paid one missed its charge; the words say which.
      const manual = row.membershipPaymentType === "manual";
      return (
        <DayCell
          day={end}
          note={manual ? `caducó ${daysLabel(days)} · manual` : `vencida ${daysLabel(days)}`}
          tone="bad"
          title={
            manual ? MANUAL_OVERDUE_TITLE : "La fecha pasó y el backend no ha registrado el cobro."
          }
        />
      );
    },
  },
  {
    id: "membershipRenewed",
    header: "Última renovación",
    enableSorting: false,
    accessorFn: (row) => row.membershipLastRenewedAt,
    cell: (info) => {
      const row = info.row.original;
      const last = info.getValue();
      const days = daysUntil(last);

      if (last && days !== null) {
        // A "last" renewal dated ahead of today was seen on staging (2027-01-11):
        // either test data or a period start rather than a payment. Flag, don't hide.
        return days > 0 ? (
          <DayCell
            day={last}
            note="fecha futura"
            tone="warning"
            title="Una última renovación con fecha futura: revisar con backend."
          />
        ) : (
          <DayCell day={last} note={daysLabel(days)} />
        );
      }
      if (row.appMatch) {
        return (
          <span
            className="whitespace-nowrap text-[rgba(25,54,63,0.68)]"
            title="La app solo registra la renovación desde el 10/11/2026: un cobro anterior no aparece aquí."
          >
            sin registro
          </span>
        );
      }
      return <AppCell value={null} row={row} status={appStatus} />;
    },
  },
  {
    id: "membershipInterval",
    header: "Periodicidad",
    enableSorting: false,
    accessorFn: (row) => INTERVALS[row.membershipInterval] ?? null,
    cell: (info) => <AppCell value={info.getValue()} row={info.row.original} status={appStatus} />,
  },
  {
    id: "membershipPayment",
    header: "Forma de pago",
    enableSorting: false,
    accessorFn: (row) =>
      PAYMENT_TYPES[row.membershipPaymentType] ?? row.membershipPaymentType ?? null,
    cell: (info) => <AppCell value={info.getValue()} row={info.row.original} status={appStatus} />,
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
    id: "country",
    header: "País",
    enableSorting: false,
    accessorFn: (row) => countryName(row.country),
    cell: (info) => <AppCell value={info.getValue()} row={info.row.original} status={appStatus} />,
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
    // The EOA that signs for the Safe. Off by default — it is there to tick when a
    // search by wallet needs to show which address matched.
    id: "signer",
    accessorKey: "signerAddress",
    header: "Firmante (EOA)",
    enableSorting: false,
    meta: { label: "Firmante (EOA)" },
    cell: (info) => <IdCell value={info.getValue()} />,
  },
  {
    // From app-api's `solana`: Cerebro's /users never carries it.
    id: "solana",
    accessorKey: "solanaAddress",
    header: "Wallet Solana",
    enableSorting: false,
    meta: { label: "Wallet Solana" },
    cell: (info) =>
      info.getValue() ? (
        <IdCell value={info.getValue()} />
      ) : (
        <AppCell value={null} row={info.row.original} status={appStatus} />
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
 * column menu is on, and only the CRM columns start visible. Toggling a column is
 * per-session and per-browser, which is the right scope for "I am looking at
 * billing today".
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
  // …or the CRM export: `{ id, selectedIds }`, the ids being the ticked rows when it
  // was opened from the selection bar, null when opened from the panel header.
  const [exporting, setExporting] = useState(null);

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

  // Names, country and the live membership block — the CRM export's columns. One
  // request for every account, and the same cached query the export drawer reads.
  const app = useGetAppUsers();
  const appIndex = useMemo(() => indexAppUsers(app.data?.users), [app.data]);
  const appStatus = app.isError ? "error" : app.isPending ? "loading" : "ready";

  // A search is swept and matched here like a filter, never sent as `/users?search=`:
  // that one is fuzzy and returns nearly everyone for a full email (see
  // `matchesSearch`), and it can't see names, which only app-api carries.
  const searching = search.trim().length > 0;
  const refined = Object.keys(filters).length > 0 || searching;
  const serverQuery = {
    sort: sorting[0]?.id,
    dir: sorting[0]?.desc ? "desc" : "asc",
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
    setExporting(null);
    setSelected(user);
    setIsOpen(true);
  }, []);

  // Recipients are a snapshot of the selection at the click: the composer reads them
  // once, and `id` keys it so reopening with other rows ticked is a fresh email.
  const handleCompose = useCallback(
    (selectedRows) => {
      setSelected(null);
      setExporting(null);
      setMailing({ id: Date.now(), ...collectRecipients(selectedRows, founderIndex) });
      setIsOpen(true);
    },
    [founderIndex]
  );

  const handleExportCrm = useCallback((selectedRows) => {
    setSelected(null);
    setMailing(null);
    setExporting({
      id: Date.now(),
      selectedIds: Array.isArray(selectedRows) ? selectedRows.map((row) => row.privyId) : null,
    });
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
          onComplete: () => {
            setSelected(null);
            setMailing(null);
            setExporting(null);
          },
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  const columns = useMemo(
    () => buildColumns(handleOpen, foundersStatus, appStatus),
    [handleOpen, foundersStatus, appStatus]
  );
  // Joined before filtering: app-api's membership status replaces Cerebro's, and the
  // «membresía» filter has to read the same status the badge shows.
  const rows = useMemo(() => {
    const users = (refined ? (sweep.data?.rows ?? []) : (paged.data?.users ?? [])).map((user) =>
      withAppFields(appIndex, withFounderFields(founderIndex, user))
    );
    return refined
      ? users.filter((user) => matchesFilters(user, filters) && matchesSearch(user, search))
      : users;
  }, [refined, sweep.data, paged.data, filters, search, founderIndex, appIndex]);

  // Swept, every match is in hand and the count is just how many there are. Paged,
  // `totalUsers` is what the old page called this count, and a port may have kept it.
  // `unfiltered` stays about the /users query alone: prompt filters never reach it,
  // they switch the table to the sweep.
  const unfiltered = scope !== "inactive";
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
  // Same for app-api: the raw record feeds the drawer's «Ahora en la app» block, and
  // re-joining the row fills name, country and dates if the list landed after the click.
  const selectedApp = useMemo(() => findAppUser(appIndex, selected), [appIndex, selected]);
  const selectedUser = useMemo(
    () => (selected ? withAppFields(appIndex, selected) : null),
    [appIndex, selected]
  );

  return (
    <Panel
      title="Usuarios"
      description="Cada usuario con su plan, su estado de membresía y KYC, su TVL, lo que ha dejado en comisiones y lo que nos ha costado patrocinarle el gas. El margen es ingresos menos gastos, solo de ese usuario. Teléfono y Web founders salen de su cuenta en la web founders, la misma que lista la pestaña Usuarios. Nombre, país, las fechas de membresía, la periodicidad y la forma de pago salen de la lista de usuarios de la app, las mismas columnas que «Exportar para CRM». Abre una fila con el ojo para ver su cartera, sus operaciones, sus órdenes SEPA y su cuenta founders, o para escribirle un email."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCrm()}
            className="flex h-7.5 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#19363F] px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-[#0f2228]"
          >
            <DownloadIcon />
            Exportar para CRM
          </button>
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
          La lectura de usuarios se cortó con {sweep.data.rows.length} (tope de {SWEEP_MAX_PAGES}{" "}
          páginas o una página repetida): el filtro solo ve esos, así que puede faltar gente.
        </p>
      )}

      <QueryState isLoading={isLoading} error={error}>
        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-usuarios"
          searchPlaceholder="Busca por correo, nombre, teléfono o wallet..."
          emptyLabel={
            Object.keys(filters).length > 0
              ? "Nadie cumple todos los filtros. Quita alguno en la frase de arriba."
              : `Nadie coincide con «${search.trim()}».`
          }
          showRowCount={false}
          enableColumnToggle
          initialColumnVisibility={DEFAULT_COLUMN_VISIBILITY}
          selectionActions={(selectedRows) => (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCompose(selectedRows)}
                className="flex h-7.5 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#19363F] px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-white transition-colors hover:bg-[#0f2228]"
              >
                <MailIcon />
                Enviar email ({selectedRows.length})
              </button>
              <button
                type="button"
                onClick={() => handleExportCrm(selectedRows)}
                className="flex h-7.5 items-center gap-1.5 whitespace-nowrap rounded-lg border-[0.7px] border-[rgba(25,54,63,0.2)] bg-white px-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F] transition-colors hover:bg-[rgba(25,54,63,0.04)]"
              >
                <DownloadIcon />
                Exportar para CRM ({selectedRows.length})
              </button>
            </div>
          )}
          getRowId={getRowId}
          enablePagination
          // Swept, the rows are every match and DataTable pages them itself. Sort stays
          // manual in both modes — the sweep already asked the server — and so does the
          // search box: it is matched in `rows` above, not by DataTable.
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
          La búsqueda busca el texto exacto en correo, nombre, usuario, handle de X, teléfono, Privy
          ID y las tres wallets (Safe, firmante y Solana); las dos últimas son columnas ocultas en
          el menú de columnas. No usa la búsqueda de /users, que es aproximada y con un correo
          completo devuelve casi a todo el mundo. Correo, membresía, KYC y Safe no ordenan porque el
          endpoint no acepta esas columnas.{" "}
          {refined
            ? "Con una búsqueda o un filtro puesto, /users no sabe hacerlo por sí mismo, así que la tabla lee todos los usuarios y filtra aquí: el recuento es exacto y la exportación baja todos los que cumplen, no solo esta página. Si marcas filas, exporta solo esas."
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
          /users no los conoce. Lo mismo vale para nombre, país y las columnas de membresía —salvo
          el estado y la forma de pago, que sí tienen filtro—, que vienen de /admin/users de la app
          y se cruzan por Privy ID, correo o wallet: son el dato en vivo, así que el estado de
          membresía también sale de ahí cuando lo hay, y Cerebro solo cubre a quien la app no tiene.
          «Final membresía» es la próxima renovación, o el día que termina si va a cancelar. «Última
          renovación» solo se registra desde el 10/11/2026, así que «sin registro» no significa que
          no haya pagado nunca. Una membresía activa cuya renovación cae en los próximos{" "}
          {RENEWAL_WINDOW_DAYS} días sale «en renovación», y si la fecha ya pasó sin que el backend
          registre el cobro, «no renovado»: el backend la sigue dando por activa, así que lo
          deducimos de la fecha. Las altas manuales no se renuevan solas: en los últimos{" "}
          {RENEWAL_WINDOW_DAYS} días salen «caduca pronto», y pasada la fecha «caducada», porque la
          app ya les pide mejorar el plan aunque el backend siga diciendo activa. Un founder que
          conserva el NFT es «founder · permanente»: su plan no caduca y su fecha no se muestra; si
          transfiere el NFT, vuelve a contar la fecha. Pulsa «¿Qué significa cada filtro?» para ver
          cada estado explicado.
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
          width: `min(${
            mailing
              ? BULK_EMAIL_DRAWER_WIDTH
              : exporting
                ? CRM_EXPORT_DRAWER_WIDTH
                : DETAIL_DRAWER_WIDTH
          }px, 100vw)`,
        }}
      >
        {exporting && (
          <CrmExportDrawer
            key={exporting.id}
            founderIndex={founderIndex}
            foundersStatus={foundersStatus}
            tableQuery={{
              filters,
              search: search || undefined,
              scope: scope === "inactive" ? "inactive" : undefined,
            }}
            selectedIds={exporting.selectedIds}
            onClose={handleClose}
          />
        )}
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
            user={selectedUser}
            founder={selectedFounder}
            foundersStatus={foundersStatus}
            foundersError={founders.error}
            appUser={selectedApp}
            appStatus={appStatus}
            appError={app.error}
            onClose={handleClose}
          />
        )}
      </div>
    </Panel>
  );
};

export default UsersTablePanel;
