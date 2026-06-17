"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils";

/**
 * Checkbox — reusable square checkbox
 *
 * Custom-styled checkbox matching the app's data tables and forms. Supports
 * checked and indeterminate states, an optional label, and disabled state.
 * The native input stays in the DOM (visually hidden) for accessibility.
 *
 * Usage:
 *   <Checkbox checked={value} onChange={(e) => setValue(e.target.checked)} />
 *   <Checkbox checked={value} onChange={fn} label="Accept terms" />
 *   <Checkbox indeterminate checked={false} onChange={fn} />
 */
const Checkbox = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  children,
  className = "",
  boxClassName = "",
  labelClassName = "",
  checkedBoxClassName = "bg-[#19363F] border-[#19363F]",
  uncheckedBoxClassName = "bg-white border-[rgba(25,54,63,0.2)]",
  stopPropagation = false,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e) => {
    if (stopPropagation) e.stopPropagation();
    onChange?.(e);
  };

  const content = label ?? children;
  const isActive = checked || indeterminate;

  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-2 select-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      onKeyDown={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      <span
        className={cn(
          "size-3.5 rounded-[3px] border border-solid transition-all flex items-center justify-center shrink-0 pointer-events-none",
          isActive ? checkedBoxClassName : uncheckedBoxClassName,
          boxClassName,
        )}
      >
        {indeterminate && !checked ? (
          <svg
            width="8"
            height="2"
            viewBox="0 0 8 2"
            fill="none"
            aria-hidden="true"
          >
            <rect x="0" y="0.5" width="8" height="1" rx="0.5" fill="white" />
          </svg>
        ) : checked ? (
          <svg
            width="8"
            height="6"
            viewBox="0 0 8 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 3l2 2 4-4"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>

      {content != null && (
        <span
          className={cn(
            "font-inter text-[12px] font-medium leading-[18px] tracking-[-0.24px] text-[#19363f]",
            labelClassName,
          )}
        >
          {content}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
