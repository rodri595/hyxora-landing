import { gatewayRoot } from "@/utils/gateway";
import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Server-side proxy for the Hyxora **app** backend, now reached through the
 * gateway's `/app` service rather than `app-api.hyxora.com` directly.
 *
 * The gateway move did **not** dissolve this route, and that is the thing to
 * understand before touching it. `/app` is the only service here that does not
 * take the session JWT: it authenticates with a shared *bot token* that unlocks
 * `/admin/users`, every user's portfolio and transactions, and
 * `/bank/{wallet}/kyc`. Shipping that token in a `NEXT_PUBLIC_` var would put it
 * in the JS bundle of a public marketing site, so it stays in `HYXORA_BOT_TOKEN`
 * and only this file ever reads it.
 *
 * So the request is authorised twice, on two different credentials: the caller
 * proves they are an allowlisted admin with their own session (`requireAdmin`),
 * and only then does this file spend the bot token on their behalf.
 */

const APP_API = `${gatewayRoot}/app`;

/**
 * Exact paths this proxy will forward. The bot token is far more powerful than
 * anything the admin UI needs, so the proxy is a keyhole, not a tunnel: adding a
 * panel means adding its endpoint here deliberately.
 *
 * Everything here is a GET — app-api's mutations are all `adminOnly` and the
 * admin UI is read-only by design.
 */
const ALLOWED_PATHS = new Set([
  "membership", // plan tiers: price, currency, Stripe product
  "admin/fees", // fee schema, per plan × operation
  "admin/tokens", // token whitelist
  "admin/vaults", // vault whitelist
  "admin/gas-limits", // per-chain gas ceilings (chain, maxGasGwei)
]);

/**
 * app-api answers errors as `{ message }` (and on staging bundles a stack trace).
 * Normalise to `{ error }` — what `QueryState` and the axios interceptor expect —
 * and drop the stack rather than forwarding server internals to the browser.
 *
 * @param {string} body Raw upstream body.
 * @param {number} status Upstream status.
 * @return {Response}
 */
const forwardError = (body, status) => {
  let message = `app-api respondió ${status}.`;
  try {
    const parsed = JSON.parse(body);
    message = parsed?.message || parsed?.error || message;
  } catch {
    // Non-JSON body (an HTML error page) — keep the generic message.
  }
  return Response.json({ error: message }, { status });
};

export async function GET(request, { params }) {
  const botToken = process.env.HYXORA_BOT_TOKEN;
  if (!botToken) {
    return Response.json(
      { error: "HYXORA_BOT_TOKEN no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const { path } = await params;
  const endpoint = (path ?? []).join("/");

  if (!ALLOWED_PATHS.has(endpoint)) {
    return Response.json({ error: `Endpoint no permitido: /${endpoint}` }, { status: 404 });
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { search } = new URL(request.url);

  let upstream;
  try {
    upstream = await fetch(`${APP_API}/${endpoint}${search}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "No se pudo contactar con app-api." }, { status: 502 });
  }

  const body = await upstream.text();
  if (!upstream.ok) return forwardError(body, upstream.status);

  return new Response(body, {
    status: 200,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
