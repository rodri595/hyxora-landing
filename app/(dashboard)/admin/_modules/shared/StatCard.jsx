"use client";

import { cn } from "@/utils";

const TONES = {
  neutral: "border-[rgba(25,54,63,0.08)] bg-white",
  good: "border-emerald-200 bg-emerald-50/60",
  warning: "border-amber-200 bg-amber-50/60",
  muted: "border-[rgba(25,54,63,0.06)] bg-[rgba(25,54,63,0.02)]",
};

const VALUE_TONES = {
  neutral: "text-[#19363F]",
  good: "text-emerald-700",
  warning: "text-amber-700",
  muted: "text-[rgba(25,54,63,0.35)]",
};

/**
 * Bucket tile used across the Sistema panels.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.value
 * @param {string} props.label
 * @param {"neutral" | "good" | "warning" | "muted"} [props.tone]
 * @param {React.ReactNode} [props.hint] Small line under the label.
 */
const StatCard = ({ value, label, tone = "neutral", hint }) => (
  <div
    className={cn(
      "flex flex-col gap-0.5 flex-1 min-w-[130px] rounded-lg border-[0.7px] px-3 py-2.5",
      TONES[tone] ?? TONES.neutral
    )}
  >
    <span
      className={cn(
        "font-inter text-[20px] font-semibold tabular-nums tracking-[-0.8px] leading-tight",
        VALUE_TONES[tone] ?? VALUE_TONES.neutral
      )}
    >
      {value}
    </span>
    <span className="font-inter text-[10px] leading-[1.4] tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
      {label}
    </span>
    {hint && (
      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
        {hint}
      </span>
    )}
  </div>
);

export default StatCard;
