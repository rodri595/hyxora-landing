# Hyxora Landing — project instructions

## Three backends, three axios clients — never mix them

This app talks to three separate APIs. Picking the wrong client is the single
easiest mistake to make here, so the rule is mechanical:

| Client | Base URL | Auth | Response shape |
|---|---|---|---|
| `@/utils/axios` (`apiClient`) | `NEXT_PUBLIC_HYXORA_API` | Session JWT cookie, auto re-auth on 401 | `data.data.<key>` |
| `@/utils/cerebroAxios` (`cerebroClient`) | `NEXT_PUBLIC_CEREBRO_API` | Raw Privy bearer token per request | raw JSON, no envelope |
| `@/utils/appApiAxios` (`appApiClient`) | `/api/app-api` (local proxy) | Privy bearer → proxy swaps in the bot token | `data.data` |
| `@/utils/monitoringAxios` (`monitoringClient`) | `/api/monitoring` (our own routes) | Privy bearer → `requireAdmin` | plain JSON, per route |

**Cerebro** (`admin.hyxora.com/api/v1`) is a cross-project analytics API built by
another team. It is read-only — every endpoint in `admin.md` is a GET — and it
authorises against its own server-side `ADMIN_ALLOWLIST_PRIVY_IDS`, which we
cannot check client-side. A non-allowlisted user just gets a 401; surface it.

**app-api** (`app-api.hyxora.com`) is the mobile/web *app* backend — a different
host from `NEXT_PUBLIC_HYXORA_API`, even though both expose `/admin/*` paths.
Its OpenAPI spec is at `/api-docs`. It authenticates with a shared **bot token**
(`Authorization: Bot <token>`) that unlocks `/admin/users`, every user's
portfolio and transactions, and `/bank/{wallet}/kyc`.

> That token must never reach the browser. It lives in `HYXORA_BOT_TOKEN`
> (server-only, no `NEXT_PUBLIC_`) and only `app/api/app-api/[...path]/route.js`
> reads it. That route is a **keyhole, not a tunnel**: it forwards an explicit
> allowlist of GET paths and nothing else, so adding a panel means adding its
> endpoint there deliberately. It authorises by replaying the caller's Privy
> token against Cerebro, keeping one allowlist rather than a second copy.

**`/api/monitoring/*`** are our own route handlers, for things no API serves:
service pings, the Solana fee-payer balance, the Zerion treasury scan and live
`eth_gasPrice`. They hold `ZERION_API_KEY`, the per-chain RPC URLs and
`SOLANA_RPC_URL` — all server-only, all gated by `requireAdmin`
(`utils/server/requireAdmin.js`), which defers to the same Cerebro allowlist.

> Every route there holds a credential, and that is the bar for adding one.
> `holdings-index` used to be the exception — a *fan-out* that replayed the
> caller's own Privy bearer against `/users` and `/users/{privyId}` to rebuild a
> join Cerebro didn't expose. `/holdings/holders` (2026-08-25) does that join in
> SQL upstream, so the route is gone. Take the lesson with it: a fan-out here is a
> workaround for a missing endpoint, and it is worth asking for the endpoint first.

> **Never import `utils/server/*` from a client component.** It is what stands
> between a public marketing site and every user's KYC.

### The rule

> **Everything under `app/(dashboard)/admin/_modules/cerebro/` calls the Cerebro
> API**, with two deliberate exceptions. Planes and Sistema each mark theirs with
> a «Disponible en Cerebro» divider separating the foreign panels above from the
> Cerebro ones below:
>
> - **Planes** — the first four panels are the plan *schema* (pricing, fee
>   matrix, whitelists). Cerebro serves no schema at all; its `/fees/*` report
>   revenue *collected*. They read app-api via `appApiClient`.
> - **Sistema** — the first three panels are live infrastructure checks (pings,
>   Solana RPC, Zerion). They read `/api/monitoring/*` via `monitoringClient`.
>   `SponsorshipPanel` straddles the line on purpose: the Solana half is ours
>   because it queries the RPC on request, the Pimlico half is Cerebro's because
>   the remaining credit can only come from an unfiltered op ledger.
>
> Balances used to be a third exception and no longer is. It expands a row into
> its holder list via `/holdings/holders`, fetched separately from `/holdings` and
> lazily — an unopened row costs nothing, and a failing holder query costs that
> list while leaving the aggregates standing. Two caveats worth keeping in the
> copy: the tables are capped at 100 rows by `/holdings`, so an asset below the
> cut has no row to expand; and `/holdings/holders` matches on symbol or vault
> name and **not on chain**, so a holder's `valueUsd` is their exposure across
> every network in `chains`, not just the one on the row.
>
> `Costos → GasLimitsPanel` still joins both: live prices from `/api/monitoring`,
> ceilings from app-api. Two requests on purpose, so one failing source doesn't
> blank the other.

