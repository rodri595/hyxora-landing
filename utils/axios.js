import { gatewayRoot } from "@/utils/gateway";
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

// Re-exported so every client built here imports the root from the same module
// as the factory. `@/utils/gateway` is where it is actually defined.
export { gatewayRoot };

// Endpoints that mint/clear the session themselves. They carry their own
// Authorization (a Privy access token) and must never be given the session JWT:
// retrying them on 401 loops, and overwriting their header 400s.
const AUTH_ENDPOINTS = ["/login", "/logout"];

const isAuthEndpoint = (url) => AUTH_ENDPOINTS.some((path) => url?.startsWith(path));

/**
 * The Hyxora session JWT out of a `/auth/login` body, whichever shape it came
 * back in — `{ data: { jwt } }` or `{ token }`.
 *
 * One reader instead of three, because the three call sites that mint a session
 * each picked a different one and only one can be right at a time. The failure
 * is silent and total: the login succeeds, nothing is written to storage, and
 * every request after it goes out with no credential at all.
 *
 * @param {unknown} data Parsed `/auth/login` response body.
 * @return {string | null}
 */
export const readSessionJwt = (data) =>
  data?.data?.jwt ?? data?.token ?? data?.jwt ?? data?.data?.token ?? null;

/**
 * Lifts the backend's own words onto `error.message`, so a panel renders the
 * reason instead of "Request failed with status code 400".
 *
 * Three shapes, most specific first. A validation failure answers
 * `{ error: "Validation failed", details: [{ message }] }` and only the detail
 * says *what* was wrong; some 404s answer with a `message`; everything else
 * (the gateway, our own route handlers) answers `{ error }`.
 *
 * @param {unknown} error Axios error, returned unchanged for rejection chaining.
 */
export const withMessage = (error) => {
  const data = error?.response?.data;
  const message = data?.details?.[0]?.message ?? data?.message ?? data?.error;
  if (message) error.message = message;
  return error;
};

// One shared re-auth in flight, so a burst of parallel 401s triggers a single
// /auth/login instead of one per request — across *every* client below.
let sessionRefresh = null;

/**
 * Re-mints the Hyxora session from the current Privy token, at most once at a
 * time. Every session client shares this single-flight guard: several clients
 * each running their own refresh on a burst of 401s is several `/auth/login`
 * calls, and failed logins are exactly what the gateway's ban counter counts.
 */
export const refreshSession = () => {
  if (!sessionRefresh) {
    sessionRefresh = (async () => {
      const { getAccessToken } = await import("@privy-io/react-auth");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy access token unavailable");

      // The `Bearer` scheme is not optional. The gateway parses it off the
      // header and answers a bare token with `{ success: false, error:
      // "Missing access token" }` — which, arriving from the *recovery* path,
      // reads like a rejected login rather than a malformed header.
      //
      // Bare axios: a session client's response interceptor would recurse here.
      const { data } = await axios.post(
        `${gatewayRoot}/auth/login`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: !isDev,
        }
      );
      const jwt = readSessionJwt(data);
      if (jwt) {
        sessionStorage.setItem("jwt", jwt);
      }
      return data;
    })().finally(() => {
      sessionRefresh = null;
    });
  }
  return sessionRefresh;
};

/**
 * An axios instance that authenticates with the Hyxora session — the one
 * credential every backend in this app now takes.
 *
 * Two behaviours, and both are the reason this is a factory rather than five
 * hand-rolled instances:
 *
 * **The JWT rides as `Authorization: Bearer` as well as a cookie.** The cookie
 * is the real credential, but it is only first-party while the app and the
 * gateway share a registrable domain. They don't always: a Netlify deploy
 * (`hyxora-landing-dev.netlify.app` against `gateway-dev.hyxora.com`) makes it a
 * third-party cookie the browser drops before it is ever stored, and in dev
 * `withCredentials` is off so it never rides along at all. In both cases the
 * header is the only credential left. It only ever fills a header the caller
 * left empty: `/login` sends a Privy token, and clobbering it with a session
 * JWT is what the backend rejects with 400.
 *
 * **A 401 buys exactly one retry.** A request that raced ahead of the session
 * (or outlived it) re-authenticates once and replays. A 403 is never retried —
 * that one means "not on the allowlist", and asking twice changes nothing.
 *
 * @param {Object} options
 * @param {string} options.baseURL Absolute (a gateway service) or local (one of
 * our own route handlers, which replay the same credential server-side).
 * @param {boolean} [options.withCredentials] Defaults to on outside dev.
 * @param {boolean} [options.retryUnauthorized] Defaults to on; off for `/auth`,
 * which *is* the recovery.
 * @param {boolean} [options.normalizeErrors] Lift the body's message onto
 * `error.message`. Defaults to on; off for `/founders`, whose callers already
 * read the raw axios error.
 * @return {import("axios").AxiosInstance}
 */
export const createSessionClient = ({
  baseURL,
  withCredentials = !isDev,
  retryUnauthorized = true,
  normalizeErrors = true,
}) => {
  const client = axios.create({ baseURL, withCredentials });

  client.interceptors.request.use((config) => {
    if (config.headers.Authorization || isAuthEndpoint(config.url)) return config;
    const jwt = typeof window === "undefined" ? null : sessionStorage.getItem("jwt");
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  });

  const reject = (error) => Promise.reject(normalizeErrors ? withMessage(error) : error);

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error?.config;
      const isRetryable =
        retryUnauthorized &&
        error?.response?.status === 401 &&
        config &&
        !config._sessionRetry &&
        !isAuthEndpoint(config.url);

      if (!isRetryable) return reject(error);

      config._sessionRetry = true;
      try {
        await refreshSession();
      } catch {
        return reject(error);
      }
      return client(config);
    }
  );

  return client;
};

// Login/logout live at the gateway root, outside /founders.
export const authClient = createSessionClient({
  baseURL: `${gatewayRoot}/auth`,
  retryUnauthorized: false,
  normalizeErrors: false,
});

// The founders service — every hook path ("/poll/all", "/admin/tutorials", ...)
// resolves under /founders unchanged.
const apiClient = createSessionClient({
  baseURL: `${gatewayRoot}/founders`,
  normalizeErrors: false,
});

export default apiClient;
