"use client";

import { cn } from "@/utils";
import { formatPercent } from "@/utils/format";
import { useMemo, useState } from "react";

/**
 * Categorical palette for "share of a total" charts.
 *
 * Same hues as `resumen/constants.js`'s operation colours and in the same order, so
 * a token bar and an operation donut on adjacent tabs don't read as two different
 * design systems. Kept separate rather than imported because that map is keyed by
 * operation name — this one is positional, and the two lists are free to drift.
 */
export const SERIES_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#F43F5E",
  "#06B6D4",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#0EA5E9",
];

const REST_COLOR = "rgba(25,54,63,0.22)";

/**
 * One stacked horizontal bar: how a total splits across its largest contributors.
 *
 * These tabs answer concentration questions — is the TVL one token or twenty, is
 * the revenue three users or three hundred — and a sorted table makes you read
 * every row and do the division. A single bar answers it before you read anything,
 * and the table underneath still holds the exact figures.
 *
 * Everything past `limit` folds into one muted «Resto» segment rather than being
 * dropped, so the bar always adds up to the total it claims to show.
 *
 * **Positive magnitudes only.** Non-finite and non-positive values are filtered
 * out: a stacked share bar cannot represent a negative, and a margin that swings
 * either way needs a diverging chart, not this. `dropped` in the footnote says how
 * many rows that removed, so a filtered row is never silently gone.
 *
 * @param {Object} props
 * @param {{ label: string, value: number, hint?: React.ReactNode, color?: string }[]} props.items
 * @param {number} [props.limit] Segments before the rest fold. Default 8.
 * @param {number} [props.total] Denominator. Defaults to the sum of `items`; pass it
 *   when the bar shows the head of a longer list and you know the real total.
 * @param {(value: number) => string} props.formatValue
 * @param {string} [props.restLabel]
 * @param {string} [props.emptyLabel]
 * @param {React.ReactNode} [props.footnote] Rendered under the legend.
 * @param {string} [props.ariaLabel] Names the bar for a screen reader.
 * @param {string} [props.className]
 */
const CompositionBar = ({
  items = [],
  limit = 8,
  total,
  formatValue,
  restLabel = "Resto",
  emptyLabel = "Sin datos para repartir.",
  footnote,
  ariaLabel,
  className,
}) => {
  const [active, setActive] = useState(null);

  const { segments, denominator, dropped } = useMemo(() => {
    const usable = items.filter((item) => Number.isFinite(item.value) && item.value > 0);
    const sorted = [...usable].sort((a, b) => b.value - a.value);
    const sum = sorted.reduce((acc, item) => acc + item.value, 0);
    // An explicit total below the sum would draw segments past 100%; the sum is the
    // only denominator the bar can actually honour, so it wins.
    const denom = Number.isFinite(total) && total > sum ? total : sum;

    const head = sorted.slice(0, limit).map((item, index) => ({
      ...item,
      key: `${item.label}-${index}`,
      color: item.color ?? SERIES_COLORS[index % SERIES_COLORS.length],
    }));

    const tail = sorted.slice(limit).reduce((acc, item) => acc + item.value, 0);
    const rest = denom - head.reduce((acc, item) => acc + item.value, 0);
    const restValue = Math.max(tail, rest);

    // Relative epsilon, not `> 0`: when every item fits inside `limit`, summing the
    // head back out of the total leaves float noise (~1e-12 on a six-figure TVL),
    // and that would draw a «Resto» segment for a remainder that does not exist.
    const hasRest = restValue > denom * 1e-9;

    return {
      segments: hasRest
        ? [
            ...head,
            {
              key: "__rest__",
              label: restLabel,
              value: restValue,
              color: REST_COLOR,
              isRest: true,
            },
          ]
        : head,
      denominator: denom,
      dropped: items.length - usable.length,
    };
  }, [items, limit, total, restLabel]);

  if (segments.length === 0 || denominator <= 0) {
    return (
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)] py-2">
        {emptyLabel}
      </p>
    );
  }

  const shareOf = (value) => (value / denominator) * 100;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {/* min-w on each segment so a 0.1% slice is still a visible sliver rather
          than a sub-pixel gap between its neighbours. */}
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-3 w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]"
        onMouseLeave={() => setActive(null)}
      >
        {segments.map((segment) => (
          <div
            key={segment.key}
            title={`${segment.label} — ${formatValue(segment.value)} (${formatPercent(
              shareOf(segment.value),
              { decimals: 1 }
            )})`}
            onMouseEnter={() => setActive(segment.key)}
            style={{
              width: `${shareOf(segment.value)}%`,
              background: segment.color,
            }}
            className={cn(
              "h-full min-w-[2px] transition-opacity duration-150",
              active && active !== segment.key ? "opacity-30" : "opacity-100"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <div
            key={segment.key}
            onMouseEnter={() => setActive(segment.key)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "flex min-w-0 items-baseline gap-1.5 rounded px-1 py-0.5 -mx-1 transition-colors",
              active === segment.key && "bg-[rgba(25,54,63,0.04)]"
            )}
          >
            <span
              className="size-[7px] shrink-0 translate-y-[-1px] rounded-full"
              style={{ background: segment.color }}
            />
            <span
              className={cn(
                "truncate font-inter text-[11px] tracking-[-0.44px]",
                segment.isRest ? "text-[rgba(25,54,63,0.45)]" : "text-[rgba(25,54,63,0.7)]"
              )}
              title={segment.label}
            >
              {segment.label}
            </span>
            <span className="ml-auto shrink-0 font-inter text-[11px] font-medium tabular-nums tracking-[-0.44px] text-[#19363F]">
              {formatValue(segment.value)}
            </span>
            <span className="shrink-0 font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.4)] w-9 text-right">
              {formatPercent(shareOf(segment.value), { decimals: 1 })}
            </span>
          </div>
        ))}
      </div>

      {(footnote || dropped > 0) && (
        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          {footnote}
          {dropped > 0 && (
            <>
              {footnote ? " " : ""}
              {dropped === 1
                ? "Se omitió 1 fila sin valor positivo."
                : `Se omitieron ${dropped} filas sin valor positivo.`}
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default CompositionBar;
