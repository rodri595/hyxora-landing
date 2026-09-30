import { useAuth } from "@/hooks/useAuth";
import { readFromLocalStorageWithExpiracy, writeToLocalStorageWithExpiracy } from "@/utils/query";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Where a live login ban is remembered across reloads. The stored value carries
// its own expiry, so a lapsed ban reads back as null without any clock of ours.
const BAN_STORAGE_KEY = "hyxora:login-ban";

// What a rate limit that names no wait gets. The point of a limit is that the
// caller stops calling, so guessing zero — letting the button fire again at
// once — is the one answer that makes the ban worse.
const DEFAULT_RATE_LIMIT_WAIT_SECONDS = 60;

// The gateway's `retryAfter` is a bare number with no unit on it, and the
// difference matters: the observed `retryAfter: 72000` is 20 hours as seconds
// and 72 seconds as milliseconds. Confirmed with the backend as **seconds**, so
// this is 1; make it 1000 if that ever changes, and nothing else moves.
const BODY_RETRY_AFTER_PER_SECOND = 1;

const headerOf = (response) => (name) =>
  // axios v1 hands back an AxiosHeaders whose `.get()` is case-insensitive;
  // a plain object (a mock, a hand-built error) is not, so try both.
  typeof response?.headers?.get === "function"
    ? response.headers.get(name)
    : response?.headers?.[name];

/**
 * Seconds to wait, from whatever the backend put in the field. `Retry-After` is
 * either a delta in seconds or an HTTP date (RFC 9110 §10.2.3);
 * `X-RateLimit-Reset` is conventionally the unix second the window reopens.
 * @return {number | null} null when the value says nothing usable.
 */
const toWaitSeconds = (raw, perSecond = 1) => {
  if (raw === null || raw === undefined || raw === "") return null;

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    const value = numeric / perSecond;
    // Anything big enough to be a unix timestamp is one: a limit asking you to
    // wait 1.7 billion seconds is a misread header, not a policy.
    const seconds = value > 1e9 ? value - Date.now() / 1000 : value;
    return Math.max(0, Math.ceil(seconds));
  }

  const at = Date.parse(raw);
  return Number.isNaN(at) ? null : Math.max(0, Math.ceil((at - Date.now()) / 1000));
};

/**
 * The opaque reference the gateway hands a throttled client — `rl_4fb98800…`.
 *
 * The only thing about a rate limit a user can usefully report. It is not
 * derived from their email or IP, so it says nothing about who they are, and an
 * admin can look it up in `/admin?tab=rate-limits` and clear the counter.
 *
 * Deliberately not persisted with any hope of longevity: the id lives in the
 * gateway's memory, is stable only within the current window, and is gone on a
 * restart. It is stored alongside the ban so a reload still shows it, and the
 * gate says out loud that the email is the fallback when it has gone stale.
 */
const readRateLimitId = (data) => {
  const id = data?.rateLimitId ?? data?.rate_limit_id ?? null;
  return typeof id === "string" && id ? id : null;
};

/** The wait a *body* names, which is also the tell that a 4xx is a ban. */
const readBodyWait = (data) => {
  for (const key of ["retryAfter", "retry_after", "retryAfterSeconds"]) {
    const seconds = toWaitSeconds(data?.[key], BODY_RETRY_AFTER_PER_SECOND);
    if (seconds !== null) return seconds;
  }
  return null;
};

const readRetryAfter = (error) => {
  const response = error?.response;
  if (!response) return null;

  const header = headerOf(response);
  // Header first: it is the unambiguous one. `X-RateLimit-Reset` comes last
  // because plenty of APIs send it on every response as remaining-quota info,
  // so it is a fine source for the number but never the proof of a ban.
  return (
    toWaitSeconds(header("retry-after")) ??
    readBodyWait(response.data) ??
    toWaitSeconds(header("x-ratelimit-reset"))
  );
};

