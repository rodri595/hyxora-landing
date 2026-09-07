"use client";

import CopyButton from "@/components/CopyButton";
import Tabs from "@/components/Tabs";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetUserDetail } from "@/hooks/cerebro/useGetUserDetail";
import { useGetUserPnl } from "@/hooks/cerebro/useGetUserPnl";
import { useGetUserVaults } from "@/hooks/cerebro/useGetUserVaults";
import { formatUsd, shortenHash, timeAgo } from "@/utils/format";
import { useEffect, useMemo, useState } from "react";
import { RefreshButton } from "../../../shared/Panel";
import QueryState from "../../../shared/QueryState";
import { TX_PAGE_SIZE } from "../constants";
import CarteraTab from "./CarteraTab";
import ResumenTab from "./ResumenTab";
import SepaTab from "./SepaTab";
import TransaccionesTab from "./TransaccionesTab";
import {
  groupPositions,
  readFreeVsPaid,
  readMargin,
  readPnl,
  readTvl,
  readTxRows,
  readVaultPositions,
} from "./normalize";
import { KycBadge, NftChip } from "./parts";

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path
      d="M8.5 1.5l-7 7M1.5 1.5l7 7"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * The header identity line. Falls back through email → Privy handle → Twitter
 * handle → the tail of the DID, because an account can legitimately have none of
 * the first three: a Twitter login has no email, and a wallet-only signup has no
 * handle either.
 *
 * @param {Object} user
 * @return {string}
 */
const displayName = (user) =>
  user.email ||
  (user.username ? `@${user.username}` : null) ||
  (user.twitterUsername ? `@${user.twitterUsername}` : null) ||
  shortenHash(user.privyId, { lead: 12, tail: 6 });

/**
 * Per-user drawer: everything Cerebro knows about one account, in four tabs.
 *
 * Replaces the old dashboard's `/users/{privyId}` page. A drawer rather than a route
 * on purpose — the table is server-paginated and searched, and getting back to the
 * right page of the right query after a full navigation was the worst part of using
 * the old one. Closing this puts you back exactly where you were.
 *
 * ### Where the data comes from
 *
 * `/users/{privyId}` carries the portfolio, the margin, the ramp orders, the
 * free-vs-paid split and the first page of transactions. Three things sit outside
 * it and are fetched alongside:
 *
 * - **`/users/{privyId}/transactions`** pages on its own, so page two doesn't
 *   refetch the portfolio (see `TransaccionesTab`).
 * - **`/users/{privyId}/pnl`** and **`/vaults`** are the two endpoints admin.md
 *   lists as unwired, waiting for "when a detail view is built". This is it. They
 *   are the only source of what the *user* earned, as opposed to what we earned
 *   from them, and they are cached 4h upstream so they cost little.
 *
 * Each query renders its own state rather than sharing one gate: a `/pnl` outage
 * must not blank the identity block, the same reasoning that keeps «Margen de
 * subsidio» on two loaders in Sistema.
 *
 * @param {Object} props
 * @param {Object} props.user The `/users` row the drawer was opened from. Every field
 * on it is already correct, so the header and the identity block render instantly
 * and the detail request only fills in what the list row doesn't carry.
 * @param {() => void} props.onClose
 */
