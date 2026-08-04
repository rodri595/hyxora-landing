import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const baseURL = process.env.NEXT_PUBLIC_HYXORA_API;

const apiClient = axios.create({
  baseURL,
  withCredentials: !isDev,
});

// Add request interceptor to include JWT token in development
apiClient.interceptors.request.use(
  (config) => {
    if (isDev) {
      const jwt = sessionStorage.getItem("jwt");
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Endpoints that mint/clear the session themselves — retrying them on 401 loops
const AUTH_ENDPOINTS = ["/authenticate", "/logout"];

// One shared re-auth in flight, so a burst of parallel 401s triggers a single
// /authenticate instead of one per request
let sessionRefresh = null;

const refreshSession = () => {
  if (!sessionRefresh) {
    sessionRefresh = (async () => {
      const { getAccessToken } = await import("@privy-io/react-auth");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy access token unavailable");

      // Bare axios: apiClient's response interceptor would recurse on this call
      const { data } = await axios.post(
        `${baseURL}/authenticate`,
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
      !AUTH_ENDPOINTS.some((path) => config.url?.startsWith(path));

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