/**
 * Whether this failure is "come back later" rather than "not you".
 *
 * Cannot be a status check. The gateway answers a login ban with **403 and no
 * `Retry-After` header** — `{ success: false, error: "Forbidden - Too many
 * failed requests", retryAfter: 72000 }` — which is byte-for-byte the status a
 * plain "this account is not allowed in" would use. The body is the tell: a
 * response that says *when* to come back is a wait, not a refusal. 429 and a
 * `Retry-After` header still count, so this keeps working if the gateway ever
 * moves to the standard shape.
 */
const isRateLimit = (error) => {
  const response = error?.response;
  if (!response) return false;
  if (response.status === 429) return true;
  return readBodyWait(response.data) !== null || headerOf(response)("retry-after") != null;
};

/**
 * Exchanges the Privy access token for a backend session as soon as Privy is
 * authenticated. Never infers session state from `document.cookie`: the session
 * cookie is HttpOnly in production and a logged-out `session=` (empty value)
 * reads as "present". Every authenticated query must wait on `isSessionReady`.
 *
 * `isSessionSettled` is the other half of that: `isSessionReady` alone cannot
 * tell "the login is still in flight" from "the login failed and never will
 * succeed", so anything that shows a spinner until the session exists would
 * spin forever on a rejected token. Gate the *requests* on `isSessionReady` and
 * the *spinner* on `isSessionSettled`.
 *
 * `sessionStatus` is what a screen renders. A failed login never produces the
 * 401s you would expect — every gated query is simply `enabled: false`, so the
 * dashboard shows spinners that never resolve and nothing reaches the network.
 * The four failure states are told apart because the fix differs for each:
 *
 * - `rate-limited` — the caller must wait; `sessionError.retryAfterSeconds` says
 *   how long, defaulting to a minute when the response did not. Checked *before*
 *   `rejected` and by body rather than status, because the gateway bans with a
 *   403 that is otherwise identical to a refusal — see `isRateLimit`.
 *   `sessionError.rateLimitId` is the opaque reference the user quotes to
 *   support, which an admin clears from `/admin?tab=rate-limits`.
 * - `rejected` (4xx) — the backend refuses this user. Retrying can still help,
 *   because `getAccessToken()` renews an expired Privy token first, but it is
 *   not automatic and logging out is the realistic way through.
 * - `unavailable` (5xx / network) — the backend is down, the user is fine.
 *   Never log anyone out for this: a 30-second blip would cost every logged-in
 *   user their Privy session and the whole email/OTP flow to get it back.
 * - `anonymous` / `pending` — not a failure, just not there yet.
 *
 * There is no automatic recovery from any of them: `staleTime` is infinite and
 * every refetch/retry-on-* flag is off, so once this errors nothing calls the
 * gateway again until `retrySession()` does. That matters more than it looks —
 * the limit counts *failed* requests and bans for twenty hours, so an automatic
 * retry on focus, on remount or on reload is what turns one ban into a standing
 * one. The reload case needs storage rather than a flag, which is why a live ban
 * is written to localStorage and read back before the first login is attempted.
 *
 * @return {{
 *   isSessionReady: boolean,
 *   isSessionSettled: boolean,
 *   sessionStatus: "anonymous" | "pending" | "ready" | "rejected" | "rate-limited" | "unavailable",
 *   sessionError: { status: number | null, message: string | null, retryAfterSeconds: number | null, rateLimitId: string | null } | null,
 *   retrySession: () => void,
 *   isRetryingSession: boolean,
 * }}
 */
