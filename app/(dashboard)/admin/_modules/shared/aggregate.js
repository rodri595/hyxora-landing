/**
 * Sum that stays null when nothing usable came back, so a block the API didn't
 * return shows "—" instead of a confident $0. Used for headline figures stitched
 * from more than one endpoint.
 *
 * @param {...(number | null | undefined)} values
 * @return {number | null}
 */
export const sumDefined = (...values) => {
  const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  return numbers.length > 0 ? numbers.reduce((total, value) => total + value, 0) : null;
};

/**
 * Column total for a DataTable `footer`. Reads the filtered row model, not the
 * paginated one, so the totals row covers the whole search result rather than the
 * page on screen.
 *
 * @param {import("@tanstack/react-table").Table<any>} table
 * @param {string} key
 * @return {number}
 */
export const sumColumn = (table, key) =>
  table.getFilteredRowModel().rows.reduce((total, row) => total + (row.original[key] ?? 0), 0);

/**
 * Ratio guarded against a zero or missing denominator — an op type with cost 0
 * has no meaningful average, and `x / 0` would render as "Infinity".
 *
 * @param {number | null | undefined} numerator
 * @param {number | null | undefined} denominator
 * @return {number | null}
 */
export const ratio = (numerator, denominator) => {
  if (typeof numerator !== "number" || !Number.isFinite(numerator)) return null;
  if (typeof denominator !== "number" || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }
  return numerator / denominator;
};

/**
 * Same as `sumColumn` but null when no row carried a usable number — a column the
 * API didn't send totals to "—" instead of a confident 0.
 *
 * @param {import("@tanstack/react-table").Table<any>} table
 * @param {string} key
 * @return {number | null}
 */
export const sumColumnDefined = (table, key) =>
  sumDefined(...table.getFilteredRowModel().rows.map((row) => row.original[key]));
