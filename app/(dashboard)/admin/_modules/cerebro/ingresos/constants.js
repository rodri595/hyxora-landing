/**
 * Window every Ingresos panel reports on. Kept in one place because the panels are
 * read side by side — a chart on 30 days next to a donut on 7 would be misread.
 */
export const REVENUE_DAYS = 30;

/**
 * `/fees/diagnostics` caps at 100 rows and has no pagination, so `FeeTaggingPanel`
 * asks for the maximum: if the response is row-level, every row it misses is a
 * tagging bucket the panel can't show. It says so under the table when it groups.
 *
 * The old dashboard asked for 20 — top buckets, not rows — so 100 is a superset
 * either way.
 */
export const DIAGNOSTICS_LIMIT = 100;

/**
 * Ventanas que ofrece «Diagnóstico de etiquetado de operaciones».
 *
 * Same trap as `REVENUE_TOKEN_WINDOWS`, and it is the reason the panel was missing
 * rows: `earnings/page.tsx` calls `getOpTagDiagnostics({ limit: 20 })` with **no
 * `sinceDays`** — the query only adds a `block_timestamp >=` clause when one is
 * passed — so the old table is the whole ledger. Read at the tab's 30 días this
 * showed 6 buckets against the old table's 12, and every `hyxora`-sourced one was
 * gone: those tags come from the backend activity cache, and none of the rows it
 * tagged fall inside the last month.
 *
 * Cerebro always applies a window and caps it at 365, so a year is the default —
 * the closest this endpoint gets to the old table. The shorter options are what
 * makes the panel comparable with the 30 días ones above it.
 */
export const DIAGNOSTICS_WINDOWS = [30, 90, 365];
export const DIAGNOSTICS_DAYS = 365;

/** Line/area colour for revenue series. */
export const REVENUE_LINE = "#10B981";

/**
 * Rows per page on «Últimas comisiones de usuario». 10 is the API default and 100
 * its maximum; 25 matches the other tables.
 */
export const FEES_PAGE_SIZE = 25;
export const FEES_PAGE_SIZES = [10, 25, 50, 100];

/**
 * Ventanas que ofrece «Ingresos por cadena × token».
 *
 * The old dashboard called `getTreasuryByToken({ source: 'user-fees' })` with no
 * `sinceDays` at all — lifetime — and that is the table this panel was ported
 * from. Running it at the tab's `REVENUE_DAYS` silently dropped every (cadena,
 * token, operación) tuple whose last fee predates the window, which is what left
 * Base and BSC showing a handful of rows against the old dashboard's list.
 *
 * Cerebro always applies a window and caps it at 365, so 365 is the default here:
 * the closest thing to the old table the endpoint can answer. The shorter options
 * are what makes this panel comparable with the 30 días ones above it.
 */
export const REVENUE_TOKEN_WINDOWS = [30, 90, 365];
export const REVENUE_TOKEN_DAYS = 365;
