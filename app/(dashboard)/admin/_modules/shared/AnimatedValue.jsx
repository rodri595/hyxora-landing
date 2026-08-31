"use client";

import { usdDecimalsFor } from "@/utils/format";
import NumberFlow from "@number-flow/react";

/**
 * Counters for the admin's headline figures.
 *
 * Every one of these tiles is downstream of a filter or a refresh button, and a
 * number that swaps in place gives no sign it moved. Rolling the digits does —
 * which is also why these belong on the dozen or so figures the operator is
 * reading, and not on table cells: forty numbers animating at once is noise, not
 * feedback.
 *
 * The format objects mirror `utils/format.js` exactly, so a tile mid-flight and a
 * tile at rest never disagree about how many decimals a figure has. NumberFlow
 * honours `prefers-reduced-motion` on its own.
 */

const Fallback = ({ children }) => <span>{children}</span>;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {Object} props
 * @param {number | null | undefined} props.value
 * @param {number} [props.decimals] Fixed precision. Defaults to 2, like `formatUsd`.
 * @param {boolean} [props.precise] Pick decimals by magnitude, like `formatUsdPrecise`.
 * @param {boolean} [props.compact] "$1.2M" instead of "$1,234,567".
 * @param {string} [props.currency] ISO code — plan prices are EUR.
 * @param {string} [props.fallback]
 */
export const AnimatedMoney = ({
  value,
  decimals,
  precise = false,
  compact = false,
  currency = "USD",
  fallback = "—",
}) => {
  if (!isNumber(value)) return <Fallback>{fallback}</Fallback>;

  const digits = decimals ?? (precise ? usdDecimalsFor(value) : compact ? 1 : 2);

  return (
    <NumberFlow
      value={value}
      format={{
        style: "currency",
        currency,
        notation: compact ? "compact" : "standard",
        minimumFractionDigits: compact ? 0 : digits,
        maximumFractionDigits: digits,
      }}
    />
  );
};

/**
 * @param {Object} props
 * @param {number | null | undefined} props.value
 * @param {number} [props.decimals]
 * @param {string} [props.prefix]
 * @param {string} [props.suffix] Unit that rides along with the number, e.g. " SOL".
 * @param {string} [props.fallback]
 */
export const AnimatedCount = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  fallback = "—",
}) => {
  if (!isNumber(value)) return <Fallback>{fallback}</Fallback>;

  return (
    <NumberFlow
      value={value}
      prefix={prefix}
      suffix={suffix}
      format={{
        useGrouping: true,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }}
    />
  );
};
