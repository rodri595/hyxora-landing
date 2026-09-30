import { createSessionClient, gatewayRoot } from "@/utils/axios";

/**
 * Cerebro = the cross-project admin/insight API, now served by the gateway at
 * `/admin` instead of standing alone on `admin.hyxora.com/api/v1`.
 *
 * That move collapsed what used to be the interesting difference between this
 * client and `@/utils/axios`: it is **the same login as everything else**, a
 * Hyxora session JWT, and `/admin` is to Cerebro what `/founders` is to the
 * founders service. No Privy access token is minted per request any more, and
 * no separate env var points at a second host.
 *
 * What stays true: the gateway still authorises against the backend's
 * `ADMIN_ALLOWLIST_PRIVY_IDS`, which is a *different* list from the `Admin` role
 * `useIsAdmin()` reads. So a caller who passes our client-side gate can still be
 * refused here, and the UI must surface that rather than pre-empt it.
 *
 * Responses are raw JSON — no `data.data` envelope, unlike `apiClient`.
 */
export const cerebroBaseUrl = `${gatewayRoot}/admin`;

const cerebroClient = createSessionClient({ baseURL: cerebroBaseUrl });

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
