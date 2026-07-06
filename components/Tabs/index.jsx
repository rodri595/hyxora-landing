"use client";

import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";

/**
 * Underline-style tab bar.
 *
 * @param {Array<{ id: string, label: string }>} tabs
 * @param {string} value  – active tab id
 * @param {(id: string) => void} onChange
 * @param {string} [className] – extra classes for the container
 */
const Tabs = ({ tabs, value, onChange, className }) => (
  <div
    className={cn(
      "flex shrink-0 border-b-[0.7px] border-[rgba(25,54,63,0.08)]",
      className,
    )}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => {
          if (tab.id !== value) haptic("selection");
          onChange(tab.id);
        }}
        className={cn(
          "py-2.5 mr-4 font-inter text-[11px] font-medium tracking-[-0.44px] border-b-[1.5px] -mb-px transition-colors whitespace-nowrap",
          value === tab.id
            ? "border-[#19363F] text-[#19363F] "
            : "border-transparent text-[rgba(25,54,63,0.45)] hover:text-[rgba(25,54,63,0.7)]",
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs;
