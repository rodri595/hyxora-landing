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

// In dev `withCredentials` is off, so the session cookie never rides along —
// replay it from sessionStorage instead. Only ever fills a header the caller
// left empty: `/login` sends a Privy token here, and clobbering it with
// a Hyxora session JWT is what the backend rejects with 400.
const withDevAuthHeader = (client) => {
  client.interceptors.request.use((config) => {
    if (isDev && !config.headers.Authorization && !isAuthEndpoint(config.url)) {
      const jwt = sessionStorage.getItem("jwt");
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  });
  return client;
};

// Login/logout live at the gateway root, outside /founders.
export const authClient = withDevAuthHeader(
  axios.create({
    baseURL: `${gateway}/auth`,
    withCredentials: !isDev,
  })
);

// This app only talks to the founders service, so every hook path
// ("/poll/all", "/admin/tutorials", ...) resolves under /founders unchanged.
const apiClient = withDevAuthHeader(
  axios.create({
    baseURL: `${gateway}/founders`,
    withCredentials: !isDev,
  })
);

// One shared re-auth in flight, so a burst of parallel 401s triggers a single
// /auth/login instead of one per request
let sessionRefresh = null;

const refreshSession = () => {
  if (!sessionRefresh) {
    sessionRefresh = (async () => {
      const { getAccessToken } = await import("@privy-io/react-auth");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy access token unavailable");

      // Bare axios: apiClient's response interceptor would recurse on this call
      const { data } = await axios.post(
        `${gateway}/auth/login`,
        {},
        {
          headers: { Authorization: accessToken },
          withCredentials: !isDev,
        }
      );
      if (data?.data?.jwt) {
        sessionStorage.setItem("jwt", data.data.jwt);
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
