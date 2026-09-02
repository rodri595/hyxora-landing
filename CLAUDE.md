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
| `@/utils/gatewayAdminAxios` (`gatewayAdminClient`) | `NEXT_PUBLIC_HYXORA_API` + `/gateway/admin` | Session JWT as `Bearer`, one-shot re-auth on 401, **plus** the gateway's live Privy allowlist | plain JSON, `{ success, … }` |

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

**`/gateway/admin/*`** is the gateway's own admin surface — rate-limit counters
and IP bans — and is the one place `NEXT_PUBLIC_HYXORA_API` is used *outside*
`/founders`. It is served by the gateway itself and never proxied, so it sits
beside `/auth`. `docs/RATE_LIMITING.md` is the backend's own guide to it, kept
here unedited so it diffs cleanly against their next version.

> It wants **both** credentials: a valid gateway JWT *and* the caller's Privy ID
> in `ADMIN_ALLOWLIST_PRIVY_IDS`, checked live rather than read off the token —
> the same list Cerebro reads. So `useIsAdmin()` only decides who bothers to ask;
> a 401 (bad/absent JWT) or 403 (not allowlisted) is still the real answer and
> must be surfaced. The surface is exempt from rate limiting on purpose, which is
> the point: a throttled admin can still reach the endpoint that unthrottles.
>
> Two things about the counters shape every panel that reads them. They live in
> the gateway's **memory** and roll over each window, so the list is a live poll
> and never a cache. And `limit`/`windowMs` come back on every response because
> they are config-controlled — **read them, never hardcode 100/60s.**
>
> `hooks/admin/useResetIpBans` predates this client and still calls
> `/gateway/admin/ip-bans/reset` through `apiClient` with an absolute URL, from
> the DEV panel. If it grows a second caller, move it here.

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
> - **Sistema** — `sistema/monitoring/MonitoringPanel` is live infrastructure
>   checks (pings, Solana RPC, Zerion) and reads `/api/monitoring/*` via
>   `monitoringClient`. Its «Margen de subsidio» block straddles the line on
>   purpose: the Solana half is ours because it queries the RPC on request, the
>   Pimlico half is Cerebro's because the remaining credit can only come from an
>   unfiltered op ledger. Those two cards therefore render their own loading and
>   error states instead of sharing one `QueryState` — a Cerebro outage must not
>   blank a live SOL balance, and vice versa.
>
> Balances used to be a third exception and no longer is. **Its Top tokens rows**
> expand into a holder list via `/holdings/holders`, fetched separately from
> `/holdings` and lazily — an unopened row costs nothing, and a failing holder
> query costs that list while leaving the aggregates standing. Three caveats worth
> keeping in the copy: the tables are capped at 100 rows by `/holdings`, so an
> asset below the cut has no row to expand; `/holdings/holders` matches on symbol
> or position *name* and **not on chain**, so a holder's `valueUsd` is their
> exposure across every network in `chains`, not just the one on the row; and its
> `chains` are Zerion **slugs** ("base"), the same column `/holdings` sends as
> `chain`, whatever `admin.md` shows — compare them through `cerebroChainLabel()`,
> because matching the raw strings against a row's label is what left every
> expanded row rendering empty.
>
> **Top vaults rows do not expand**, and that is deliberate rather than pending: a
> vault row's `vaultName` is Zerion's protocol label ("Morpho Blue") whenever it
> decomposed the position, and `/holdings/holders` searches neither symbol nor name
> for it. Who is inside a vault needs an endpoint that filters on protocol.
>
> `Costos → GasLimitsPanel` still joins both: live prices from `/api/monitoring`,
> ceilings from app-api. Two requests on purpose, so one failing source doesn't
> blank the other.

Anywhere else in `cerebro/`, if the section needs data `admin.md` doesn't
document, **check app-api's spec before reaching for `apiClient`.** If neither
serves it, render the `PendingEndpoint` component naming the endpoint we'd need,
the way `resumen/MembershipPanel` and `costos/CostsByPlanPanel` do.

Those asks do get answered: on 2026-08-25 six of them shipped as endpoints and
the panels were rewired (`/costs/recent`, `/fees/recent`, `/holdings/holders`,
`/users/trends`, `/system/sentry`, `/system/monitoring.pimlicoRunway`), and on
2026-08-27 the three «Sistema» asks did too (`/system/tvl-freshness`,
`/system/unpriced-positions`, `/users/activation`). Write the `needs` copy as a
request a person will read, not as a tombstone — `docs/cerebro-sistema-endpoints.md`
is what those three were asked with, and it now records what came back.

