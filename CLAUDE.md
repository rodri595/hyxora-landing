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

> `holdings-index` is the one route there that holds no credential. It is a
> *fan-out*: it replays the caller's own Privy bearer against Cerebro's `/users`
> and `/users/{privyId}` to rebuild a join Cerebro doesn't expose (see Balances
> below). It lives server-side because the sweep is one request per user with a
> balance — ~100 parallel XHRs if a panel did it — and because the result is one
> cached index rather than a query per lookup. Add a route here for the same two
> reasons, not just to hide a key.

> **Never import `utils/server/*` from a client component.** It is what stands
> between a public marketing site and every user's KYC.

### The rule

> **Everything under `app/(dashboard)/admin/_modules/cerebro/` calls the Cerebro
> API**, with three deliberate exceptions. Planes and Sistema each mark theirs
> with a «Disponible en Cerebro» divider separating the foreign panels above from
> the Cerebro ones below; Balances mixes both sources inside one panel instead:
>
> - **Planes** — the first four panels are the plan *schema* (pricing, fee
>   matrix, whitelists). Cerebro serves no schema at all; its `/fees/*` report
>   revenue *collected*. They read app-api via `appApiClient`.
> - **Sistema** — the first three panels are live infrastructure checks (pings,
>   Solana RPC, Zerion). They read `/api/monitoring/*` via `monitoringClient`.
> - **Balances** — expanding a row of the tokens table lists who holds it, from
>   `/api/monitoring/holdings-index`. `/holdings` is an aggregate with no way to
>   ask who is behind a number. The two sources are fetched separately on purpose,
>   so a failing sweep costs the holder lists and leaves Cerebro's numbers standing.
>   Note the tokens table is capped at 100 rows by `/holdings`, so an asset below
>   that cut has no row to expand and no other way to reach its holders.
>
> `Costos → GasLimitsPanel` also joins both: live prices from `/api/monitoring`,
> ceilings from app-api. Two requests on purpose, so one failing source doesn't
> blank the other.

Anywhere else in `cerebro/`, if the section needs data `admin.md` doesn't
document, **check app-api's spec before reaching for `apiClient`.** If neither
serves it, render the `PendingEndpoint` component naming the endpoint we'd need,
the way `SponsorshipPanel` and `SentryPanel` do.

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
