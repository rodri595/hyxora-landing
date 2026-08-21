import { toDayString } from "@/utils/format";

/**
 * `from` is required by every /pnl endpoint, so "Histórico" needs a date rather
 * than an absent bound. This is a floor, not a real start date: it predates the
 * project by years, which is the point — nothing gets excluded.
 */
export const HISTORIC_FROM = "2020-01-01";

/**
 * Preset windows. Each returns the inclusive { from, to } the /pnl endpoints take.
 */
export const QUICK_RANGES = [
  {
    id: "today",
    label: "Hoy",
    resolve: () => {
      const today = toDayString(new Date());
      return { from: today, to: today };
    },
  },
  { id: "7d", label: "7d", resolve: () => lastDays(7) },
  { id: "30d", label: "30d", resolve: () => lastDays(30) },
  { id: "90d", label: "90d", resolve: () => lastDays(90) },
  {
    id: "ytd",
    label: "Año actual",
    resolve: () => {
      const today = new Date();
      return { from: `${today.getFullYear()}-01-01`, to: toDayString(today) };
    },
  },
  {
    id: "all",
    label: "Histórico",
    resolve: () => ({ from: HISTORIC_FROM, to: toDayString(new Date()) }),
  },
];

/**
 * Inclusive window ending today. Local date parts, so a user west of UTC doesn't
 * ask for tomorrow.
 *
 * @param {number} days
 * @return {{ from: string, to: string }}
 */
function lastDays(days) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: toDayString(from), to: toDayString(to) };
}

/** Default window on first render — the chip the ported dashboard opens on. */
export const DEFAULT_RANGE_ID = "30d";

/** Green for money in, red for money out. Same pairing as the other tabs. */
export const REVENUE_COLOR = "#10B981";
export const COST_COLOR = "#F43F5E";

/**
 * Donut slice colours, in draw order. Blue leads because swap dominates both
 * breakdowns in every window we've seen.
 */
export const SLICE_COLORS = [
  "#2D68FF",
  "#F59E0B",
  "#D946EF",
  "#10B981",
  "#8B5CF6",
  "#0EA5A6",
  "#F43F5E",
  "#0F172A",
  "#64748B",
  "#EAB308",
  "#14B8A6",
];

/**
 * Daily bars stop being readable long before a year fits on screen, so the bucket
 * follows the window length. /pnl/daily accepts day | week | month.
 *
 * @param {string} from "YYYY-MM-DD"
 * @param {string} to "YYYY-MM-DD"
 * @return {"day" | "week" | "month"}
 */
export const bucketFor = (from, to) => {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "day";

  const days = Math.round((end - start) / 86_400_000) + 1;
  if (days <= 92) return "day";
  if (days <= 400) return "week";
  return "month";
};

/** The user dropdown is one page of /users, and 200 is that page's ceiling. */
export const USER_OPTIONS_LIMIT = 200;
