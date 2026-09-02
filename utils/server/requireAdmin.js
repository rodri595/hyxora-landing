import { createHash } from "node:crypto";
import { gatewayRoot } from "@/utils/gateway";

/**
 * Admin gate shared by every route handler under `app/api/` that touches a
 * privileged credential — the app-api bot token, the Zerion key, the RPC URLs.
 *
 * ⚠️ SERVER ONLY. Never import this from a client component: it is the thing
 * standing between a public marketing site and every user's KYC.
 *
 * Authorisation is delegated to the gateway rather than re-implemented here.
 * The caller's session JWT is replayed against `GET /admin/system/health`, which
 * checks `ADMIN_ALLOWLIST_PRIVY_IDS` server-side. A 200 means the caller is an
 * admin. One allowlist, already maintained by the backend team, instead of a
 * second copy here that would silently drift out of sync.
 *
 * Deliberately credential-agnostic: it forwards whatever `Bearer` arrived and
 * lets the gateway judge it, so it stays correct if the browser's credential
 * ever changes again.
 */

const HEALTH_URL = `${gatewayRoot}/admin/system/health`;

/** Verdicts are cached briefly so a tab full of panels costs one gateway call, not eight. */
const VERDICT_TTL_MS = 60_000;

/**
 * Sessions are re-minted on expiry, so every refresh produces a new digest and a
 * new entry. Without a bound this Map would grow for the life of the process.
 * Expired entries are swept on write, and the cap is a backstop for the case
 * where a burst arrives faster than entries expire.
 */
const MAX_VERDICTS = 500;
const verdicts = new Map();

/** Session JWTs are bearer credentials — key the cache by digest, never hold the raw token. */
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
 * @param {string} token Caller's Hyxora session JWT.
 * @return {Promise<boolean>} Whether the gateway accepts them as an allowlisted admin.
 */
const isAllowlistedAdmin = async (token) => {
  const key = digest(token);
  const cached = verdicts.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.ok;

  const response = await fetch(HEALTH_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  // 5xx means the gateway is unwell, not that the caller is unauthorised.
  // Caching a `false` for that would lock every admin out for a minute past the
  // recovery.
  if (response.status >= 500) {
    throw new Error(`El gateway respondió ${response.status}`);
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
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return Response.json({ error: "Falta el token de sesión." }, { status: 401 });
  }

  let allowed;
  try {
    allowed = await isAllowlistedAdmin(token);
  } catch {
    return Response.json(
      { error: "No se pudo verificar el acceso contra el gateway." },
      { status: 502 }
    );
  }

  if (!allowed) {
    return Response.json(
      { error: "Sesión no válida, o tu ID de Privy no está en ADMIN_ALLOWLIST_PRIVY_IDS." },
      { status: 401 }
    );
  }

  return null;
};
