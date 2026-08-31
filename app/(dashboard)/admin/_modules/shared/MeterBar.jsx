"use client";

import { cn } from "@/utils";
import { formatNumber } from "@/utils/format";

const FILL_TONES = {
  neutral: "bg-[#19363F]",
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  muted: "bg-[rgba(25,54,63,0.25)]",
};

/**
 * One labelled proportion — a row of "label … 800 (93%)" over a filled track.
 *
 * Sistema's counters are shares of a population, not free-standing figures: "800
 * users with TVL" only means something next to the 856 it is out of. A bar says
 * that at a glance where two tiles side by side leave the reader doing the
 * division. Used by the TVL coverage row and by each stage of the activation
 * funnel.
 *
 * Renders "—" and an empty track when `value` or `total` is missing, so a partial
 * API response degrades instead of drawing a bar at 0% that looks like real news.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {number | null | undefined} props.value
 * @param {number | null | undefined} props.total Denominator for the fill.
 * @param {"neutral" | "good" | "warning" | "muted"} [props.tone]
 * @param {React.ReactNode} [props.hint] Muted qualifier after the count.
 */
const MeterBar = ({ label, value, total, tone = "neutral", hint }) => {
  const hasValue = typeof value === "number" && Number.isFinite(value);
  const hasTotal = typeof total === "number" && Number.isFinite(total) && total > 0;
  const share = hasValue && hasTotal ? Math.min(100, (value / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
          {label}
        </span>
        <span className="flex items-baseline gap-1.5 font-inter text-[11px] tracking-[-0.44px]">
          <span className="font-semibold tabular-nums text-[#19363F]">
            {hasValue ? formatNumber(value) : "—"}
          </span>
          {hasValue && hasTotal && (
            <span className="tabular-nums text-[rgba(25,54,63,0.4)]">
              {share.toFixed(share < 10 ? 1 : 0)}%
            </span>
          )}
          {hint && <span className="text-[rgba(25,54,63,0.35)]">{hint}</span>}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            FILL_TONES[tone] ?? FILL_TONES.neutral
          )}
          style={{ width: `${share}%` }}
        />
      </div>
    </div>
  );
};

export default MeterBar;
