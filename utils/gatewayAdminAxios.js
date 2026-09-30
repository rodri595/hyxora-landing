import { createSessionClient, gatewayRoot } from "@/utils/axios";

/**
 * The gateway's own admin surface — rate-limit counters and IP bans.
 *
 * Its own client rather than a call through `apiClient` for one reason left: a
 * different base path. `/gateway/admin/*` is served by the gateway itself and
 * never proxied to a backend, so it sits beside `/auth` and `/founders` rather
 * than inside one, and it answers plain `{ success, … }` with no `data.data`
 * envelope. Authentication is the shared session JWT, same as everywhere.
 *
 * It wants **both** a valid gateway JWT *and* the caller's Privy ID in the
 * gateway's live `ADMIN_ALLOWLIST_PRIVY_IDS` — checked on every request rather
 * than baked into the token. So `useIsAdmin()` gates who bothers to ask and the
 * 401/403 is still the real answer; surface it.
 *
 * `/gateway/admin/*` is itself exempt from rate limiting, which is the point:
 * an admin who is throttled can still reach the endpoint that unthrottles.
 */
const gatewayAdminClient = createSessionClient({ baseURL: `${gatewayRoot}/gateway/admin` });

export default gatewayAdminClient;
