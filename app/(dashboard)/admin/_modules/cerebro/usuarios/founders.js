/**
 * Joining a Cerebro `/users` row to the founders site's own user record — the one
 * `/admin?tab=users` lists from `/admin/getAllUsers`.
 *
 * They are two databases with no shared id: Cerebro keys on the Privy DID, the
 * founders backend on its own Mongo `_id` and never stores the DID. So the join is
 * by **email**, the key `UsersModule` already uses to find a user's simulator
 * account, with the **wallet** as a fallback for an account with no email on one
 * side (an X login). The founders `address` is the Privy smart wallet that site
 * created, which is only the app's Safe or signer when both came from the same
 * Privy account — a miss on it proves nothing, a hit is certain.
 */

/** @param {unknown} value */
const lower = (value) => (typeof value === "string" && value ? value.toLowerCase() : null);

/**
 * @typedef {{ byEmail: Map<string, Object>, byWallet: Map<string, Object> }} FounderIndex
 * @typedef {{ user: Object, matchedBy: "email" | "wallet" }} FounderMatch
 */

/**
 * First record wins on a duplicate key, so the answer doesn't depend on which of
 * two accounts the backend happened to list last.
 *
 * @param {Object[] | undefined} users `/admin/getAllUsers`.
 * @return {FounderIndex}
 */
export const indexFounderUsers = (users) => {
  const byEmail = new Map();
  const byWallet = new Map();

  for (const user of Array.isArray(users) ? users : []) {
    const email = lower(user?.email);
    const wallet = lower(user?.address);
    if (email && !byEmail.has(email)) byEmail.set(email, user);
    if (wallet && !byWallet.has(wallet)) byWallet.set(wallet, user);
  }

  return { byEmail, byWallet };
};

/**
 * @param {FounderIndex} index
 * @param {Object | null} user A Cerebro `/users` row.
 * @return {FounderMatch | null}
 */
export const findFounderUser = (index, user) => {
  if (!user) return null;

  const email = lower(user.email);
  if (email && index.byEmail.has(email)) {
    return { user: index.byEmail.get(email), matchedBy: "email" };
  }

  for (const address of [user.safeAddress, user.signerAddress]) {
    const wallet = lower(address);
    if (wallet && index.byWallet.has(wallet)) {
      return { user: index.byWallet.get(wallet), matchedBy: "wallet" };
    }
  }

  return null;
};

/**
 * The row the table renders and exports: the Cerebro row plus the founders fields
 * flattened beside it. Flat on purpose — export writes `row.original` straight to
 * CSV, where a nested record would land as "[object Object]". `founderPayments` is
 * `payments.length`, the same count as the «Pagos» column on `/admin?tab=users`.
 *
 * @param {FounderIndex} index
 * @param {Object} user
 */
export const withFounderFields = (index, user) => {
  const match = findFounderUser(index, user);
  const founder = match?.user;

  return {
    ...user,
    founderMatch: match?.matchedBy ?? null,
    founderPhone: founder?.phoneNumber || null,
    founderRole: founder?.role || null,
    founderPayments: founder ? (founder.payments?.length ?? 0) : null,
    founderWallet: founder?.address || null,
  };
};
