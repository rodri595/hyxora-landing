import { cerebroMembershipKey, cerebroPlanLabel } from "@/constants/cerebro";

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
 * app-api names plans "PREMIUM", "BASIC", "NFT Founder HYXORA" and sends no `tier`
 * (seen on staging 2026-11-16), so read into the same labels Cerebro's `plan` gets.
 */
export const planLabel = (name) => {
  const plan = text(name);
  if (!plan) return null;
  return /founder/i.test(plan) ? "Founder" : cerebroPlanLabel(plan.toLowerCase());
};

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Whole days from today to `value`, negative once it has passed; null for no date. */
export const daysUntil = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
};

/** Holds the founder NFT — Cerebro's `nftBalance`, quoted or not. */
export const holdsFounderNft = (row) => Number(row?.nftBalance) > 0;

/**
 * When the paid period ends: the cancellation date for someone on their way out — a
 * trial included, since it is stored as one — the renewal date for everyone else,
 * nothing for an account with no membership or a founder's permanent plan. The CRM's
 * «Final Membresía».
 */
export const periodEnd = (row) => {
  const status = cerebroMembershipKey(row.membershipStatus);
  if (status === "none" || status === "founder") return null;
  if ((status === "toCancel" || row.isTrial === true) && row.cancelEffectiveDate) {
    return row.cancelEffectiveDate;
  }
  return row.membershipRenewDate;
};

const regionNames = new Intl.DisplayNames(["es"], { type: "region" });

/** "ES" → "España". Anything that isn't a two-letter code goes out as it came. */
export const countryName = (code) => {
  if (!code) return null;
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

/** app-api's `membershipPaymentType` and `membershipInterval`, as the admin reads them. */
export const PAYMENT_TYPES = { stripe: "Stripe", onchain: "On-chain", manual: "Manual" };
export const INTERVALS = { month: "Mensual", year: "Anual" };

/** How close the renewal day has to be for an active membership to read «en renovación». */
export const RENEWAL_WINDOW_DAYS = 10;

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
export const findAppUser = (index, row) => {
  if (!row) return null;
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
 * cancellation. Status and plan are the exceptions: when app-api has none, Cerebro's
 * is kept, since that is the only place a wiped account still reads «cancelada»
 * rather than «sin membresía», and still has a plan to show.
 *
 * @param {AppUserIndex} index
 * @param {Object} row
 */
const joinAppFields = (index, row) => {
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
    planName: membership
      ? planLabel(membership.tier || membership.name)
      : row.plan
        ? cerebroPlanLabel(row.plan)
        : null,
    membershipStatus: app.membershipStatus ?? row.membershipStatus ?? null,
    membershipStartDate: app.membershipStartDate ?? null,
    membershipRenewDate: app.membershipRenewDate ?? null,
    membershipLastRenewedAt: app.membershipLastRenewedAt ?? null,
    membershipInterval: app.membershipInterval ?? null,
    membershipPaymentType: app.membershipPaymentType ?? null,
    cancelEffectiveDate: app.cancelEffectiveDate ?? null,
    // Cerebro's /users never sends the Solana wallet; app-api does, as `solana`.
    solanaAddress: text(app.solana) ?? row.solanaAddress ?? null,
    // null until hyxora-app-backend #223 ships the field — unknown, not "not a trial".
    isTrial: typeof app.isTrial === "boolean" ? app.isTrial : null,
  };
};

/**
 * The backend says `active` until a renewal lands, so a renewal that is days away
 * and one that never came (a failed charge, a lost webhook) both look like any
 * other active member. Read off the renew date instead: «en renovación» inside the
 * window, «no renovado» once the day has gone by — the renewal day itself is still
 * «en renovación». Only `active`: every other status already says where it's going.
 *
 * A **manual** membership (grants by hand) has no charge behind it, so nothing ever
 * moves its date: past it, the app treats the plan as over and asks the user to
 * upgrade, while the backend still says `active`. That is «caducada», not a missed
 * payment, and the days before it are «caduca pronto».
 *
 * Except a **founder holding the NFT**: that plan is permanent for as long as they
 * keep it, so its renew date means nothing and it reads «founder · permanente». Only
 * once the NFT is transferred (`nftBalance` 0, plan still founder) does the date apply
 * again. On staging 29 of the 81 «caducadas» were NFT founders before this rule.
 *
 * @param {Object} row
 */
const withRenewalState = (row) => {
  if (cerebroMembershipKey(row.membershipStatus) !== "active") return row;
  if (holdsFounderNft(row)) return { ...row, membershipStatus: "founder" };
  const days = daysUntil(row.membershipRenewDate);
  if (days === null || days > RENEWAL_WINDOW_DAYS) return row;
  const manual = row.membershipPaymentType === "manual";
  const status = days < 0 ? (manual ? "expired" : "notRenewed") : manual ? "expiring" : "renewing";
  return { ...row, membershipStatus: status };
};

/**
 * What `joinAppFields` sets on a matched row: app-api's live values. Anything that
 * merges a Cerebro record over the row afterwards — the drawer's `readUserRecord`,
 * whose detail record wins by design — must lay these back on top, or a copy up to
 * two hours stale quietly replaces the live answer.
 */
export const APP_OWNED_KEYS = [
  "firstName",
  "lastName",
  "fullName",
  "country",
  "planName",
  "membershipStatus",
  "membershipStartDate",
  "membershipRenewDate",
  "membershipLastRenewedAt",
  "membershipInterval",
  "membershipPaymentType",
  "cancelEffectiveDate",
  "isTrial",
];

/**
 * The Cerebro row with app-api's fields laid over it, and its renewal state.
 *
 * `isTrial` rides along as its own field rather than replacing the status: a free
 * trial is stored as manual + `toCancel`, and the table gives it a column and a filter
 * of its own, so «de pago» is one click away without the status hiding what the
 * backend says.
 *
 * @param {AppUserIndex} index
 * @param {Object} row
 */
export const withAppFields = (index, row) => withRenewalState(joinAppFields(index, row));