export function useSessionSync() {
  const { getAccessToken, authenticated, ready, user } = usePrivy();
  const { authenticate } = useAuth();

  // `undefined` until the effect below has read storage. localStorage cannot be
  // touched while rendering: the server would render the spinner and the client
  // the ban screen, which is a hydration mismatch. Holding `enabled` false for
  // that one tick costs nothing — Privy's `ready` takes far longer.
  const [ban, setBan] = useState(undefined);

  useEffect(() => {
    setBan(readFromLocalStorageWithExpiracy(BAN_STORAGE_KEY, null));
  }, []);

  const banSecondsLeft = ban?.until ? Math.ceil((ban.until - Date.now()) / 1000) : 0;
  const isBanned = banSecondsLeft > 0;

  const { isSuccess, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["session-sync", user?.id ?? null],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy access token unavailable");
      return authenticate(accessToken);
    },
    // The ban survives the tab on purpose. It counts *failed* requests and runs
    // to 20 hours, so an automatic login on every reload is how a long wait
    // becomes a permanent one. `refetch()` ignores `enabled`, so the button on
    // the gate still works — this only stops the silent attempt.
    enabled: ready && authenticated && ban !== undefined && !isBanned,
    // A 4xx means the token itself was rejected — replaying it just triples the
    // failed calls. Only retry the transient (network / 5xx) case.
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: 500,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // An errored login must not re-fire when anything above this remounts. The
    // ban counts failed requests, so a silent retry pays for itself in ban time.
    retryOnMount: false,
  });

  const status = error?.response?.status;
  const rateLimited = isError && isRateLimit(error);

  // Two spellings on purpose: the gateway answers `{ error }`, our own `/api/*`
  // routes answer `{ message }`. A network failure has no response at all, and
  // axios' own "Network Error" is not worth showing anyone.
  const responseMessage = error?.response?.data?.message ?? error?.response?.data?.error ?? null;
  const responseRateLimitId = readRateLimitId(error?.response?.data);

  // Persist a fresh ban so the next page load waits it out instead of spending
  // another failed request on it.
  useEffect(() => {
    if (!rateLimited) return;
    const seconds = readRetryAfter(error) ?? DEFAULT_RATE_LIMIT_WAIT_SECONDS;
    const next = {
      until: Date.now() + seconds * 1000,
      status: status ?? null,
      message: responseMessage,
      rateLimitId: responseRateLimitId,
    };
    writeToLocalStorageWithExpiracy(BAN_STORAGE_KEY, next, seconds * 1000);
    setBan(next);
  }, [rateLimited, error, status, responseMessage, responseRateLimitId]);

  // Derived from `isSuccess`/`isError` alone, never from `isFetching`: a manual
  // retry must leave the error screen up with a busy button rather than flashing
  // back to the spinner and returning to the same message a second later.
  const sessionStatus = (() => {
    if (!ready || !authenticated) return "anonymous";
    if (isSuccess) return "ready";
    // Before `isError`, because a ban read back from storage never ran a query
    // to fail — without this the gate would sit on its spinner all over again.
    if (rateLimited || isBanned) return "rate-limited";
    if (!isError) return "pending";
    return status >= 400 && status < 500 ? "rejected" : "unavailable";
  })();

  const sessionError = (() => {
    if (isError) {
      return {
        status: status ?? null,
        message: responseMessage,
        retryAfterSeconds: rateLimited
          ? (readRetryAfter(error) ?? DEFAULT_RATE_LIMIT_WAIT_SECONDS)
          : null,
        rateLimitId: rateLimited ? responseRateLimitId : null,
      };
    }
    if (isBanned) {
      return {
        status: ban.status,
        message: ban.message,
        retryAfterSeconds: banSecondsLeft,
        rateLimitId: ban.rateLimitId ?? null,
      };
    }
    return null;
  })();

  return {
    isSessionReady: isSuccess,
    // A ban settles the question as much as an error does: `useIsAdmin` waits on
    // this, and without it a banned admin spins instead of seeing the gate.
    isSessionSettled: isSuccess || isError || isBanned,
    sessionStatus,
    sessionError,
    // Wrapped, not passed through: `refetch(opts)` spreads its argument into the
    // fetch options, and every caller of this is an onClick handing it an event.
    retrySession: () => refetch(),
    isRetryingSession: isFetching,
  };
}
