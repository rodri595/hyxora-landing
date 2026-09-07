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
 * @param {object} [rest] – forwarded to the container. A caller that makes the strip
 *   scroll horizontally needs nothing extra: Lenis runs with `allowNestedScroll`, so
 *   it hands a sideways swipe to the strip and keeps vertical ones for the page.
 *   Do not reach for `data-lenis-prevent` here — it is unconditional, and on a strip
 *   that only overflows sideways it kills the page's vertical scroll under the cursor.
 */
const Tabs = ({ tabs, value, onChange, className, ...rest }) => (
  <div
    {...rest}
    className={cn(
      "flex shrink-0 border-b-[0.7px] border-[rgba(25,54,63,0.08)]  overflow-y-hidden",
      className
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
            : "border-transparent text-[rgba(25,54,63,0.45)] hover:text-[rgba(25,54,63,0.7)]"
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs;
