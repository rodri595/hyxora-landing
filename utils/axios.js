import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

// Gateway root (no trailing slash), e.g. https://gateway-dev.hyxora.com
// The per-app prefix (/app, /founders, /admin) is appended here, not stored
// in the env, so the two clients below can never drift apart.
const gateway = (process.env.NEXT_PUBLIC_HYXORA_API || "").replace(/\/+$/, "");

const withDevAuthHeader = (client) => {
  client.interceptors.request.use((config) => {
    if (isDev && !config.headers.Authorization) {
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

export default apiClient;
