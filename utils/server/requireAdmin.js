import { createHash } from "node:crypto";

/**
 * Admin gate shared by every route handler under `app/api/` that touches a
 * privileged credential — the app-api bot token, the Zerion key, the RPC URLs.
 *
 * ⚠️ SERVER ONLY. Never import this from a client component: it is the thing
 * standing between a public marketing site and every user's KYC.
 *
 * Authorisation is delegated to Cerebro rather than re-implemented here. The
 * caller's Privy token is replayed against `GET /system/health`, which checks
 * `ADMIN_ALLOWLIST_PRIVY_IDS` server-side. A 200 means the caller is an admin.
 * One allowlist, already maintained by the backend team, instead of a second
 * copy here that would silently drift out of sync.
 */

const CEREBRO_API = process.env.NEXT_PUBLIC_CEREBRO_API || "https://admin.hyxora.com/api/v1";

/** Verdicts are cached briefly so a tab full of panels costs one Cerebro call, not eight. */
const VERDICT_TTL_MS = 60_000;

/**
 * Privy rotates access tokens, so every refresh produces a new digest and a new
 * entry. Without a bound this Map would grow for the life of the server process.
 * Expired entries are swept on write, and the cap is a backstop for the case
 * where a burst arrives faster than entries expire.
 */
const MAX_VERDICTS = 500;
const verdicts = new Map();

/** Privy tokens are bearer credentials — key the cache by digest, never hold the raw token. */
const digest = (token) => createHash("sha256").update(token).digest("hex");

const remember = (key, ok) => {
  const now = Date.now();

  for (const [entryKey, entry] of verdicts) {
    if (entry.expiresAt <= now) verdicts.delete(entryKey);
  }

  // Map iterates in insertion order, so the first key is the oldest.
  while (verdicts.size >= MAX_VERDICTS) {
    verdicts.delete(verdicts.keys().next().value);
  }

  verdicts.set(key, { ok, expiresAt: now + VERDICT_TTL_MS });
};

/**
 * @param {string} token Caller's Privy access token.
 * @return {Promise<boolean>} Whether Cerebro accepts them as an allowlisted admin.
 */
const isAllowlistedAdmin = async (token) => {
  const key = digest(token);
  const cached = verdicts.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.ok;

  const response = await fetch(`${CEREBRO_API}/system/health`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // 5xx means Cerebro is unwell, not that the caller is unauthorised. Caching a
  // `false` for that would lock every admin out for a minute past the recovery.
  if (response.status >= 500) {
    throw new Error(`Cerebro respondió ${response.status}`);
  }

  const ok = response.ok;
  remember(key, ok);
  return ok;
};

/**
 * Gate a route handler.
 *
 * @param {Request} request
 * @return {Promise<Response | null>} A ready-to-return error `Response` when the
 * caller is not an allowlisted admin, or `null` when they are and the handler
 * should proceed.
 */
export const requireAdmin = async (request) => {
  const header = request.headers.get("authorization") ?? "";
  const privyToken = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!privyToken) {
    return Response.json({ error: "Falta el token de Privy." }, { status: 401 });
  }

  let allowed;
  try {
    allowed = await isAllowlistedAdmin(privyToken);
  } catch {
    return Response.json(
      { error: "No se pudo verificar el acceso contra Cerebro." },
      { status: 502 }
    );
  }

  if (!allowed) {
    return Response.json(
      { error: "Tu ID de Privy no está en ADMIN_ALLOWLIST_PRIVY_IDS." },
      { status: 401 }
    );
  }

  return null;
};
