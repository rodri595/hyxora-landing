"use client";

import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./shared";

gsap.registerPlugin(useGSAP);

/**
 * The iOS-style pill: the indicator is one element that slides between options
 * rather than a background per button, so switching reads as one object moving.
 *
 * It is measured from the DOM instead of being sized by CSS because the options
 * are label-width — «Mi balance» is not «Todos» — and a percentage indicator
 * would sit wrong on every strip that isn't evenly split.
 */
const TONES = {
  dark: {
    track: "bg-[rgba(25,54,63,0.05)]",
    indicator: "bg-[#19363F]",
    active: "text-white",
    idle: "text-[rgba(25,54,63,0.5)] hover:text-[rgba(25,54,63,0.8)]",
  },
  light: {
    track: "bg-[rgba(25,54,63,0.05)]",
    indicator: "bg-white shadow-[0px_1px_4px_0px_rgba(25,54,63,0.12)]",
    active: "text-[#19363F]",
    idle: "text-[rgba(25,54,63,0.5)] hover:text-[rgba(25,54,63,0.8)]",
  },
};

const SegmentedControl = ({ options, value, onChange, tone = "dark", className }) => {
  const rootRef = useRef(null);
  const indicatorRef = useRef(null);
  const placed = useRef(false);
  const styles = TONES[tone] ?? TONES.dark;

  const place = useCallback((animate) => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;
    const active = root?.querySelector("[data-seg-active='true']");
    if (!root || !indicator || !active) return;

    const vars = { x: active.offsetLeft, width: active.offsetWidth };
    if (animate && !prefersReducedMotion()) {
      gsap.to(indicator, { ...vars, duration: 0.34, ease: "power3.out", overwrite: true });
    } else {
      gsap.set(indicator, vars);
    }
  }, []);

  useGSAP(
    () => {
      place(placed.current);
      placed.current = true;
    },
    { dependencies: [value, options.length] }
  );

  // El ancho de las etiquetas cambia con el viewport; el indicador se recoloca
  // sin animar porque no hubo gesto que animar.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => place(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, [place]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "squircle relative flex shrink-0 items-center gap-1 rounded-[100px] p-1",
        styles.track,
        className
      )}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className={cn(
          "squircle pointer-events-none absolute left-0 top-1 bottom-1 rounded-[100px]",
          styles.indicator
        )}
      />
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            data-seg-active={isActive}
            onClick={() => {
              if (!isActive) haptic("selection");
              onChange(option.id);
            }}
            className={cn(
              "relative z-[1] whitespace-nowrap rounded-[100px] px-3.5 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors duration-200",
              isActive ? styles.active : styles.idle
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
