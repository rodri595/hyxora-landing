/**
 * Windows on «Movimientos». 90 is the API default and 365 its maximum.
 */
export const CHURN_WINDOWS = [
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: 180, label: "180 días" },
  { value: 365, label: "Último año" },
];
export const CHURN_DAYS = 90;

/**
 * Lookback for *finalised* cancellations on the pipeline. Pending ones and those in
 * withdraw-only grace are listed whatever the window. 365 is the API maximum.
 */
export const CANCELLATION_WINDOWS = [
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: 365, label: "Último año" },
];
export const CANCELLATION_DAYS = 90;

/** `/memberships/cancellations` stops at 500 rows. */
export const CANCELLATION_LIMIT = 500;

/** Cohort window on «Antigüedad». 365 is the API default, 730 its maximum. */
export const TENURE_DAYS = 365;

/** `/memberships/tenure` buckets in the order the API asks them to be shown. */
export const TENURE_BUCKETS = [
  { id: "d0-7", label: "0–7 días" },
  { id: "d8-30", label: "8–30 días" },
  { id: "d31-90", label: "1–3 meses" },
  { id: "d91-180", label: "3–6 meses" },
  { id: "d181-365", label: "6–12 meses" },
  { id: "y365+", label: "Más de 1 año" },
];

/**
 * First day `membership_events` has rows for. A window reaching earlier shows no
 * movement there because nothing was recorded, not because nothing happened.
 */
export const MEMBERSHIP_HISTORY_START = "2026-06-10";
