import { refreshSession } from "@/utils/axios";
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

// The gateway root, without the /founders prefix `apiClient`'s baseURL carries.
// `/gateway/admin/*` is served by the gateway itself and is never proxied to a
// backend, so it sits beside /auth and /founders rather than inside one.
const gateway = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");

/**
 * The gateway's own admin surface — rate-limit counters and IP bans.
 *
 * A fifth client rather than a call through `apiClient`, because the two differ
 * in every respect that matters: a different base path (the gateway root, not
 * `/founders`), no `data.data` envelope, and its own authorisation. It wants
 * **both** a valid gateway JWT *and* the caller's Privy ID in the gateway's
 * live `ADMIN_ALLOWLIST_PRIVY_IDS` — the same list Cerebro reads, checked on
 * every request rather than baked into the token. So `useIsAdmin()` gates who
 * bothers to ask and the 401/403 is still the real answer; surface it.
 *
 * The JWT goes on as `Authorization: Bearer` in every environment. `useAuth`
 * mirrors it into sessionStorage on login regardless of `isDev`, and the
 * gateway documents the header rather than the cookie — `withCredentials` in
 * production is belt and braces for a session that only exists as a cookie.
 *
 * `/gateway/admin/*` is itself exempt from rate limiting, which is the point:
 * an admin who is throttled can still reach the endpoint that unthrottles.
 */
const gatewayAdminClient = axios.create({
  baseURL: `${gateway}/gateway/admin`,
  withCredentials: !isDev,
});

const attachSession = (config) => {
  if (config.headers.Authorization) return config;
  const jwt = typeof window === "undefined" ? null : sessionStorage.getItem("jwt");
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
};

gatewayAdminClient.interceptors.request.use(attachSession);

// Same one-shot recovery `apiClient` runs, sharing its in-flight guard: a stale
// session JWT is the likeliest 401 here and re-logging in fixes it. A 403 is
// never retried — that one means "not on the allowlist", and asking twice
// changes nothing.
gatewayAdminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (error?.response?.status !== 401 || !config || config._sessionRetry) {
      return Promise.reject(withMessage(error));
    }

    config._sessionRetry = true;
    try {
      await refreshSession();
    } catch {
      return Promise.reject(withMessage(error));
    }
    return gatewayAdminClient(config);
  }
);

/**
 * Lifts the gateway's own words onto `error.message`, so a panel renders the
 * reason instead of "Request failed with status code 400".
 *
 * Three shapes, most specific first. A validation failure answers
 * `{ error: "Validation failed", details: [{ message }] }` and only the detail
 * says *what* was wrong; a 404 answers with a `message` telling you to fall
 * back to resetting by email; everything else has `error`.
 */
const withMessage = (error) => {
  const data = error?.response?.data;
  const message = data?.details?.[0]?.message ?? data?.message ?? data?.error;
  if (message) error.message = message;
  return error;
};

export default gatewayAdminClient;
