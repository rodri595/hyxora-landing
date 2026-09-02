/**
 * Shapes returned by the gateway's own admin surface (`/gateway/admin/*`).
 * Documented in `docs/RATE_LIMITING.md`.
 */

/**
 * One client currently holding a counter, as `/rate-limits` lists them.
 *
 * `target` is the real email or IP — it exists only in this admin view and never
 * in a client's own 429, which carries the opaque `id` instead.
 *
 * @typedef {Object} RateLimitClient
 * @property {string | null} id The reference the client was last handed on a 429,
 * or null when it is consuming quota but has not been throttled this window.
 * @property {"email" | "ip"} limitedBy Whether the counter is per-user or per-IP.
 * @property {string} target The email (normalized) or the IP address.
 * @property {number} used Requests spent this window. Can exceed `limit`.
 * @property {number} limit Requests allowed per window.
 * @property {string} resetAt ISO timestamp the window reopens.
 * @property {number} secondsUntilReset Snapshot at response time — recompute from
 * `resetAt` rather than counting this down, or it drifts with the poll interval.
 */

/**
 * @typedef {Object} RateLimitsResult
 * @property {boolean} success
 * @property {number} count
 * @property {number} windowMs Window length in ms. Config-controlled — read it,
 * never hardcode 60000.
 * @property {number} limit Requests per window. Same rule.
 * @property {RateLimitClient[]} clients Sorted by `used` descending.
 */

/**
 * @typedef {Object} RateLimitResetResult
 * @property {boolean} success
 * @property {string | null} id
 * @property {"email" | "ip"} limitedBy
 * @property {string} target
 * @property {number} hitsCleared 0 means the reset worked and there was no live
 * counter to clear. That is not an error.
 */

/**
 * @typedef {Object} RateLimitResetAllResult
 * @property {boolean} success
 * @property {number} clientsCleared
 */

export {};
