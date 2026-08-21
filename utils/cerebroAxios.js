import axios from "axios";

/**
 * Cerebro = the cross-project admin/insight API (admin.hyxora.com).
 * Separate from `@/utils/axios`: it does NOT use the Hyxora session cookie/JWT.
 * Every request carries a raw Privy access token, and the caller's Privy ID
 * must sit in the backend's ADMIN_ALLOWLIST_PRIVY_IDS allowlist.
 */
const baseURL = process.env.NEXT_PUBLIC_CEREBRO_API || "https://admin.hyxora.com/api/v1";

const cerebroClient = axios.create({ baseURL });

// Privy mints short-lived access tokens, so resolve one per request rather than
// caching it on the instance. getAccessToken() reuses/refreshes internally.
cerebroClient.interceptors.request.use(
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

// Cerebro answers `{ error: string }` on failure — surface that instead of the
// generic "Request failed with status code 401"
cerebroClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error;
    if (message) error.message = message;
    return Promise.reject(error);
  }
);

/**
 * Strip empty query params so UI inputs left blank don't reach the API as `?plan=`.
 * Axios already drops `undefined` / `null`; this also drops `""`.
 * @param {Record<string, unknown>} params
 * @return {Record<string, unknown>}
 */
export const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

export default cerebroClient;
