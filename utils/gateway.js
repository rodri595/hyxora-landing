/**
 * The Hyxora gateway root, and the one place that reads its env var.
 *
 * Everything the app talks to now hangs off this host under a service prefix —
 * `/auth`, `/founders`, `/app`, `/admin`, `/gateway/admin` — so the prefix is
 * always appended at the call site and never stored in an env var of its own.
 * One var moves every service between dev and prod together, which is the point:
 * a per-service override is how a build ends up half on gateway-dev.
 *
 * Deliberately dependency-free — no axios, no browser API — so route handlers
 * and `utils/server/*` can import it without pulling the client factory in.
 */
export const gatewayRoot = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");
