"use client";

import { cn } from "@/utils";

/**
 * Switches the treasury endpoints between the whitelist and everything they see
 * (`includeNonWhitelisted`). Off by default, like the API: the full mode brings in
 * dust and unknown tokens whose USD value is guesswork.
 *
 * @param {Object} props
 * @param {boolean} props.value
 * @param {(next: boolean) => void} props.onChange
 */
const WhitelistToggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    aria-pressed={value}
    className={cn(
      "shrink-0 rounded-lg border-[0.7px] px-2.5 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
      value
        ? "border-[#19363F] bg-[#19363F] text-white"
        : "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
    )}
  >
    {value ? "Modo completo" : "Solo lista blanca"}
  </button>
);

export default WhitelistToggle;
