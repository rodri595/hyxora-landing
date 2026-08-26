"use client";

import { cn } from "@/utils";
import { useRef } from "react";

/**
 * Recharts keeps the tooltip mounted and flips its wrapper to
 * `visibility: hidden` the instant the pointer leaves a bar, so a custom tooltip
 * that faded in vanishes on a hard cut. `wrapperStyle` is spread last in
 * recharts' own style object, which makes it the one place we can take that
 * decision back.
 *
 * Pass it to every `<Tooltip>` that renders a `TooltipSurface`, and nowhere else:
 * on its own it would leave a plain tooltip stuck on screen.
 */
/**
 * The z-index is what keeps a donut's tooltip on top of its own centre label: the
 * label is an absolutely-positioned sibling that comes *after* the chart in the
 * DOM, so at `z-index: auto` it paints over the tooltip that the pointer just
 * summoned. 30 clears the chart chrome without reaching the sticky header.
 */
export const tooltipWrapperStyle = { visibility: "visible", outline: "none", zIndex: 30 };

/**
 * Holds the last payload the chart was active with, so the card still has
 * something to draw while it fades out — recharts empties `payload` on the same
 * render that turns `active` off.
 *
 * @param {boolean} active
 * @param {unknown[]} [payload]
 * @param {unknown} [label]
 * @return {{ visible: boolean, payload: unknown[] | null, label: unknown }}
 */
export const useHeldTooltip = (active, payload, label) => {
  const held = useRef(null);
  const visible = Boolean(active && payload?.length);

  // Written during render on purpose: it's a cache of props we were just handed,
  // and an effect would land a frame late — one frame the fade-out spends blank.
  if (visible) held.current = { payload, label };

  return {
    visible,
    payload: held.current?.payload ?? null,
    label: held.current?.label,
  };
};

/**
 * The tooltip card itself. Fades and lifts on enter, reverses on leave.
 *
 * @param {Object} props
 * @param {boolean} props.visible
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const TooltipSurface = ({ visible, className, children }) => (
  <div
    // Faded out but still in the tree, so it has to be taken out of the a11y tree too.
    aria-hidden={!visible}
    className={cn(
      "rounded-xl border-[0.7px] border-[#E2E2E2] bg-white/90 px-3 py-2 shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15)] backdrop-blur-[15px]",
      "transition-[opacity,transform] duration-150 ease-out will-change-[opacity,transform] motion-reduce:transition-none",
      visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.97] translate-y-[3px]",
      className
    )}
  >
    {children}
  </div>
);