Two names to watch on that newest batch. `/users/activation` calls the parked-funds
stage **`balanceNeverUsed`**, not the `fundedNeverUsed` the spec asked for, and that
name carries both the bucket count and the enumerated list. And `/system/health`'s
`tvl.freshness` is still a **max** — one user refreshing moves it — so the per-user
histogram and `oldest` exist only on `/system/tvl-freshness`. Read that one whenever
the question is how much of the TVL on Saldos and Usuarios is current.

**`/users/activation` is deployed but answers 500** — `a.createdAt.toISOString is
not a function`, its port having dropped the `createdAt: new Date(row.created_at)`
mapping `getUsersOverview` ends with. So `useGetUserActivation` assembles that
funnel here instead, classifying every row of a full `/users` sweep, and returns the
shape the endpoint documents so switching back is a one-hook change. It is a
workaround with an expiry date, not the pattern: **a fan-out is still the thing to
avoid**, and the only reason this one is in the tree is that the panel is otherwise
a 500 for as long as the fix takes.

Three traps it was written around, each worth knowing before touching anything that
counts users:

- **`?scope=active|inactive` is not the activity split a funnel wants.** It behaves
  like `last_active_at`, which every indexer hook stamps — the deployment op
  included — so `scope=inactive` drops people who have never touched the product.
  Reading the funnel off it showed 5 users with parked funds where there are 16.
- **Coerce every figure Cerebro sends.** `/users/stats`'s `activation` block arrives
  with quoted numerics, so a `typeof value === "number"` check nulls the lot: that is
  what left every bar on that panel at "—" while the row-level counts underneath
  rendered fine. Same lesson as `firstNumber()` in `_modules/shared/aggregate.js`.
- **Page until a page comes back empty, not until one comes back short.** The API is
  free to cap `pageSize` below what you asked for, and treating a 50-row answer to a
  200-row request as the end of the list reads a fifth of the table in silence.

What it does say out loud: `warnings` for a sweep that stopped short or a population
that disagrees with `/users/stats`, and `notes` for the activity proxy — `/users`
carries no activities and no ramp orders, so «usada» is a treasury fee or more than
one sponsored op, and someone whose only use was free and fee-less reads a stage low.

Never invent placeholder numbers for a missing endpoint. These panels show
balances, fees and error counts — a mocked figure is something someone acts on.

## Hooks live with their API

- `hooks/cerebro/` → Cerebro only, gated by `useCerebroAccess()` (`ready && authenticated`).
- `hooks/appApi/` → app-api via the proxy, gated by `useAppApiAccess()` (same
  precondition — the proxy does the real authorisation). Types in
  `hooks/appApi/types.js`. **Money is in minor units and fees in basis points**:
  `price: 1900` is €19.00, `feeBps: 20` is 0.20%.
- `hooks/admin/` → Hyxora backend admin endpoints, gated by the `roleNames.admin`
  check against `useGetUserInformation()` plus `isSessionReady`. It used to hold a
  `useGetFeeSchema`/`useGetWhitelist` pair asking `api.hyxora.com` for the same
  schema `hooks/appApi/` serves, on guessed paths (`/admin/tokens`, `/admin/vaults`)
  with guessed field names. They fed a separate «Comisiones» tab and were deleted
  along with it — **app-api is the one source for the fee schema and the whitelists**,
  read through `cerebro/planes/`. Don't add a second copy back.
- `hooks/gateway/` → the gateway's own `/gateway/admin/*` surface via
  `gatewayAdminClient`, gated by `useIsAdmin()`. Types in `hooks/gateway/types.js`.
  The reads poll (`refetchInterval`) instead of caching, because the counters are
  in-memory and expire with the window; the writes are `retry: false`, because a
  silent second attempt is not what a reset button should do.
- One hook per file, named `useGetX.jsx` / `useX.jsx`, JS not TS.
- Cerebro hooks carry JSDoc `@param`/`@return` with `@import` types from
  `hooks/cerebro/types.js`. Keep that up when adding endpoints.
- `staleTime` mirrors the cache TTL documented for that endpoint in `admin.md`.

## Admin module layout

```
_modules/
  shared/          Panel, StatCard, QueryState, PendingEndpoint, StatusBadge,
                   MeterBar (one labelled proportion), CompositionBar (how a
                   total splits across its biggest contributors), ChartTooltip
  cerebro/         Cerebro API only — sistema/ redes/ planes/ …
  UsersModule.jsx  …and the other original admin tabs
```

