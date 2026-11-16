import { cerebroPlanLabel } from "@/constants/cerebro";

/**
 * Joining a Cerebro `/users` row to the app backend's own `/admin/users` record,
 * for the profile name, the country and the live membership block Cerebro's sync
 * doesn't copy.
 *
 * By **`privyId`** first — the DID both sides key on, sent by app-api since
 * 2026-11-16. Email, then wallet, stay as fallbacks for a row without one: app-api's
 * `wallet` is the user's Safe and `signer` the EOA behind it, the same two
 * addresses Cerebro sends as `safeAddress` and `signerAddress`, so unlike the
 * founders join a wallet hit here is the same account, not a coincidence.
 */

/** @import { AppApiUser } from "@/hooks/appApi/types" */

const lower = (value) => (typeof value === "string" && value ? value.toLowerCase() : null);
const text = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

/**
 * @typedef {{ byPrivyId: Map<string, AppApiUser>, byEmail: Map<string, AppApiUser>, byWallet: Map<string, AppApiUser> }} AppUserIndex
 */

/**
 * @param {AppApiUser[] | undefined} users
 * @return {AppUserIndex}
 */
export const indexAppUsers = (users) => {
  const byPrivyId = new Map();
  const byEmail = new Map();
  const byWallet = new Map();

  for (const user of Array.isArray(users) ? users : []) {
    const did = text(user?.privyId);
    if (did && !byPrivyId.has(did)) byPrivyId.set(did, user);
    const email = lower(user?.email);
    if (email && !byEmail.has(email)) byEmail.set(email, user);
    for (const address of [user?.wallet, user?.signer]) {
      const wallet = lower(address);
      if (wallet && !byWallet.has(wallet)) byWallet.set(wallet, user);
    }
  }

  return { byPrivyId, byEmail, byWallet };
};

/**
 * @param {AppUserIndex} index
 * @param {Object} row A Cerebro `/users` row.
 * @return {AppApiUser | null}
 */
const findAppUser = (index, row) => {
  const did = text(row.privyId);
  if (did && index.byPrivyId.has(did)) return index.byPrivyId.get(did);

  const email = lower(row.email);
  if (email && index.byEmail.has(email)) return index.byEmail.get(email);

  for (const address of [row.safeAddress, row.signerAddress]) {
    const wallet = lower(address);
    if (wallet && index.byWallet.has(wallet)) return index.byWallet.get(wallet);
  }

  return null;
};

/**
 * The Cerebro row with app-api's fields laid over it.
 *
 * On a match, the membership dates come from app-api alone — it is the live source
 * and Cerebro's copy lags its per-user sync by up to two hours — and a key app-api
 * left out reads `null`, because it wipes the whole block on a finalised
 * cancellation. The status is the exception: when app-api has none, Cerebro's is
 * kept, since that is the only place a wiped account still reads «cancelada» rather
 * than «sin membresía».
 *
 * @param {AppUserIndex} index
 * @param {Object} row
 */
export const withAppFields = (index, row) => {
  const app = findAppUser(index, row);
  if (!app) {
    return {
      ...row,
      appMatch: false,
      fullName: text(row.name),
      country: text(row.country)?.toUpperCase() ?? null,
      planName: row.plan ? cerebroPlanLabel(row.plan) : null,
    };
  }

  const membership = app.membership;

  return {
    ...row,
    appMatch: true,
    firstName: text(app.firstName),
    lastName: text(app.lastName),
    // Cerebro's `/users` carries `name` and `country` too (since 2026-11-16), so an
    // empty answer here falls back to its copy rather than blanking the cell.
    fullName: text(app.name) ?? text(row.name),
    country: (text(app.country) ?? text(row.country))?.toUpperCase() ?? null,
    planName: membership ? cerebroPlanLabel(membership.tier || membership.name) : null,
    membershipStatus: app.membershipStatus ?? row.membershipStatus ?? null,
    membershipStartDate: app.membershipStartDate ?? null,
    membershipRenewDate: app.membershipRenewDate ?? null,
    membershipLastRenewedAt: app.membershipLastRenewedAt ?? null,
    membershipInterval: app.membershipInterval ?? null,
    membershipPaymentType: app.membershipPaymentType ?? null,
    cancelEffectiveDate: app.cancelEffectiveDate ?? null,
  };
};
