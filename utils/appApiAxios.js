import { createSessionClient } from "@/utils/axios";

/**
 * Hyxora **app** backend (the gateway's `/app` service), reached through our own
 * `/api/app-api` proxy — never directly.
 *
 * The only client here whose baseURL is local. That API authenticates with a
 * shared bot token powerful enough to read any user's portfolio, transactions
 * and KYC, so the token stays server-side and the browser only ever sends its
 * Hyxora session, which `requireAdmin` replays against the gateway's allowlist.
 * See `app/api/app-api/[...path]/route.js`.
 *
 * Not interchangeable with `@/utils/axios` (the founders service) or
 * `@/utils/cerebroAxios` (the gateway's `/admin` analytics). Response shape is
 * `data.data`, like the app API it fronts.
 */
const appApiClient = createSessionClient({ baseURL: "/api/app-api" });

export default appApiClient;
