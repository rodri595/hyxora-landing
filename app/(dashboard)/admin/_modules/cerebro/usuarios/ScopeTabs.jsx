"use client";

import { cn } from "@/utils";

/**
 * Segmented control for the `scope` filter on `/users`.
 *
 * «Usuarios» sends no scope at all (every user); «Inactivos» sends
 * `scope=inactive`. The endpoint also accepts `scope=active` — not offered here
 * because the ported dashboard doesn't, and the count on the pager already tells
 * you how many rows the current filter matched.
 *
 * @param {Object} props
 * @param {"all" | "inactive"} props.value
 * @param {(next: "all" | "inactive") => void} props.onChange
 */
const ScopeTabs = ({ value, onChange }) => (
  <div className="flex shrink-0 items-center gap-0.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.03)] p-0.5">
    {[
      { id: "all", label: "Usuarios" },
      { id: "inactive", label: "Inactivos" },
    ].map((option) => (
      <button
        key={option.id}
        type="button"
        onClick={() => onChange(option.id)}
        aria-pressed={value === option.id}
        className={cn(
          "rounded-[7px] px-2.5 py-1 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
          value === option.id
            ? "bg-[#19363F] text-white"
            : "text-[rgba(25,54,63,0.55)] hover:text-[#19363F]"
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default ScopeTabs;
