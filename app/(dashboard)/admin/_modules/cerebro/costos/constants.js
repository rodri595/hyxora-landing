/**
 * Window the headline cards, the daily chart and the per-chain table all report
 * on. Shared so the tab can't end up comparing a 30-day chart with a 7-day table.
 */
export const COST_DAYS = 30;

/**
 * Windows offered on «Por funcionalidad». 365 is the ceiling: `/costs/by-operation`
 * rejects a larger `days`, so the original dashboard's "Histórico" option has no
 * equivalent here — the panel says so.
 */
export const OPERATION_WINDOWS = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: 365, label: "Último año" },
];

/** USD floors offered on the expensive-ops table. 0 asks for every sponsored op. */
export const EXPENSIVE_THRESHOLDS = [
  { value: 0, label: "Todas" },
  { value: 0.1, label: "≥ $0.10" },
  { value: 0.5, label: "≥ $0.50" },
  { value: 1, label: "≥ $1.00" },
];

/** `/costs/expensive` caps at 200 rows and has no pagination of its own. */
export const EXPENSIVE_LIMIT = 200;

/** Line/area colour for cost series — red, to read against the green of Ingresos. */
export const COST_LINE = "#F43F5E";