Top-level tabs live in `components/AdminTabBar` + the `moduleMap` in
`admin/page.jsx`. Cerebro nests a second tab bar on `?tab=cerebro&sub=<id>`.

**«Rate limits»** (`?tab=rate-limits`) is the support desk for a throttled user:
`/rate-limits` listed in a DataTable, a drawer per row, and a confirmation before
anything is cleared. Two details there are the feature rather than decoration.
The manual «resetear por referencia o email» box sits **outside** the query's
loading/error branch, because a reference that no longer resolves is exactly when
the list is least useful and the reset most needed — a failing `/rate-limits`
must not take the reset form down with it. And a row is reset by its **`target`**,
never by its `id`: the API takes exactly one selector and 400s on two, the target
*is* the counter's key, and the id can expire between the poll and the click.
`SessionGate` is the other half — it shows the `rateLimitId` from a 429 so the
user has something to quote that identifies nobody.

To produce a 429 on purpose, the DEV panel's «Probar rate limit» fires N requests
at a chosen endpoint (`hooks/devtools/useRateLimitProbe.jsx`). Its target list is
closed for a reason: **every path must be one that actually exists**, because the
gateway fail-bans an IP that probes *unknown* paths with a 403 only an admin can
clear, and **nothing may touch `/auth/login`**, whose failures feed the separate
twenty-hour login ban. It uses bare `axios`, never `apiClient` — that instance
re-authenticates on 401, so a run against a 401 endpoint would become a run
against `/auth/login`.

## Tables

Use `@/components/DataTable` — never hand-roll a table. For tables inside a
`Panel`, pass `bare dense`; the panel already provides the card and title.
Right-align numerics with `meta: { align: "right" }`. Totals rows come from each
column's `footer` plus `enableFooter`. Every flag defaults to the original
behaviour, so the older admin tables are unaffected.

**Selection follows what a row *is*, not how long the table is.** A row-level
table — one row per user, op, fee, holding, issue, whitelist entry — keeps the
checkbox column, because picking a handful of records and exporting just those is
a real thing to want, and export already prefers the selection over the filtered
rows. A group-by table — one row per chain, plan or operation type, a dozen rows
under a totals footer — passes `enableSelection={false}`: there is no workflow
where you export three of eight chains, and the column costs width the numbers
need. Clicking anywhere on a row toggles it, except on a link, button or input.

When `enableSelection` meets `manualPagination`, pass `getRowId`. Selection is
keyed by row id and the default id is the row's *index*, so without it a tick
stays on "the third row" while the rows underneath it change — page forward and
you export somebody else. `usuarios/UsersTablePanel` keys on `privyId`. Selection
is still per-page there, because the browser only ever holds one page; the panel
says so in its footnote rather than exporting a subset in silence.

`renderSubRow(rowData, row)` turns rows into expandable ones — a chevron column
appears and the returned node renders full-width underneath. `isRowExpandable`
narrows which rows get one. Both default off, so no existing table grows a column.

## Mobile, and `data-lenis-prevent`

Lenis smooth-scrolls the document from `app/providers.jsx`, and it owns wheel and
touch everywhere. **Anything that scrolls inside itself needs `data-lenis-prevent`**
or the gesture is swallowed and the element never moves: DataTable's wrapper, the
Cerebro tab body, both tab strips, `SelectDropdown`'s menu, the column menu, and
every `<pre>` with a `max-h`. It is not styling — without it a wide table simply
cannot be scrolled sideways on a phone. `Tabs` forwards unknown props for exactly
this reason.

`Panel`'s header stacks below `sm` and its `action` row goes full-width, with
`[&>div]` rules reaching into the wrapper each caller passes. That is deliberate:
every panel hands `action` a `flex` row, and a `shrink-0` filter beside
«Actualizar» beside a title is wider than a phone — one fixed-width dropdown in a
Costos header is what made whole tabs scroll sideways. So **a control in a panel
header is elastic, never `shrink-0` at a fixed width** (`costos/FilterSelect` is
the pattern), and a long label in a legend row gets `min-w-0 truncate` so it
ellipses instead of shoving the numeric columns off the card.

One caveat that bites: **`admin.md` is not always right about response shapes.**
`/holdings` is documented as `chainId` + `chainName` and actually sends `chain`,
the Zerion slug, because its source table stores the slug as text while every
other Cerebro table stores an integer `chain_id`. Resolve chains through
`cerebroChainLabel()` (`constants/cerebro.js`), which reads either — indexing
`cerebroChains` by `chainId` alone is what left «Redes» rendering "Chain undefined".

