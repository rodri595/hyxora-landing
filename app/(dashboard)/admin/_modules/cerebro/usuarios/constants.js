/** Window the growth chart covers. `/users/stats` accepts up to 365 days. */
export const GROWTH_DAYS = 90;

/** Short window quoted next to the headline count ("+41 últimos 30d"). */
export const RECENT_DAYS = 30;

/** Rows per page. 50 is the API default; 200 is its maximum. */
export const USER_PAGE_SIZE = 50;
export const USER_PAGE_SIZES = [25, 50, 100, 200];

/** Blue for the user curve, green for TVL — same pairing as the other tabs. */
export const GROWTH_LINE = "#2D68FF";
export const TVL_LINE = "#10B981";

/**
 * Rows on «Quién paga las comisiones». 20 is the API default, 100 its maximum — a
 * concentration read wants the head of the list, not all of it.
 */
export const TOP_PAYERS_LIMIT = 20;

/**
 * Transactions per page inside the user drawer.
 *
 * 15 matches what `/users/{privyId}` embeds as its first page in the old
 * dashboard's `TX_PAGE_SIZE`, so page 1 renders from the detail response with no
 * second request — see `TransaccionesTab`. Raising the default here would make that
 * first page a spinner for no gain in a panel this tall.
 */
export const TX_PAGE_SIZE = 15;
export const TX_PAGE_SIZES = [15, 25, 50, 100];

/**
 * Width of the detail drawer on desktop.
 *
 * Wider than the 320px `UsersModule` uses for its edit panel, because this one holds
 * an eight-column transactions table rather than four form fields — at 320 every
 * table inside it would be a sideways scroll.
 */
export const DETAIL_DRAWER_WIDTH = 560;
