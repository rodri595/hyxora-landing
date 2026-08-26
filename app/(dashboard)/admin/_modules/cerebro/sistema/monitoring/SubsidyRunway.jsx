"use client";

import { cn } from "@/utils";
import { formatNumber, formatUsd, toDayString } from "@/utils/format";
import { useState } from "react";
import AddressLink from "../../../shared/AddressLink";
import { AnimatedCount, AnimatedMoney } from "../../../shared/AnimatedValue";

/**
 * Below this many days, a top-up stops being housekeeping and becomes the thing
 * to do today. Only a display threshold — the backend's own `low` flag is what
 * the panel treats as the alarm.
 */
const RUNWAY_WARNING_DAYS = 21;

/**
 * The deposit anchor is a date, not a moment — the time of day adds nothing and
 * pushes the hint onto a second line.
 *
 * @param {string | null | undefined} value
 * @return {string}
 */
const asOfDay = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : toDayString(date);
};

/** Same message QueryState would show, sized to fit a card's hint line. */
const ErrorHint = ({ error }) => (
  <span className="text-red-600">
    {error?.response?.status ? `${error.response.status} — ` : ""}
    {error?.message ?? "Error"}
  </span>
);

/**
 * Shell for the two balances. One number each, big, with everything that
 * qualifies it on the line underneath — the shape the old dashboard used, and
 * the reason it reads faster than the six stat tiles that replaced it here.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {React.ReactNode} [props.unit] Rides next to the value, smaller.
 * @param {React.ReactNode} props.hint
 * @param {boolean} [props.low] Tints the card and raises the RECARGAR flag.
 * @param {React.ReactNode} [props.children] Extra controls under the hint.
 */
