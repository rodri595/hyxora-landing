"use client";

import CopyButton from "@/components/CopyButton";
import {
  cerebroOperationColor,
  cerebroOperationKey,
  cerebroOperationLabel,
} from "@/constants/cerebro";
import { cn } from "@/utils";
import { formatUsdPrecise } from "@/utils/format";

/**
 * The small pieces the four drawer tabs share. Each one exists because the same
 * thing is rendered in more than one tab and had to agree with itself — a KYC pill
 * in the header and in the identity block, a signed dollar figure in the margin
 * card and in the transactions table.
 */

/**
 * A labelled field with an optional copy button.
 *
 * `CopyButton` rather than a bespoke one: it already handles the copied state, the
 * toast and the haptic, and this drawer copies the same kinds of ids the rest of
 * the admin does.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} [props.children] Rendered instead of `value` when given.
 * @param {string | null} [props.value]
 * @param {string | null} [props.copy] Text to copy; the button appears only with one.
 * @param {boolean} [props.mono] For addresses and ids.
 * @param {React.ReactNode} [props.hint] Muted line underneath.
 * @param {string} [props.className]
 */
export const DetailField = ({ label, children, value, copy, mono, hint, className }) => (
  <div className={cn("flex min-w-0 flex-col gap-1", className)}>
    <span className="font-inter text-[9px] font-medium uppercase tracking-[0.5px] text-[rgba(25,54,63,0.4)]">
      {label}
    </span>

    <div className="flex min-w-0 items-center gap-1.5">
      {children ?? (
        <span
          className={cn(
            "min-w-0 truncate",
            mono
              ? "font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.75)]"
              : "font-inter text-[11px] tracking-[-0.44px] text-[#19363F]"
          )}
          title={value ?? undefined}
        >
          {value || "—"}
        </span>
      )}
      {copy && <CopyButton text={copy} />}
    </div>

    {hint && (
      <span className="font-inter text-[10px] leading-[1.4] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
        {hint}
      </span>
    )}
  </div>
);

const KYC_TONES = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEW: "bg-amber-50 text-amber-700 border-amber-200",
};

const KYC_DOTS = {
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  FAILED: "bg-red-500",
  PENDING: "bg-amber-500",
  IN_PROGRESS: "bg-amber-500",
  IN_REVIEW: "bg-amber-500",
  NEW: "bg-amber-500",
};

/**
 * KYC pill. Colours track what the operator can act on: green means the SEPA flows
 * are open, amber means somebody is waiting on a review, red means the user needs
 * telling.
 *
 * Hyxora does not normalise across KYC providers, so the value is whatever the
 * provider said — matched uppercase, and an unrecognised one still renders in
 * neutral rather than being hidden. `NOT_AVAILABLE`, which is most accounts, reads
 * as the muted "sin KYC" it is: nobody started the process, which is not a state
 * worth a colour.
 *
 * @param {Object} props
 * @param {string | null | undefined} props.status
 */
export const KycBadge = ({ status }) => {
  if (!status) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  const upper = String(status).toUpperCase();
  if (upper === "NOT_AVAILABLE" || upper === "NONE") {
    return (
      <span className="inline-flex items-center rounded-full border border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.03)] px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-[0.4px] text-[rgba(25,54,63,0.4)]">
        sin KYC
      </span>
    );
  }

  return (
    <span
      title="Estado de KYC del banco de Hyxora. APPROVED desbloquea las órdenes SEPA."
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
        KYC_TONES[upper] ??
          "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.04)] text-[rgba(25,54,63,0.55)]"
      )}
    >
      <span className={cn("size-1 rounded-full", KYC_DOTS[upper] ?? "bg-[rgba(25,54,63,0.3)]")} />
      {upper}
    </span>
  );
};

/**
 * Membership state. `active` is the only good outcome; everything else — cancelled,
 * expired, past_due — is worth an amber so a lapsed founder doesn't read as a
 * healthy one.
 *
 * @param {Object} props
 * @param {string | null | undefined} props.status
 */
export const MembershipBadge = ({ status }) => {
  if (!status) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  const active = String(status).toLowerCase() === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      <span className={cn("size-1 rounded-full", active ? "bg-emerald-500" : "bg-amber-500")} />
      {status}
    </span>
  );
};

