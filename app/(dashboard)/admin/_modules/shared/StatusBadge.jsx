"use client";

import { cn } from "@/utils";

/**
 * Active / inactive pill used across the Planes tables.
 *
 * @param {Object} props
 * @param {boolean} props.active
 * @param {string} [props.activeLabel]
 * @param {string} [props.inactiveLabel]
 */
const StatusBadge = ({ active, activeLabel = "ACTIVO", inactiveLabel = "INACTIVO" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
      active
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-[rgba(25,54,63,0.05)] text-[rgba(25,54,63,0.4)] border border-[rgba(25,54,63,0.08)]"
    )}
  >
    <span
      className={cn("size-1 rounded-full", active ? "bg-emerald-500" : "bg-[rgba(25,54,63,0.3)]")}
    />
    {active ? activeLabel : inactiveLabel}
  </span>
);

export default StatusBadge;