`/fees/diagnostics` is the same story on the fee side: documented as `operation` +
`feesUsd`, it arrives with the SQL spellings its port kept — the ones `/fees/recent`
publishes for the very same treasury rows (`operationType`, `amountUsd`) — plus a
`transfers` count when the server grouped for us. Reading only the documented names
is what left «Diagnóstico de etiquetado» showing a single «—» bucket at $0.
`ingresos/FeeTaggingPanel` normalises every spelling in `toTagRow()` and groups only
when the response is row-level.

Its «Chain IDs Reference» is wrong too: it lists HyperEVM as **13381**, and the id
the indexers actually stamp is **999** (`hyxora-admin-main/src/lib/chains.ts` is the
registry both they and Cerebro read). Copying the doc's number is what left «Por
cadena» rendering "Chain 999". Worth reporting upstream — the doc is unedited here
on purpose, so it still diffs cleanly against the Cerebro team's next version.

Two more things that registry settles, both of which bit «Ingresos por cadena»:

- **Solana arrives under two different ids.** `101` on the row-level feeds
  (`/costs/recent`, `/fees/recent`), which is the cluster number the app backend
  stamps; **1399811149** on anything grouping `treasury_fees.chain_id`, which is the
  `SOLANA_CHAIN_ID` sentinel the old indexer wrote to keep non-EVM rows out of every
  EVM aggregation. `cerebroChains` maps both.
- **Ethereum (id 1) is deprecated but still in the data.** The app stopped routing
  through it; its history stayed in the table, and Cerebro's group-by endpoints do
  not filter it the way the old dashboard's `EXCLUDED_CHAIN_IDS` did.

So **a per-chain table renders `cerebroActiveChains`, not the response.** Group-by
endpoints emit no row at all for a chain with no data — which is what dropped Polygon
off «Ingresos por cadena» while Ethereum's history added a "Chain 1" row to it. Look
each API row up by id, show `$0` for the quiet chains, and the table matches the old
dashboard's, which iterates `ALL_CHAINS` for exactly this reason.

That panel also reads `userFeesUsd`, which admin.md does not document at all — the
port kept the query's `user_fees_usd` (sender is a known user Safe, `nft_sale` rows
excluded). `totalUsd` next to it also counts team funding and internal swaps, so it
is not "comisiones de usuario" however tempting the name. The column drops out if the
field ever stops arriving, rather than showing the total under the wrong header.

**Check the old dashboard's window before porting a panel, not just its columns.**
`getTreasuryByToken` ran with no `sinceDays` at all — lifetime — so «Ingresos por
cadena × token» read at the tab's `REVENUE_DAYS` was quietly missing every (cadena,
token, operación) tuple whose last fee predates 30 days, which is most of Base's and
BSC's list. Cerebro always applies a window here and caps it at 365, so the panel
defaults to that and offers the shorter ones. A missing row looks identical to a
chain with no revenue; only the old table says which it is.

`getOpTagDiagnostics` is the second one — `earnings/page.tsx` calls it as
`{ limit: 20 }`, and the query only adds its `block_timestamp >=` clause when a
`sinceDays` is passed. «Diagnóstico de etiquetado» read at `REVENUE_DAYS` was a
strict subset of the old table: same buckets, smaller counts, and **not one
`hyxora`-sourced row left**, because those tags come from the backend activity
cache and none of the rows it tagged land inside the last month. Same fix, same
365-day ceiling.

That panel's `source` is `case when operation_reason like 'hyxora:%'` in SQL, so it
is `hyxora` or `heuristic` and never null. Defaulting a row with no `source` to
`"heuristic"` — which is what the panel used to do — files every backend-tagged
bucket under the heuristic ladder and hides the split the column exists to show.
Render "—" and say the field is missing.

## Conventions

- Formatter is Biome (`npm run lint:fix`). **Scope it to files you changed** —
  running it over a whole directory reformats untouched files and pollutes the diff.
- Money/number/relative-time formatting: `@/utils/format`.
- Admin UI copy is in Spanish.
- `scrollbar-thin` / `scrollbar-thumb-*` classes appear around the codebase but
  are inert — there's no Tailwind scrollbar plugin. Scrollbars are styled globally
  in `app/globals.css`. Don't add them to new code.
