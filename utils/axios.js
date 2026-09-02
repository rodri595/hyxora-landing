import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

// Gateway root (no trailing slash), e.g. https://gateway-dev.hyxora.com
// The per-app prefix (/app, /founders, /admin) is appended here, not stored
// in the env, so the two clients below can never drift apart.
const gateway = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");

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
 * Replays the session JWT as `Authorization: Bearer` whenever we hold one and
 * the caller left the header empty.
 *
 * The cookie is the real credential, but it is only first-party while the app
 * and the gateway share a registrable domain. They don't always: a Netlify
 * deploy (`hyxora-landing-dev.netlify.app` against `gateway-dev.hyxora.com`)
 * makes it a third-party cookie the browser is free to drop, and in dev
 * `withCredentials` is off so it never rides along at all. In both cases the
 * header is the only credential left — and sending it beside a cookie that did
 * survive costs nothing, which is what `gatewayAdminClient` already relies on.
 *
 * Only ever fills a header the caller left empty: `/login` sends a Privy token
 * here, and clobbering it with a Hyxora session JWT is what the backend rejects
 * with 400.
 */
const withSessionHeader = (client) => {
  client.interceptors.request.use((config) => {
    if (config.headers.Authorization || isAuthEndpoint(config.url)) return config;
    const jwt = typeof window === "undefined" ? null : sessionStorage.getItem("jwt");
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  });
  return client;
};

// Login/logout live at the gateway root, outside /founders.
export const authClient = withSessionHeader(
  axios.create({
    baseURL: `${gateway}/auth`,
    withCredentials: !isDev,
  })
);

// This app only talks to the founders service, so every hook path
// ("/poll/all", "/admin/tutorials", ...) resolves under /founders unchanged.
const apiClient = withSessionHeader(
  axios.create({
    baseURL: `${gateway}/founders`,
    withCredentials: !isDev,
  })
);

// One shared re-auth in flight, so a burst of parallel 401s triggers a single
// /auth/login instead of one per request
let sessionRefresh = null;

/**
 * Re-mints the Hyxora session from the current Privy token, at most once at a
 * time. Exported because `gatewayAdminClient` needs the same recovery on 401 and
 * must share this single-flight guard: two clients each running their own
 * refresh on a burst of 401s is two `/auth/login` calls, and failed logins are
 * exactly what the gateway's ban counter counts.
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
      // Bare axios: apiClient's response interceptor would recurse on this call
      const { data } = await axios.post(
        `${gateway}/auth/login`,
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

// Recover from a request that raced ahead of the session cookie (or outlived
// it): re-authenticate once, then replay the original request
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const isRetryable =
      error?.response?.status === 401 &&
      config &&
      !config._sessionRetry &&
      !isAuthEndpoint(config.url);

    if (!isRetryable) return Promise.reject(error);

    config._sessionRetry = true;
    try {
      await refreshSession();
    } catch {
      return Promise.reject(error);
    }
    return apiClient(config);
  }
);

export default apiClient;