const BalanceCard = ({ label, value, unit, hint, low = false, children }) => (
  <div
    className={cn(
      "flex flex-1 min-w-[240px] flex-col rounded-lg border-[0.7px] px-3.5 py-3",
      low ? "border-red-200 bg-red-50/60" : "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)]"
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
        {label}
      </span>
      {low && (
        <span className="rounded-full border border-red-200 bg-red-100/70 px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-[0.4px] text-red-700">
          Recargar
        </span>
      )}
    </div>

    <div
      className={cn(
        "mt-0.5 flex items-baseline gap-1.5 font-inter text-[22px] font-semibold tabular-nums leading-tight tracking-[-0.88px]",
        low ? "text-red-700" : "text-[#19363F]"
      )}
    >
      {value}
      {unit && (
        <span className="font-normal text-[13px] tracking-[-0.52px] text-[rgba(25,54,63,0.4)]">
          {unit}
        </span>
      )}
    </div>

    <div className="mt-1 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
      {hint}
    </div>

    {children}
  </div>
);

/**
 * The Solana half: the fee-payer wallet that pays SOL gas for xStock trades.
 * When it runs dry, xStock trading stops.
 *
 * Read live from our own `/api/monitoring/solana-funding`, which queries the RPC
 * on request, so it is true now rather than whenever a cron last ran.
 *
 * @param {Object} props
 * @param {{ data?: Object, error?: Error, isLoading?: boolean }} props.query
 */
const SolanaCard = ({ query }) => {
  const funding = query.data;

  if (query.error || query.isLoading || !funding) {
    return (
      <BalanceCard
        label="Fee-payer de Solana"
        value="—"
        hint={
          query.error ? (
            <ErrorHint error={query.error} />
          ) : query.isLoading ? (
            "Consultando el RPC…"
          ) : (
            "Sin datos. Requiere SOLANA_FEE_PAYER y SOLANA_RPC_URL."
          )
        }
      />
    );
  }

  const priced = typeof funding.valueUsd === "number";

  return (
    <BalanceCard
      label="Fee-payer de Solana"
      low={funding.low ?? false}
      value={<AnimatedCount value={funding.sol} decimals={4} />}
      unit="SOL"
      hint={
        <>
          {priced ? `${formatUsd(funding.valueUsd)} · ` : "Precio de SOL no disponible · "}
          mín {formatNumber(funding.minSol, { decimals: 2 })} SOL ·{" "}
          <AddressLink address={funding.address} className="align-middle" />
        </>
      }
    />
  );
};

/**
 * The Pimlico half: how much sponsorship credit is left and how long it lasts.
 *
 * This is the one figure on the panel that cannot be ours. Pimlico's API exposes
 * the configured limit and never the remaining credit, so it has to be derived
 * from a recorded deposit minus every sponsored op indexed since — and `/costs/*`
 * would undercount, dropping test accounts and retired chains that Pimlico still
 * bills for. `/system/monitoring` does that against the unfiltered ledger.
 *
 * So `balanceUsd` is a deposit on record at `asOf`, not a live balance. Recharge
 * the account without updating it and the margin walks to zero while the account
 * is full — which is what the re-anchor input is for: type what Pimlico's own
 * dashboard shows today and the margin is recomputed against the same burn rate.
 * It stays in this view; making it stick means updating the deposit in Cerebro.
 *
 * @param {Object} props
 * @param {{ data?: Object, error?: Error, isLoading?: boolean }} props.query
 */
const PimlicoCard = ({ query }) => {
  const [draft, setDraft] = useState("");
  const [anchor, setAnchor] = useState(null);

  const runway = query.data?.pimlicoRunway ?? null;

  if (query.error || query.isLoading || !runway) {
    return (
      <BalanceCard
        label="Margen de Pimlico (est.)"
        value="—"
        hint={
          query.error ? (
            <ErrorHint error={query.error} />
          ) : query.isLoading ? (
            "Consultando Cerebro…"
          ) : (
            "`/system/monitoring` no devolvió `pimlicoRunway`. Suele significar que no hay depósito registrado en el backend contra el que descontar el gasto."
          )
        }
      />
    );
  }

  const burnPerDay = runway.burnPerDay ?? 0;
  const remaining = anchor ?? runway.remaining;
  const daysLeft = anchor === null ? runway.daysLeft : burnPerDay > 0 ? anchor / burnPerDay : null;
  const low = anchor === null ? (runway.low ?? false) : anchor < runway.minUsd;
  const short = low || (typeof daysLeft === "number" && daysLeft < RUNWAY_WARNING_DAYS);

  const parsed = Number(draft.replace(",", "."));
  const canApply = draft.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;

  const apply = (event) => {
    event.preventDefault();
    if (canApply) setAnchor(parsed);
  };

  return (
    <BalanceCard
      label="Margen de Pimlico (est.)"
      low={short}
      value={<AnimatedMoney value={remaining} decimals={2} />}
      unit={
        typeof daysLeft === "number"
          ? `~${formatNumber(Math.round(daysLeft))} días`
          : "sin consumo registrado"
      }
      hint={
        anchor === null ? (
          <>
            {formatUsd(runway.balanceUsd)} depositado −{" "}
            {formatUsd(runway.spentSince, { decimals: 3 })} gastado desde {asOfDay(runway.asOf)} ·{" "}
            {formatUsd(burnPerDay, { decimals: 3 })}/día
          </>
        ) : (
          <>
            Recalculado sobre {formatUsd(anchor)} a {formatUsd(burnPerDay, { decimals: 3 })}/día.
            Solo en esta vista — para que persista hay que actualizar el depósito en el backend.
          </>
        )
      }
    >
      <form onSubmit={apply} className="mt-2 flex flex-wrap items-center gap-1.5">
        <label
          htmlFor="pimlico-balance"
          className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]"
        >
          Saldo real hoy
        </label>
        <div className="flex items-center rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white pl-2">
          <span className="font-inter text-[11px] text-[rgba(25,54,63,0.35)]">$</span>
          <input
            id="pimlico-balance"
            inputMode="decimal"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={formatNumber(runway.balanceUsd, { decimals: 2 })}
            className="w-[76px] bg-transparent px-1 py-1 font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[#19363F] outline-none placeholder:text-[rgba(25,54,63,0.3)]"
          />
        </div>
        <button
          type="submit"
          disabled={!canApply}
          className={cn(
            "rounded-lg border-[0.7px] px-2 py-1 font-inter text-[10px] font-medium tracking-[-0.4px] transition-colors",
            canApply
              ? "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
              : "border-[rgba(25,54,63,0.08)] text-[rgba(25,54,63,0.3)] cursor-not-allowed"
          )}
        >
          Recalcular
        </button>
        {anchor !== null && (
          <button
            type="button"
            onClick={() => {
              setAnchor(null);
              setDraft("");
            }}
            className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)] underline underline-offset-2 hover:text-[#19363F]"
          >
            Volver al depósito
          </button>
        )}
      </form>
    </BalanceCard>
  );
};

/**
 * Sponsorship runway — how much longer we can keep paying users' gas.
 *
 * Two independent balances, and both have to hold: Solana's fee-payer for xStock
 * trading, Pimlico's credit for everything on EVM. They come from two different
 * APIs — see each card — so each renders its own loading and error state rather
 * than sharing one gate: a Cerebro outage must not blank a live SOL balance.
 *
 * @param {Object} props
 * @param {Object} props.fundingQuery Result of `useGetSolanaFunding`.
 * @param {Object} props.monitoringQuery Result of `useGetSystemMonitoring`.
 */
const SubsidyRunway = ({ fundingQuery, monitoringQuery }) => (
  <div className="flex flex-wrap gap-2">
    <SolanaCard query={fundingQuery} />
    <PimlicoCard query={monitoringQuery} />
  </div>
);

export default SubsidyRunway;