const UserDetailDrawer = ({ user, onClose }) => {
  const [tab, setTab] = useState("resumen");

  const detail = useGetUserDetail(user.privyId, { pageSize: TX_PAGE_SIZE });
  const pnl = useGetUserPnl(user.privyId);
  const vaults = useGetUserVaults(user.privyId);

  // A different user in the same drawer is a different subject, not a new state for
  // the current one — landing on somebody's SEPA tab because that is where you left
  // the last person reads as a bug.
  // biome-ignore lint/correctness/useExhaustiveDependencies: privyId is the reset trigger, not a value read here.
  useEffect(() => setTab("resumen"), [user.privyId]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const data = detail.data;

  // The list row is the base and the detail response overlays it: `/users` already
  // carries the handles, the plan and both addresses, while `solanaAddress`,
  // `membershipStartDate` and `membershipPaymentType` only exist on the user record
  // the detail endpoint embeds. Merging this way means the identity block is filled
  // in from the first paint and simply gains fields.
  const merged = useMemo(() => ({ ...user, ...(data?.user ?? {}) }), [user, data]);

  const tvl = useMemo(() => readTvl(data?.portfolio?.tvl), [data]);
  const margin = useMemo(() => readMargin(data?.portfolio?.margin), [data]);
  const freeVsPaid = useMemo(() => readFreeVsPaid(data?.freeVsPaid), [data]);
  const positions = useMemo(() => groupPositions(data?.portfolio?.positions), [data]);
  const initialTxRows = useMemo(() => readTxRows(data?.transactions), [data]);
  const readPnlData = useMemo(() => readPnl(pnl.data), [pnl.data]);
  const vaultPositions = useMemo(() => readVaultPositions(vaults.data), [vaults.data]);

  const txTotal = data?.transactions?.total ?? initialTxRows.length;
  const sepaCount = Array.isArray(data?.rampOrders) ? data.rampOrders.length : 0;

  const refetchAll = () => {
    detail.refetch();
    pnl.refetch();
    vaults.refetch();
  };

  const tabs = [
    { id: "resumen", label: "Resumen" },
    { id: "cartera", label: `Cartera${positions.count > 0 ? ` (${positions.count})` : ""}` },
    { id: "transacciones", label: `Transacciones${txTotal > 0 ? ` (${txTotal})` : ""}` },
    { id: "sepa", label: `SEPA${sepaCount > 0 ? ` (${sepaCount})` : ""}` },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="min-w-0 truncate font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
              {displayName(merged)}
            </p>
            {merged.email && <CopyButton text={merged.email} title="Copiar correo" />}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.55)]">
              {cerebroPlanLabel(merged.plan)}
            </span>
            <NftChip balance={merged.nftBalance} tokenIds={merged.nftTokenIds} />
            <KycBadge status={merged.kycStatus} />
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          {/* The headline balance stays in the header across all four tabs: it is
              the one figure you keep glancing back at while reading the others. */}
          <div className="hidden flex-col items-end sm:flex">
            <span className="font-inter text-[13px] font-semibold tabular-nums tracking-[-0.52px] text-[#19363F]">
              {tvl.totalUsd === null ? "—" : formatUsd(tvl.totalUsd, { decimals: 0 })}
            </span>
            <span className="font-inter text-[9px] uppercase tracking-[0.4px] text-[rgba(25,54,63,0.4)]">
              {tvl.refreshedAt ? timeAgo(tvl.refreshedAt) : "valor"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] transition-colors hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F]"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* The underline belongs to this row, not to the tab strip: the strip scrolls
          sideways and its own border would stop wherever the last label does, leaving
          the rule to end mid-air under the refresh button. */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[0.7px] border-[rgba(25,54,63,0.08)] px-4">
        {/* No data-lenis-prevent: the strip only overflows sideways, and Lenis'
            allowNestedScroll already hands it a horizontal swipe. The attribute is
            unconditional, so here it would kill the drawer's vertical scroll for as
            long as the pointer sat over the tabs. */}
        <Tabs
          tabs={tabs}
          value={tab}
          onChange={setTab}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain border-b-0"
        />
        {/* One button for all three queries: they describe one account, and
            refreshing the portfolio while leaving a stale PnL beside it would be
            worse than refreshing nothing. */}
        <RefreshButton
          onClick={refetchAll}
          isLoading={detail.isFetching || pnl.isFetching || vaults.isFetching}
        />
      </div>

      {/* One of the few places data-lenis-prevent is still right: this is a modal
          body over a backdrop, and swallowing the gesture entirely is the point —
          scrolling to the end of a user's transactions must not start scrolling the
          admin page behind the drawer. Everywhere that only wants a nested scroller
          to work, `allowNestedScroll` already handles it. */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" data-lenis-prevent>
        <QueryState isLoading={detail.isLoading} error={detail.error}>
          {tab === "resumen" && (
            <ResumenTab
              user={merged}
              tvl={tvl}
              margin={margin}
              freeVsPaid={freeVsPaid}
              positionCount={positions.count}
              pnlUsd={readPnlData?.totalPnlUsd ?? null}
            />
          )}

          {tab === "cartera" && (
            <CarteraTab
              positions={positions}
              pnl={readPnlData}
              vaultPositions={vaultPositions}
              isPnlLoading={pnl.isLoading}
              snapshotDate={tvl.date}
            />
          )}

          {tab === "transacciones" && (
            <TransaccionesTab
              privyId={user.privyId}
              initialRows={initialTxRows}
              initialTotal={txTotal}
            />
          )}

          {tab === "sepa" && <SepaTab orders={data?.rampOrders} />}
        </QueryState>
      </div>
    </div>
  );
};

export default UserDetailDrawer;
