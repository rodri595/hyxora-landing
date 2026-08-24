import axios from "axios";

/**
 * Our own `/api/monitoring/*` route handlers — service pings, Solana fee-payer
 * balance, treasury liquidation scan and live gas prices.
 *
 * Not a fourth backend: these routes hold the vendor credentials (Zerion, the
 * Alchemy RPCs, Helius) server-side and are gated by `requireAdmin`, which
 * defers to Cerebro's allowlist. The browser sends only the Privy token.
 *
 * Shares `appApiClient`'s error convention — every route answers `{ error }` on
 * failure — so `QueryState` renders the real reason.
 */
const monitoringClient = axios.create({ baseURL: "/api/monitoring" });

monitoringClient.interceptors.request.use(
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

monitoringClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error;
    if (message) error.message = message;
    return Promise.reject(error);
  }
);

export default monitoringClient;
