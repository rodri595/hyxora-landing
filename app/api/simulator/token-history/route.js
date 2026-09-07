import { authErrorResponse, requireDid } from "@/lib/simulator/auth";
import { gatewayRoot } from "@/utils/gateway";

/**
 * Price history for one token in the simulator's catalogue.
 *
 * `/token/public-list` is public, but `/token/historical` is not: app-api
 * answers it only for the shared **bot token**, which may never reach the
 * browser. The admin proxy (`app/api/app-api/[...path]`) already spends that
 * token, but it is gated by `requireAdmin` on purpose — a simulator user is not
 * an admin — so the sparklines need their own door.
 *
 * This is that door, and it is a keyhole for the same reason the admin proxy is:
 *
 *   - the caller proves they hold a live Privy session (`requireDid` — the
 *     signature check, without the row read `requireUser` does, because this
 *     answer does not depend on who is asking), and only then is the bot token
 *     spent;
 *   - the upstream path is fixed — one endpoint, never a forwarded segment;
 *   - `address` must be a token the **public** catalogue actually lists, so the
 *     route cannot be turned into a general price oracle on our credential.
 *
 * The answers are cached in module memory because the alternative is one
 * upstream call per card per visitor, on a token we share with the mobile app.
 */

const APP_API = `${gatewayRoot}/app`;

// The `timeFrame` enum app-api documents. Anything else is rejected here rather
// than forwarded, so a typo is a 400 from us and not a 500 from them.
const TIME_FRAMES = new Set([
  "HOUR",
  "DAY",
  "WEEK",
  "MONTH",
  "3MONTHS",
  "6MONTHS",
  "YEAR",
  "5YEARS",
  "MAX",
]);

// A week of history is ~340 points. A sparkline 260px wide cannot draw them, and
// 17 cards × 340 points is a payload nobody reads — so thin them here, where it
// costs one pass, rather than in every card.
const MAX_POINTS = 60;

const CATALOGUE_TTL_MS = 5 * 60 * 1000;
const HISTORY_TTL_MS = 5 * 60 * 1000;

/** @type {{ at: number, keys: Set<string> } | null} */
let catalogue = null;
/** @type {Map<string, { at: number, body: string }>} */
const historyCache = new Map();

const cacheKey = (address, chainId, timeFrame) =>
  `${address.toLowerCase()}:${chainId}:${timeFrame}`;

/**
 * The set of `address:chainId` pairs the public catalogue lists, cached for the
 * same window the browser caches it. A miss is not fatal — it only means the
 * request is refused, which is the safe direction.
 *
 * @return {Promise<Set<string> | null>}
 */
const loadCatalogue = async () => {
  if (catalogue && Date.now() - catalogue.at < CATALOGUE_TTL_MS) return catalogue.keys;

  let response;
  try {
    response = await fetch(`${APP_API}/token/public-list`, { cache: "no-store" });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const payload = await response.json().catch(() => null);
  const tokens = payload?.data?.tokens || payload?.tokens;
  if (!Array.isArray(tokens)) return null;

  const keys = new Set(
    tokens
      .filter((token) => token?.address && token?.chainId !== undefined)
      .map((token) => `${String(token.address).toLowerCase()}:${token.chainId}`)
  );
  catalogue = { at: Date.now(), keys };
  return keys;
};

/**
 * Evenly spaced sample that always keeps the first and last point, so the curve
 * still starts and ends where the real series does.
 *
 * @param {Array<{ timestamp: number, value: number }>} points
 * @return {Array<{ timestamp: number, value: number }>}
 */
const downsample = (points) => {
  if (points.length <= MAX_POINTS) return points;
  const step = (points.length - 1) / (MAX_POINTS - 1);
  return Array.from({ length: MAX_POINTS }, (_, i) => points[Math.round(i * step)]);
};

export async function GET(request) {
  const botToken = process.env.HYXORA_BOT_TOKEN;
  if (!botToken) {
    return Response.json(
      { error: "HYXORA_BOT_TOKEN no está configurado en el servidor." },
      { status: 500 }
    );
  }

  try {
    await requireDid(request);
  } catch (err) {
    const denied = authErrorResponse(err);
    if (denied) return denied;
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";
  const chainId = searchParams.get("chainId") ?? "";
  const timeFrame = searchParams.get("timeFrame") ?? "WEEK";

  if (!address || !/^\d+$/.test(chainId)) {
    return Response.json({ error: "Faltan address o chainId." }, { status: 400 });
  }
  if (!TIME_FRAMES.has(timeFrame)) {
    return Response.json({ error: `timeFrame no soportado: ${timeFrame}` }, { status: 400 });
  }

  const known = await loadCatalogue();
  if (!known) {
    return Response.json({ error: "No se pudo validar el catálogo de tokens." }, { status: 502 });
  }
  if (!known.has(`${address.toLowerCase()}:${chainId}`)) {
    return Response.json({ error: "Token fuera del catálogo público." }, { status: 404 });
  }

  const key = cacheKey(address, chainId, timeFrame);
  const hit = historyCache.get(key);
  if (hit && Date.now() - hit.at < HISTORY_TTL_MS) {
    return new Response(hit.body, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  const query = new URLSearchParams({ address, chainId, timeFrame });
  let upstream;
  try {
    upstream = await fetch(`${APP_API}/token/historical?${query}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "No se pudo contactar con app-api." }, { status: 502 });
  }

  if (!upstream.ok) {
    // app-api answers `{ message }` and bundles a stack trace on staging. Keep
    // the message, drop the internals.
    const raw = await upstream.text();
    let message = `app-api respondió ${upstream.status}.`;
    try {
      message = JSON.parse(raw)?.message || message;
    } catch {
      // Non-JSON body — keep the generic message.
    }
    return Response.json({ error: message }, { status: upstream.status });
  }

  const payload = await upstream.json().catch(() => null);
  const history = payload?.data?.history;
  if (!Array.isArray(history)) {
    return Response.json({ error: "Respuesta de historial inesperada." }, { status: 502 });
  }

  const points = downsample(
    history.filter(
      (p) => Number.isFinite(Number(p?.value)) && Number.isFinite(Number(p?.timestamp))
    )
  );

  const body = JSON.stringify({ data: { history: points, timeFrame } });
  historyCache.set(key, { at: Date.now(), body });

  return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
}
