# Rate Limiting — Frontend Integration Guide

Audience: the app/admin front-end. This explains how gateway rate limiting
behaves from the client's point of view, exactly what a `429` looks like, how
to handle it in the UI, and (for the admin dashboard) the operational
endpoints that let a support/admin user see and clear a throttle.

Everything here is served by **hyxora-gateway** — the front-end never talks to
the rate limiter directly, it just sees its HTTP responses.

---

## 1. How the limiter keys a request

The gateway allows **`RATE_LIMIT_MAX_REQUESTS` requests per rolling window**
(default **100 requests / 60 s**, config-controlled — the numbers are echoed
back in every response, don't hardcode them).

The "who" behind each counter is chosen automatically:

| Request situation | Counter is keyed on |
|---|---|
| Valid gateway JWT (logged-in user) | the user's **email** (normalized: trimmed + lowercased) |
| No token / invalid token / anonymous | the client **IP** |

What that means for you:

- A logged-in user gets their **own** quota. A noisy neighbor on the same
  office/NAT IP can't exhaust it, and one user hammering the API won't get
  the whole office blocked.
- Anonymous traffic (e.g. pre-login) is grouped by IP.
- The admin surface `/gateway/admin/*` is **never** rate-limited, so a
  rate-limited admin can always reach the recovery endpoints below.

Standard rate-limit headers are on (almost) every gateway response, so the UI
can show a "quota" indicator proactively, before hitting a wall:

```
RateLimit: limit=100, remaining=99, reset=60      # draft-7
RateLimit-Policy: 100;w=60
```

`remaining` counts down; when it reaches `0`, the next request returns `429`.

---

## 2. The 429 response — exact shape

When a client trips the limit, the gateway answers **HTTP 429** with a JSON
body and a `Retry-After` header:

```json
{
  "success": false,
  "error": "Too many requests",
  "rateLimitId": "rl_4fb9880074adb4f7",
  "retryAfterSeconds": 42,
  "resetAt": "2026-09-01T23:04:31.402Z",
  "message": "Rate limit of 100 requests per window reached. Quote reference rl_4fb9880074adb4f7 when asking support to reset it."
}
```

| Field | Use it for |
|---|---|
| `rateLimitId` | Opaque reference. Show it to the user and/or send it with a support ticket. **This is how an admin finds the right counter without ever seeing the user's IP or email.** |
| `retryAfterSeconds` | Whole seconds until the window resets. Use it to disable the call-to-action and count down. |
| `resetAt` | Absolute ISO timestamp of the reset, if you'd rather schedule a retry than count down. |
| `message` | Human-readable sentence — you can surface it verbatim, or roll your own copy from the fields above. |
| `Retry-After` (header) | Same as `retryAfterSeconds`, for generic HTTP tooling. |

**Response headers also present:** `RateLimit` (with `remaining=0`) and
`RateLimit-Policy`.

### About the `rateLimitId` lifetime

The id is **dynamic** — it is generated when the client is throttled and kept
in memory next to the counters. It:

- is **stable within the current window** (the same over-throttle client keeps
  getting the same id across repeated 429s),
- is **gone after the window rolls over**, and
- is **gone if the gateway restarts** (counters and ids are all in-memory).

It is deliberately *not* derived from the email/IP — an id conveys nothing
about who it belongs to. So: never try to parse it, persist it long-term, or
assume it resolves later. If you need a guaranteed recovery path (e.g. the id
already expired by the time support acts on it), use the user's **email**
instead — see §4.

---

## 3. Recommended client handling

Minimum viable handling in the API layer:

```ts
const res = await fetch(url, opts);

if (res.status === 429) {
  const body = await res.json().catch(() => null);
  const retryAfter = body?.retryAfterSeconds
    ?? Number(res.headers.get("Retry-After") ?? 0);

  // 1. Back off automatically before retrying (don't hammer).
  // 2. Surface a friendly message with the reference id for support.
  throw new RateLimitedError({ retryAfter, reference: body?.rateLimitId });
}
```

UI guidance:

- **Back off, don't retry immediately.** Wait `retryAfterSeconds` before the
  next call. Re-firing during a 429 does nothing but waste the window.
- **Show a countdown**, not just an error: "You're going too fast. Try again
  in 42s."
- **Show the reference id in the error/support flow** so the user can copy it
  into a ticket: `rl_4fb9880074adb4f7`.
- If you manage a token bucket from the `RateLimit` headers, you can warn the
  user *before* they get throttled ("you're running low on requests").

### Don't confuse these two 4xx responses

| Code | Meaning | Body marker |
|---|---|---|
| **429** | Rate limited — wait and retry | `error: "Too many requests"`, has `rateLimitId` |
| **403** | Fail-ban — this IP was blocked for probing unknown paths (bot/scanner behavior). Not a normal user path; usually needs an admin unban. | `error: "Forbidden - Too many requests to unknown paths"` |

A regular user hitting real endpoints should only ever see **429**, never
**403**. If a legitimate user somehow sees **403**, that's the fail-ban and
must be cleared by an admin (`/gateway/admin/ip-bans`), not the rate limiter.

---

## 4. Admin / support integration

These endpoints are for the **admin dashboard** (or ops via curl). All of them
live under `/gateway/admin/*` and require **both**:

1. a valid gateway JWT (`Authorization: Bearer <token>`), **and**
2. the caller's Privy ID present in `ADMIN_ALLOWLIST_PRIVY_IDS` *right now*
   (checked live, not from the role baked into the token).

A non-allowlisted caller gets `401` (no/invalid token) or `403` (logged in but
not an allowlisted admin).

> Note: `/gateway/admin/*` is served by the gateway itself and is **not**
> proxied to a backend. Base URL is the gateway origin, e.g.
> `https://gateway.hyxora.com`.

### 4.1 List who's consuming quota

```
GET /gateway/admin/rate-limits
```

```json
{
  "success": true,
  "count": 2,
  "windowMs": 60000,
  "limit": 100,
  "clients": [
    {
      "id": "rl_4fb9880074adb4f7",
      "limitedBy": "email",
      "target": "user@example.com",
      "used": 102,
      "limit": 100,
      "resetAt": "2026-09-01T23:04:31.402Z",
      "secondsUntilReset": 58
    },
    {
      "id": null,
      "limitedBy": "ip",
      "target": "203.0.113.7",
      "used": 61,
      "limit": 100,
      "resetAt": "2026-09-01T23:04:40.000Z",
      "secondsUntilReset": 49
    }
  ]
}
```

- This is the **admin-only** view, so it exposes the real `target` (email or
  IP). That data never appears in a client 429.
- `id` is the reference that client was last handed on a 429, or **`null`** if
  it hasn't been throttled yet this window (it's using quota but hasn't hit
  the limit).
