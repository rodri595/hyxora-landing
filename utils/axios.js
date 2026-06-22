import axios from "axios";
import { getAccessToken } from "@privy-io/react-auth";

const isDev = process.env.NODE_ENV === "development";
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HYXORA_API,
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

// Detects the backend "Invalid session" error regardless of the payload shape
// (string body, { message }, { error }, etc.).
const isInvalidSessionError = (error) => {
  const data = error?.response?.data;
  if (!data) return false;
  const haystack = typeof data === "string" ? data : JSON.stringify(data);
  return haystack.toLowerCase().includes("invalid session");
};

// Re-mints the backend session from the current Privy access token. The token
// is subdomain-correct, so this resolves stale/mismatched session cookies left
// over from navigating between apps on different subdomains.
//
// A shared in-flight promise ensures a burst of failing requests triggers only
// one re-authentication; they all await the same result before retrying.
let reauthPromise = null;

const reauthenticate = async () => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No Privy access token available");

  // _skipReauth keeps this call out of the retry loop below.
  const response = await apiClient.post(
    "/authenticate",
    {},
    { headers: { Authorization: accessToken }, _skipReauth: true }
  );
  if (response.data?.data?.jwt) {
    sessionStorage.setItem("jwt", response.data.data.jwt);
  }
  return response.data;
};

const ensureReauth = () => {
  if (!reauthPromise) {
    reauthPromise = reauthenticate().finally(() => {
      reauthPromise = null;
    });
  }
  return reauthPromise;
};

// Response interceptor: on an "Invalid session" error, refresh the session once
// and replay the original request.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (
      !config ||
      config._retry ||
      config._skipReauth ||
      !isInvalidSessionError(error)
    ) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      await ensureReauth();
    } catch (reauthError) {
      return Promise.reject(reauthError);
    }

    return apiClient(config);
  }
);

export default apiClient;
