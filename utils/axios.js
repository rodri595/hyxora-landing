import axios from "axios";
import { getAccessToken } from "@privy-io/react-auth";

const isDev = process.env.NODE_ENV === "development";
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HYXORA_API,
  withCredentials: !isDev,
});

// How many times a single request will try to re-mint the session before we
// give up on the interceptor and fall back to a hard refresh.
const MAX_REAUTH_RETRIES = 3;
// How many hard refreshes we allow per tab before surfacing the error instead,
// so a refresh that doesn't fix the cookie can't trap the user in a reload loop.
const MAX_RELOADS = 1;
const RELOAD_COUNT_KEY = "reauthReloadCount";

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

// Last resort: hard refresh so the Privy provider re-initialises and issues the
// correct cookie for the current subdomain. Capped per tab to avoid a loop when
// the refresh doesn't actually resolve the bad session.
const hardRefresh = () => {
  if (typeof window === "undefined") return;
  const reloads = Number(sessionStorage.getItem(RELOAD_COUNT_KEY) || 0);
  if (reloads >= MAX_RELOADS) return;
  sessionStorage.setItem(RELOAD_COUNT_KEY, String(reloads + 1));
  window.location.reload();
};

// Response interceptor: on an "Invalid session" error, refresh the session and
// replay the request up to MAX_REAUTH_RETRIES times, then hard refresh.
apiClient.interceptors.response.use(
  (response) => {
    // A healthy response means the session is fine again; clear the reload guard
    // so a future, unrelated issue is still allowed to refresh.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(RELOAD_COUNT_KEY);
    }
    return response;
  },
  async (error) => {
    const config = error?.config;

    if (!config || config._skipReauth || !isInvalidSessionError(error)) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;

    // Exhausted the in-app retries — fall back to a hard refresh.
    if (config._retryCount >= MAX_REAUTH_RETRIES) {
      hardRefresh();
      return Promise.reject(error);
    }

    config._retryCount += 1;

    try {
      await ensureReauth();
    } catch (reauthError) {
      // Couldn't re-mint the session at all; hard refresh as a last resort.
      hardRefresh();
      return Promise.reject(reauthError);
    }

    return apiClient(config);
  }
);

export default apiClient;