/**
 * Founder NFT chip. The token ids sit in the tooltip rather than on the chip — a
 * user with six of them would push the plan column off the table.
 *
 * @param {Object} props
 * @param {number | null | undefined} props.balance
 * @param {string[]} [props.tokenIds]
 */
export const NftChip = ({ balance, tokenIds = [] }) => {
  if (!balance || balance <= 0) return null;

  const ids = Array.isArray(tokenIds) ? tokenIds : [];

  return (
    <span
      title={ids.length > 0 ? `Token IDs: ${ids.map((id) => `#${id}`).join(", ")}` : undefined}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-inter text-[9px] font-medium tracking-[-0.36px] text-amber-700"
    >
      ◆ {balance} NFT{balance > 1 ? "s" : ""}
    </span>
  );
};

/**
 * Operation pill for the transactions table.
 *
 * One table mixes the backend's `SWAP_QUOTE` labels with the tagger's `swap` ones —
 * `/users/{privyId}/transactions` coalesces three sources per row — so both the
 * label and the colour resolve through the shared helpers, and the same operation
 * gets the same pill whichever source named it.
 *
 * @param {Object} props
 * @param {string | null} props.operation
 */
export const OperationBadge = ({ operation }) => {
  if (!operation) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  const color = cerebroOperationColor(cerebroOperationKey(operation));

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.4px]"
      style={{ backgroundColor: `${color}14`, color }}
    >
      <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {cerebroOperationLabel(operation)}
    </span>
  );
};

const RAMP_TONES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

/**
 * Status pill for a SEPA order. Unknown statuses stay neutral rather than being
 * forced into one of the three buckets — the bank's vocabulary is not ours.
 *
 * @param {Object} props
 * @param {string | null} props.status
 */
export const RampStatusBadge = ({ status }) => {
  if (!status || status === "—") return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-1.5 py-0.5 font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
        RAMP_TONES[status.toLowerCase()] ??
          "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.04)] text-[rgba(25,54,63,0.55)]"
      )}
    >
      {status}
    </span>
  );
};

/**
 * A signed USD figure, green up and red down.
 *
 * Null renders "—" and **zero renders as a real, neutral $0.00**: on a margin or a
 * PnL, breaking exactly even is an answer, and collapsing it into the same dash as
 * "we don't know" would hide the difference. The table cells that genuinely mean
 * "nothing here" pass `dashZero`.
 *
 * @param {Object} props
 * @param {number | null | undefined} props.value
 * @param {boolean} [props.dashZero] Render 0 as "—" instead of "$0.00".
 * @param {string} [props.className]
 */
export const SignedUsd = ({ value, dashZero = false, className }) => {
  if (typeof value !== "number" || !Number.isFinite(value) || (dashZero && value === 0)) {
    return <span className={cn("text-[rgba(25,54,63,0.3)]", className)}>—</span>;
  }

  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        value > 0 ? "text-emerald-700" : value < 0 ? "text-red-600" : "text-[rgba(25,54,63,0.55)]",
        className
      )}
    >
      {value > 0 ? "+" : ""}
      {formatUsdPrecise(value)}
    </span>
  );
};

/**
 * Section heading inside a drawer tab, with an optional figure on the right.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.aside] Right-aligned; typically a total.
 */
export const SectionHeader = ({ title, subtitle, aside }) => (
  <div className="flex items-baseline justify-between gap-3">
    <div className="min-w-0">
      <h4 className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
        {title}
      </h4>
      {subtitle && (
        <p className="mt-0.5 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
          {subtitle}
        </p>
      )}
    </div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>
);

/**
 * The footnote that carries a caveat about the numbers above it. Every panel in
 * this drawer that shows a figure with a catch says so here rather than in a
 * tooltip — the caveats are the kind you want to read once, not hunt for.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const Footnote = ({ children }) => (
  <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
    {children}
  </p>
);

/**
 * Empty state for a section that has nothing to show — dashed rather than blank so
 * it reads as "we asked and there is nothing" rather than as a rendering gap.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const EmptyBlock = ({ children }) => (
  <div className="rounded-lg border border-dashed border-[rgba(25,54,63,0.12)] px-3 py-6 text-center font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
    {children}
  </div>
);
