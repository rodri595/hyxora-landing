/**
 * Window every Ingresos panel reports on. Kept in one place because the panels are
 * read side by side — a chart on 30 days next to a donut on 7 would be misread.
 */
export const REVENUE_DAYS = 30;

/**
 * `/fees/diagnostics` caps at 100 rows and has no pagination, so both diagnostics
 * panels ask for the same page and react-query serves them from one request.
 */
export const DIAGNOSTICS_LIMIT = 100;

/**
 * Donut / series colours, in the order categories are drawn. Blue leads because
 * swap dominates every window we've seen.
 */
export const REVENUE_COLORS = [
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

/** Line/area colour for revenue series. */
export const REVENUE_LINE = "#10B981";

/**
 * Rows per page on «Últimas comisiones de usuario». 10 is the API default and 100
 * its maximum; 25 matches the other tables.
 */
export const FEES_PAGE_SIZE = 25;
export const FEES_PAGE_SIZES = [10, 25, 50, 100];
