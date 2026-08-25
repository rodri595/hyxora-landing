import axios from "axios";

/**
 * Hyxora **app** backend (app-api.hyxora.com), reached through our own
 * `/api/app-api` proxy — never directly.
 *
 * Third client in this codebase, and the only one whose baseURL is local. That
 * API authenticates with a shared bot token powerful enough to read any user's
 * portfolio, transactions and KYC, so the token stays server-side and the
 * browser only ever sends the caller's Privy token, which the proxy replays
 * against Cerebro's allowlist. See `app/api/app-api/[...path]/route.js`.
 *
 * Not interchangeable with `@/utils/axios` (api.hyxora.com, session JWT) or
 * `@/utils/cerebroAxios` (admin.hyxora.com, raw Privy token). Response shape is
 * `data.data`, like the app API it fronts.
 */
const appApiClient = axios.create({ baseURL: "/api/app-api" });

// Privy mints short-lived access tokens, so resolve one per request rather than
// caching it on the instance. getAccessToken() reuses/refreshes internally.
appApiClient.interceptors.request.use(
  async (config) => {
    const { getAccessToken } = await import("@privy-io/react-auth");
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// The proxy normalises every failure to `{ error }` — surface that instead of
// the generic "Request failed with status code 401".
appApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error;
    if (message) error.message = message;
    return Promise.reject(error);
  }
);

export default appApiClient;