Anywhere else in `cerebro/`, if the section needs data `admin.md` doesn't
document, **check app-api's spec before reaching for `apiClient`.** If neither
serves it, render the `PendingEndpoint` component naming the endpoint we'd need,
the way `TvlFreshnessPanel` and `UserActivationPanel` do.

Those asks do get answered: on 2026-08-25 six of them shipped as endpoints and
the panels were rewired (`/costs/recent`, `/fees/recent`, `/holdings/holders`,
`/users/trends`, `/system/sentry`, `/system/monitoring.pimlicoRunway`). Write the
`needs` copy as a request a person will read, not as a tombstone.

Never invent placeholder numbers for a missing endpoint. These panels show
balances, fees and error counts — a mocked figure is something someone acts on.

## Hooks live with their API

- `hooks/cerebro/` → Cerebro only, gated by `useCerebroAccess()` (`ready && authenticated`).
- `hooks/appApi/` → app-api via the proxy, gated by `useAppApiAccess()` (same
  precondition — the proxy does the real authorisation). Types in
  `hooks/appApi/types.js`. **Money is in minor units and fees in basis points**:
  `price: 1900` is €19.00, `feeBps: 20` is 0.20%.
- `hooks/admin/` → Hyxora backend admin endpoints, gated by the `roleNames.admin`
  check against `useGetUserInformation()` plus `isSessionReady`. Note
  `useGetFeeSchema`/`useGetWhitelist` here overlap with `hooks/appApi/` — they ask
  `api.hyxora.com` for same-named paths with guessed field names, and feed the
  separate `comisiones/` tab. Reconcile before adding a third copy.
- One hook per file, named `useGetX.jsx` / `useX.jsx`, JS not TS.
- Cerebro hooks carry JSDoc `@param`/`@return` with `@import` types from
  `hooks/cerebro/types.js`. Keep that up when adding endpoints.
- `staleTime` mirrors the cache TTL documented for that endpoint in `admin.md`.

## Admin module layout

```
_modules/
  shared/          Panel, StatCard, QueryState, PendingEndpoint, StatusBadge
  cerebro/         Cerebro API only — sistema/ redes/ planes/ …
  comisiones/      Fee schema + whitelists — Hyxora API (deliberately outside cerebro/)
  UsersModule.jsx  …and the other original admin tabs
```

Top-level tabs live in `components/AdminTabBar` + the `moduleMap` in
`admin/page.jsx`. Cerebro nests a second tab bar on `?tab=cerebro&sub=<id>`.

## Tables

Use `@/components/DataTable` — never hand-roll a table. For tables inside a
`Panel`, pass `bare dense enableSelection={false}`; the panel already provides
the card and title. Right-align numerics with `meta: { align: "right" }`. Totals
rows come from each column's `footer` plus `enableFooter`. Every flag defaults to
the original behaviour, so the older admin tables are unaffected.

`renderSubRow(rowData, row)` turns rows into expandable ones — a chevron column
appears and the returned node renders full-width underneath. `isRowExpandable`
narrows which rows get one. Both default off, so no existing table grows a column.

One caveat that bites: **`admin.md` is not always right about response shapes.**
`/holdings` is documented as `chainId` + `chainName` and actually sends `chain`,
the Zerion slug, because its source table stores the slug as text while every
other Cerebro table stores an integer `chain_id`. Resolve chains through
`cerebroChainLabel()` (`constants/cerebro.js`), which reads either — indexing
`cerebroChains` by `chainId` alone is what left «Redes» rendering "Chain undefined".

## Conventions

- Formatter is Biome (`npm run lint:fix`). **Scope it to files you changed** —
  running it over a whole directory reformats untouched files and pollutes the diff.
- Money/number/relative-time formatting: `@/utils/format`.
- Admin UI copy is in Spanish.
- `scrollbar-thin` / `scrollbar-thumb-*` classes appear around the codebase but
  are inert — there's no Tailwind scrollbar plugin. Scrollbars are styled globally
  in `app/globals.css`. Don't add them to new code.
