/**
 * Formatting helpers shared by the Cerebro dashboard tabs.
 */

/**
 * @param {number | null | undefined} value
 * @param {Object} [options]
 * @param {boolean} [options.compact] Render as "$1.2M" instead of "$1,234,567.00".
 * @param {number} [options.decimals] Force a fixed number of decimals. Gas costs and
 * fees need 3 to stay legible at sub-cent amounts; TVL columns use 0.
 * @param {string} [options.fallback] Shown when value isn't a finite number.
 * @return {string}
 */
export const formatUsd = (value, options = {}) => formatMoney(value, "USD", options);

/**
 * Same as formatUsd but for any currency — plan prices come back in EUR for the
 * paid tiers and USD for staff.
 *
 * @param {number | null | undefined} value
 * @param {string} [currency] ISO code, e.g. "EUR".
 * @param {Object} [options] Same options as formatUsd.
 * @return {string}
 */
export const formatMoney = (value, currency = "USD", options = {}) => {
  const { compact = false, decimals, fallback = "—" } = options;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: decimals ?? (compact ? 1 : 2),
    minimumFractionDigits: decimals ?? (compact ? 0 : 2),
  }).format(value);
};

/**
 * @param {number | null | undefined} value Already a percentage (0.9 → "0.90%").
 * @param {Object} [options]
 * @param {number} [options.decimals]
 * @param {string} [options.fallback]
 * @return {string}
 */
export const formatPercent = (value, options = {}) => {
  const { decimals = 2, fallback = "—" } = options;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return `${value.toFixed(decimals)}%`;
};

/**
 * @param {number | null | undefined} value
 * @param {Object} [options]
 * @param {number} [options.decimals]
 * @param {string} [options.fallback]
 * @return {string}
 */
export const formatNumber = (value, options = {}) => {
  const { decimals = 0, fallback = "—" } = options;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
};

/**
 * Hours elapsed since a timestamp, or null when it can't be parsed.
 * @param {string | number | Date | null | undefined} value
 * @return {number | null}
 */
export const hoursSince = (value) => {
  if (!value) return null;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return (Date.now() - ts) / 3_600_000;
};

/**
 * Short Spanish relative time — "ahora", "hace 12 min", "hace 5h", "hace 3d".
 * @param {string | number | Date | null | undefined} value
 * @return {string}
 */
export const timeAgo = (value) => {
  const hours = hoursSince(value);
  if (hours === null) return "—";

  const minutes = Math.floor(hours * 60);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${Math.floor(hours)}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

const pad = (value) => String(value).padStart(2, "0");

/**
 * Calendar day in the "YYYY-MM-DD" shape Cerebro's `from`/`to` filters expect.
 * Built from local date parts, not `toISOString()`, so a user west of UTC doesn't
 * ask for tomorrow.
 *
 * @param {Date} date
 * @return {string}
 */
export const toDayString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * Inclusive window ending today, for the endpoints that require both bounds
 * (`/pnl/daily`, `/pnl/operations`, `/pnl/membership`).
 *
 * @param {number} days How many days the window covers, today included.
 * @return {{ from: string, to: string }}
 */
export const lastNDays = (days) => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: toDayString(from), to: toDayString(to) };
};

/**
 * "2026-08-19 01:26" — local time, sortable, no locale surprises.
 *
 * @param {string | number | Date | null | undefined} value
 * @param {string} [fallback]
 * @return {string}
 */
export const formatDateTime = (value, fallback = "—") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return `${toDayString(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Middle-truncated hash or address — "0x8190bc…3f8e" — for table cells.
 *
 * @param {string | null | undefined} value
 * @param {Object} [options]
 * @param {number} [options.lead]
 * @param {number} [options.tail]
 * @return {string}
 */
export const shortenHash = (value, options = {}) => {
  const { lead = 6, tail = 4 } = options;
  if (typeof value !== "string" || value.length <= lead + tail + 1) return value ?? "—";
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
};

/**
 * Precision-adaptive USD, for tooltips and legends where a fixed precision is
 * always wrong for something: per-tx gas on Base is well under a cent, while a
 * day's swap fees run to tens of dollars. Two decimals hides the first as
 * "$0.00"; four pads the second into "$29.4500".
 *
 *   ≥ $1000 → $1,234        ≥ $0.01 → $0.0123
 *   ≥ $1    → $12.34        < $0.01 → $0.000123
 *
 * @param {number | null | undefined} value
 * @param {string} [fallback]
 * @return {string}
 */
export const formatUsdPrecise = (value, fallback = "—") => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return formatUsd(value, { decimals: usdDecimalsFor(value) });
};

/**
 * The decimal count `formatUsdPrecise` would pick. Exported so an animated
 * counter can hand the same choice to `Intl.NumberFormat` and land on a string
 * identical to the static one.
 *
 * @param {number} value
 * @return {number}
 */
export const usdDecimalsFor = (value) => {
  const size = Math.abs(value);
  if (size >= 1000) return 0;
  if (size >= 1 || size === 0) return 2;
  if (size >= 0.01) return 4;
  return 6;
};

/**
 * USD sized for a chart axis: trailing zeros dropped so a tick reads "$1.5"
 * rather than "$1.5000", and compact past a thousand so the labels don't crowd.
 *
 * A fixed 0-decimal axis collapses to five identical "$0" ticks the moment a
 * filter narrows the window to sub-dollar amounts, which is exactly when the
 * shape of the chart matters most.
 *
 * @param {number | null | undefined} value
 * @return {string}
 */
export const formatUsdAxis = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "$0";
  if (value === 0) return "$0";

  const size = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (size >= 1000) {
    return `${sign}$${new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(size)}`;
  }

  if (size >= 1) {
    return `${sign}$${Number.isInteger(size) ? size.toFixed(0) : stripTrailingZeros(size.toFixed(2))}`;
  }

  // Smallest cent unit that still shows a significant digit, so dust on a cheap
  // chain surfaces as nonzero instead of rounding away.
  for (const decimals of [2, 4, 6]) {
    const fixed = size.toFixed(decimals);
    if (Number(fixed) > 0) return `${sign}$${stripTrailingZeros(fixed)}`;
  }
  return `${sign}$${size.toFixed(6)}`;
};

const stripTrailingZeros = (value) =>
  value.includes(".") ? value.replace(/0+$/, "").replace(/\.$/, "") : value;
