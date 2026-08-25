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
