import { createSessionClient } from "@/utils/axios";

/**
 * Our own `/api/monitoring/*` route handlers — service pings, Solana fee-payer
 * balance, treasury liquidation scan and live gas prices.
 *
 * Not another backend: these routes hold the vendor credentials (Zerion, the
 * Alchemy RPCs, Helius) server-side and are gated by `requireAdmin`, which
 * defers to the gateway's allowlist. The browser sends only its session JWT.
 *
 * Shares `appApiClient`'s error convention — every route answers `{ error }` on
 * failure — so `QueryState` renders the real reason.
 */
const monitoringClient = createSessionClient({ baseURL: "/api/monitoring" });

export default monitoringClient;
