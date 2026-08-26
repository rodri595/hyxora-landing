/**
 * Window every Ingresos panel reports on. Kept in one place because the panels are
 * read side by side — a chart on 30 days next to a donut on 7 would be misread.
 */
export const REVENUE_DAYS = 30;

/**
 * `/fees/diagnostics` caps at 100 rows and has no pagination, so `FeeTaggingPanel`
 * asks for the maximum: if the response is row-level, every row it misses is a
 * tagging bucket the panel can't show. It says so under the table when it groups.
 */
export const DIAGNOSTICS_LIMIT = 100;

/** Line/area colour for revenue series. */
export const REVENUE_LINE = "#10B981";

/**
 * Rows per page on «Últimas comisiones de usuario». 10 is the API default and 100
 * its maximum; 25 matches the other tables.
 */
export const FEES_PAGE_SIZE = 25;
export const FEES_PAGE_SIZES = [10, 25, 50, 100];
