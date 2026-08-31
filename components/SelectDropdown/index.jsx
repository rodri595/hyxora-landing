"use client";

import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";
import { useState } from "react";

const ChevronIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2 5l2.5 2.5L8 3"
      stroke="#19363F"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * SelectDropdown — styled dropdown matching the DataTable dropdown aesthetic.
 *
 * @param {string}   value       - Currently selected value
 * @param {Function} onChange    - Called with the new value when an option is selected
 * @param {Array}    options     - [{ value: string, label: string }]
 * @param {string}   className   - Extra classes on the root wrapper
 * @param {string}   ariaLabel   - Accessible name, for controls with no visible label
 * @param {string}   placeholder - Shown when nothing matches `value`
 * @param {boolean}  dropUp      - Open above the trigger. For controls near the bottom
 *                                 of a scroll container, where a downward panel clips.
 */
const SelectDropdown = ({
  value,
  onChange,
  options = [],
  className,
  ariaLabel,
  placeholder = "—",
  dropUp = false,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative w-full", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => {
          haptic("selection");
          setOpen((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-2 h-8 px-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] bg-white font-inter text-[12px] tracking-[-0.48px] text-[#19363F] hover:border-[rgba(25,54,63,0.3)] transition-colors cursor-pointer"
      >
        {/* min-w-0 + truncate: option labels can be full email addresses, which
            would otherwise push the chevron out of the button */}
        <span className="min-w-0 truncate text-left">{selected?.label ?? placeholder}</span>
        <span
          className={cn(
            "text-[rgba(25,54,63,0.5)] transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        >
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-10"
            role="button"
            tabIndex={-1}
            aria-label="Close"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          {/* Dropdown panel. max-h + scroll because some lists are long — the
              Cerebro user filter renders up to 200 options and would otherwise
              run off the bottom of the viewport with no way to reach the end.
              data-lenis-prevent so that inner scroll actually works: Lenis owns
              wheel and touch on the document and would otherwise swallow both. */}
          <div
            data-lenis-prevent
            className={cn(
              "absolute left-0 right-0 z-20 max-h-70 overflow-y-auto overscroll-contain bg-white border-[0.7px] border-[rgba(25,54,63,0.08)] rounded-[10px] shadow-[0px_4px_16px_0px_rgba(25,54,63,0.1)] p-1",
              dropUp ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"
            )}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  haptic("selection");
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] hover:bg-[rgba(25,54,63,0.04)] font-inter font-medium text-[11px] tracking-[-0.44px] text-[#19363F] transition-colors text-left",
                  opt.value === value && "bg-[rgba(25,54,63,0.03)]"
                )}
              >
                <span className="min-w-0 truncate">{opt.label}</span>
                {opt.value === value && (
                  <span className="ml-auto shrink-0">
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SelectDropdown;