- `limitedBy` tells you whether the counter is per-user (`email`) or per-IP.
- Sorted by `used` descending — the heaviest clients first.

### 4.2 Reset one client

```
POST /gateway/admin/rate-limits/reset
Content-Type: application/json
```

Send **exactly one** selector in the body:

```json
{ "email": "user@example.com" }
```
```json
{ "id": "rl_4fb9880074adb4f7" }
```
```json
{ "ip": "203.0.113.7" }
```

Success (`200`):

```json
{
  "success": true,
  "id": "rl_4fb9880074adb4f7",
  "limitedBy": "email",
  "target": "user@example.com",
  "hitsCleared": 102
}
```

Notes for the UI:

- **`email` is the robust path.** The counter key *is* the normalized email,
  so resetting by email works even if the user isn't logged in right now, and
  even if the `rateLimitId` already expired (window rolled over / restart).
  Case and surrounding spaces don't matter.
- **`id` is the privacy-preserving path** — use it when the user only knows
  the reference from their error screen. If the id is no longer valid (stale
  or from before a restart) you get a **`404`** whose message tells you to
  fall back to resetting by email.
- `hitsCleared: 0` means the reset succeeded but there was no live counter to
  clear (already fine). Not an error.
- With `email`: if there was no active counter **and** the email doesn't match
  any Privy user, you get **`404` "No Privy user found for that email"** —
  i.e. it's a typo guard, not a failed reset. A Privy outage never blocks a
  reset.

Error responses:

| Status | When |
|---|---|
| `400` | Body missing or has more/less than one of `email`/`id`/`ip` (or malformed) |
| `404` | `id` not currently active, or `email` matches no Privy user |
| `401` / `403` | Caller not authenticated / not an allowlisted admin |

`400` example:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [ { "message": "Provide exactly one of: email, id, ip" } ]
}
```

### 4.3 Reset everyone

```
POST /gateway/admin/rate-limits/reset-all
```

```json
{ "success": true, "clientsCleared": 2 }
```

Clears all counters (and all reference ids). Useful as a big red "unthrottle
everything" button in a staging/ops context.

---

## 5. Quick curl reference (admin)

```bash
GATEWAY=https://gateway.hyxora.com
TOKEN=<gateway JWT of an allowlisted admin>

# who's using quota
curl -s -H "Authorization: Bearer $TOKEN" "$GATEWAY/gateway/admin/rate-limits"

# clear a specific user by email (safest)
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}' \
  "$GATEWAY/gateway/admin/rate-limits/reset"

# clear by the reference id the user reported
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"rl_4fb9880074adb4f7"}' \
  "$GATEWAY/gateway/admin/rate-limits/reset"

# clear everything
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  "$GATEWAY/gateway/admin/rate-limits/reset-all"
```

---

## 6. TL;DR for the front-end

- On **429**, read `retryAfterSeconds` → back off + countdown in the UI;
  surface `rateLimitId` so the user can quote it to support.
- Never send or display the user's IP/email as a "reason" — the gateway
  already replaced it with the opaque id.
- Don't hardcode the limit/window — read them from the `RateLimit` headers or
  the 429 body.
- **Admin/support**: `POST /gateway/admin/rate-limits/reset` with `{email}`
  (robust) or `{id}` (privacy-preserving, may 404 if stale). Allowlisted
  admins only. `GET /rate-limits` to see current consumers.
