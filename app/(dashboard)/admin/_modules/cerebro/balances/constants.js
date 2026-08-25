/**
 * Rows requested from `/holdings` for each of the two lists. 100 is the API
 * maximum — asking for less would silently hide assets, and both tables say so
 * when the response comes back at the cap.
 */
export const HOLDINGS_LIMIT = 100;

/** Rows per page once a table outgrows a single screen. */
export const HOLDINGS_PAGE_SIZE = 25;

/**
 * Holders requested per expanded row. 500 is the API maximum for
 * `/holdings/holders`; asking for less would silently trim a popular token's list,
 * and the sub-row says so when the response comes back at the cap.
 */
export const HOLDERS_LIMIT = 500;
