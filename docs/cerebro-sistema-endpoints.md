# Cerebro API — three endpoints the «Sistema» tab still needs

Written for the Cerebro backend, in the style of `admin.md` so it can be pasted
straight into it once shipped. Same pattern as the six endpoints added on
2026-08-25 (`/costs/recent`, `/fees/recent`, `/holdings/holders`, `/users/trends`,
`/system/sentry`, `/system/monitoring.pimlicoRunway`).

**All three read tables Cerebro already owns.** No new indexer, no new vendor key,
no writes. Every query below is either lifted verbatim from
`hyxora-admin-main/src/lib/queries.ts` or built from columns that file already
reads — the old dashboard renders all three today by querying Postgres directly,
which the landing admin cannot do.

Why it can't be worked around client-side:

| Panel | What v1 gives today | What's missing |
|---|---|---|
| Actualidad de cartera (TVL) | `/system/health` → one global `tvl.freshness` timestamp + `usersWithTvl` / `usersWithoutTvl` | the per-user age histogram, and how old the oldest user is |
| Posiciones sin precio | `/system/health` → `system.tvlErrors`, documented only as `[]` | which symbols failed to price and how many users each one costs |
| Activación de usuarios | `/users/stats` → `activation` with four overlapping totals | mutually-exclusive funnel stages, and the list of users holding funds who never used the app |

Rebuilding any of them by fanning out over `/users` would be ~450 requests per
page load for data one `GROUP BY` answers. That is the same reasoning that retired
`holdings-index` when `/holdings/holders` shipped.

---

## Estado: los tres shipearon — 2026-08-27

El equipo de Cerebro los publicó los tres (`CEREBRO_ENDPOINTS.md`, Telegram,
2026-08-27) y ya no queda ningún «Pendiente de endpoint» en la pestaña. Dos se leen
tal cual; **`/users/activation` responde 500** y su panel se calcula en el propio
front mientras tanto — el bug está descrito justo debajo de esta sección.

Lo que llegó distinto de lo que se pide más abajo — el resto coincide:

| Se pidió | Se publicó |
|---|---|
| `/system/tvl-freshness` | idéntico a la respuesta de abajo, caché 1 minuto |
| `/system/unpriced-positions` | la forma **partida**: `{ symbol, chain, users }`, con `chain` como slug de Zerion o `null`. La variante `"SYMBOL@chain"` no se usó |
| `/users/activation` | mismo embudo, pero el tramo de fondos aparcados **y su lista se llaman `balanceNeverUsed`**, no `fundedNeverUsed` |

Dos reglas de `/users/activation` cambiaron respecto a lo que se pedía, y las dos
hacen falta para leer el embudo:

- **El umbral de saldo es $0.50, no $0.** `walletNotDeployed` y `deployedNeverUsed`
  exigen TVL ≤ $0.50; `balanceNeverUsed` es > $0.50. El polvo que deja un depósito
  fallido ya no asciende a nadie al tramo con fondos.
- **«Desplegada» es una UserOp patrocinada**, que es justo lo que este documento
  proponía y dejaba a confirmar. Queda confirmado: la primera op patrocinada *es* el
  despliegue. La señal de actividad sigue siendo `hyxora_activities` +
  `hyxora_ramp_orders`, nunca `last_active_at`.

Ninguna de las dos alternativas que se ofrecen abajo se tomó: `system.tvlErrors`
sigue sin documentar — se lee `/system/unpriced-positions` en su lugar — y
`/users/stats` conserva intactos sus cuatro contadores solapados, así que nada de lo
que los leía se rompió.

Una cosa que comprobar antes de darlo por bueno en producción: `CEREBRO_ENDPOINTS.md`
da como base `https://admin.wafflemakr.xyz/api/v1`, y `NEXT_PUBLIC_CEREBRO_API`
apunta a `https://admin.hyxora.com/api/v1`. Es la misma app en otro despliegue: si
las tres rutas dan 404 ahí, es que todavía no se han promocionado.

> **Desactualizado desde 2026-09-02.** Cerebro se sirve ahora por el gateway en
> `/admin` (`NEXT_PUBLIC_HYXORA_API` + `/admin`) y con el JWT de sesión de siempre;
> ni `NEXT_PUBLIC_CEREBRO_API` ni el token de Privy por petición existen ya. Los
> hosts que aparecen arriba y más abajo son el registro de cómo se pidieron y se
> probaron estos endpoints, no la ruta por la que se llaman hoy. Las rutas en sí
> (`/users/activation`, `/system/tvl-freshness`, …) no cambiaron: cuelgan de
> `/admin`.

Las dos correcciones del final del documento quedaron reconocidas: HyperEVM es 999 y
`/holdings` manda el slug de Zerion.

---

## Open bug — `GET /users/activation` returns 500

Live on `admin.hyxora.com` since 2026-08-27, failing on every call:

```
500  a.createdAt.toISOString is not a function
```

It is the endpoint, not auth: `/users/stats` answers fine on the same host with the
same token, and the three new routes all return `401 unauthorized` unauthenticated
the way every other v1 route does.

The `a` says comparator — something sorts or serialises the `balanceNeverUsed` list
and calls `.toISOString()` on a `createdAt` that is still the raw Postgres string.
`getUsersOverview` in `hyxora-admin-main/src/lib/queries.ts` is the one place that
gets this right: its mapper ends `createdAt: new Date(row.created_at)`. The port
looks to have kept the consumer and dropped that mapper. Either wrap the value
before sorting, or emit the string as-is — the response documents `createdAt` as ISO
8601, which a Postgres `timestamptz` already serialises to.

Until it is fixed the landing admin sweeps `/users` in full and classifies each row
itself (`hooks/cerebro/useGetUserActivation.jsx`). Three findings from doing that,
all of them things `admin.md` could say and currently does not:

1. **`?scope=active|inactive` is not the funnel's activity split.** Filtering the
   sweep through `scope=inactive` returned 5 of the 16 users who have funds parked in
   a Safe they never used — it drops people whose wallet was merely deployed. It
   behaves like `last_active_at`, the column this spec's bucket rules single out as
   the wrong signal for exactly that reason. Whatever it is, please document the
   predicate; if there is also a flag for real product use (`hyxora_activities` /
   `hyxora_ramp_orders`), that is the one this panel wants, ideally as a field on the
   `/users` row.
2. **`/users/stats` sends `activation` as quoted numerics.** `{"total":"448"}`
   rather than `448`, which any strict numeric check reads as absent. Worth either
   casting server-side or documenting.
3. **`/users` rows carry `safeAddress`**, which the documented response does not
   mention — it comes straight from `getUsersOverview`, and the «sin wallet» bucket
   and the Safe column both read it, so please keep it. Same question for that
   mapper's `costOps` and `feeTxs`: if the port kept them we would rather count
   sponsored ops than infer a deployment from `costUsd > 0`. Tell us which of the
   three actually ship and we will document them on our side.

---

## 1. GET /system/tvl-freshness

How long ago each user's Zerion portfolio was last refreshed, bucketed. Answers
"are the TVL figures on Saldos / Usuarios current, or am I looking at yesterday?".

Only users with a real Safe are counted — a Privy account that never created a
wallet has nothing to refresh, and would otherwise sit permanently in the "never"
bucket and make it look broken.

### Response

```json
{
  "fresh1h": 28,
  "within1d": 392,
  "over1d": 0,
  "never": 0,
  "total": 420,
  "newest": "2026-08-26T09:58:00.000Z",
  "oldest": "2026-08-25T12:04:00.000Z"
}
```

The four buckets are mutually exclusive and sum to `total`.

| Field | Meaning |
|---|---|
| `fresh1h` | `tvl_refreshed_at > now() - interval '1 hour'` |
| `within1d` | refreshed between 1 hour and 1 day ago |
| `over1d` | refreshed more than 1 day ago — **stale**, the UI warns on this |
| `never` | `tvl_refreshed_at is null` |
| `total` | users with at least one Safe address |
| `newest` / `oldest` | max / min `tvl_refreshed_at` (oldest ignores nulls), ISO 8601 or `null` |

### Query — `getTvlFreshness()`, unchanged

```sql
select
  count(*) filter (where tvl_refreshed_at > now() - interval '1 hour')::int as fresh_1h,
  count(*) filter (where tvl_refreshed_at <= now() - interval '1 hour'
                     and tvl_refreshed_at > now() - interval '1 day')::int as within_1d,
  count(*) filter (where tvl_refreshed_at <= now() - interval '1 day')::int as over_1d,
  count(*) filter (where tvl_refreshed_at is null)::int as never_refreshed,
  count(*)::int as total,
  max(tvl_refreshed_at) as newest,
  min(tvl_refreshed_at) filter (where tvl_refreshed_at is not null) as oldest
from users
where exists (
  select 1
  from jsonb_each(safe_addresses) _c(_k, _addrs),
       jsonb_array_elements_text(_addrs) _a
)
```

That `exists (...)` is `HAS_REAL_SAFE` in `queries.ts:128`.

**Cache:** 1 minute, same as `/system/health`.

### Note on the refresh buttons

The old page pairs this card with **Actualizar activos** / **Actualizar todos**
(`SyncButton kinds="tvl"`), which trigger the TVL refresh cron. Those are writes,
and every endpoint in `admin.md` is a GET — so **we are not asking for them**. The
landing admin renders the buckets read-only and says where to trigger a refresh.
If a write surface is ever in scope, say so and we will spec it separately.

---

## 2. GET /system/unpriced-positions

Positions Zerion returns but could not price (`value: null` / `price: 0`) on the
last refresh. They contribute **$0 to TVL**, so every affected user's balance is
understated — almost always a dropped vault or token price feed. Nothing else in
the dashboard surfaces this: the position is dropped without a trace.

The source column is `users.tvl_unpriced_held`, a `jsonb` array of
`"SYMBOL@chain"` strings, `NULL` when everything priced cleanly.

### Response

```json
{
  "totalUsers": 3,
  "symbols": [
    { "symbol": "wstETH@base", "users": 2 },
    { "symbol": "sDAI@polygon", "users": 1 }
  ]
}
```

`symbols` is ordered `users desc, symbol asc`. Empty array when nothing failed.

If splitting the `SYMBOL@chain` string server-side is cheap, `{ "symbol": "wstETH",
"chain": "base", "users": 2 }` is better still — the chain half is a Zerion slug,
the same spelling `/holdings` sends as `chain`, so the UI can resolve it through
the helper it already uses for that. Either shape works; tell us which you shipped.

### Query — `getUnpricedHoldings()`, unchanged

```sql
-- totalUsers
select count(*)::int as n
from users
where tvl_unpriced_held is not null
  and jsonb_array_length(tvl_unpriced_held) > 0;

-- symbols
select sym as symbol, count(distinct privy_id)::int as users
from users, jsonb_array_elements_text(tvl_unpriced_held) sym
where tvl_unpriced_held is not null
group by sym
order by users desc, sym asc;
```

**Cache:** 5 minutes.

### Alternative: document `system.tvlErrors` instead

If `/system/health`'s `system.tvlErrors` already carries this, we do not need a new
endpoint — just its row shape in `admin.md`. It is documented today only as `[]`,
so the panel cannot read it without guessing field names, and guessing is how
«Redes» ended up rendering "Chain undefined". One or the other, not both.

---

## 3. GET /users/activation

How far each user got in onboarding. `/users/stats` already returns an `activation`
block, but its four counters (`total`, `withWallet`, `active`, `withTvl`) overlap
in ways the response does not state, so they cannot be turned into stages without
assuming an ordering. This asks for the same funnel as **mutually-exclusive
buckets that sum to `total`**, plus the one list that makes it actionable.

### Response

```json
{
  "total": 447,
  "buckets": {
    "noWallet": 27,
    "walletNotDeployed": 286,
    "deployedNeverUsed": 42,
    "fundedNeverUsed": 16,
    "active": 76
  },
  "fundedNeverUsed": [
    {
      "privyId": "did:privy:abc123",
      "email": "user@example.com",
      "tvlUsd": 105.03,
      "safe": "0x7b0c...44cc",
      "createdAt": "2026-05-14T10:00:00.000Z"
    }
  ]
}
```

`buckets` must sum to `total`. `fundedNeverUsed` is the `fundedNeverUsed` bucket
enumerated, ordered `tvlUsd desc` — these are people whose money is parked in a
Safe they have never used (the May EURC promo left a cohort of them), so it is a
support/outreach list, not a statistic. `safe` is the user's primary Safe address,
full and unabbreviated; the UI truncates and links it.

### Bucket definitions

Evaluated **top to bottom, first match wins** — that is what makes them exclusive:

| Bucket | Rule |
|---|---|
| `noWallet` | `safe_addresses` has no address (`not HAS_REAL_SAFE`) — signed up with Privy, abandoned before creating a wallet |
| `active` | has a row in `hyxora_activities` **or** `hyxora_ramp_orders` for any of their Safes — actually used the product |
| `fundedNeverUsed` | latest `daily_tvl_by_user.total_usd > 0` |
| `deployedNeverUsed` | has a row in `sponsored_user_ops` where `sender` is one of their Safes |
| `walletNotDeployed` | everything else — a Safe address exists but nothing was ever done with it |

**One decision needs your confirmation.** `users` has no `deployed` column, and
`safe_addresses` holds *predicted* addresses whether or not the contract exists
on-chain. The rule above treats **"deployed" as "has at least one sponsored
UserOp"**, on the reasoning that a 4337 Safe stays counterfactual until its first
UserOperation deploys it — so the first sponsored op *is* the deployment. If the
app deploys Safes some other way (an explicit deploy tx, a factory call outside
the paymaster), this bucket is wrong, and we would much rather have your rule than
run an `eth_getCode` sweep over ~450 addresses on every page load.

Deliberately **not** used as the activity signal: `users.last_active_at`. Its
column comment says it is set by *every* indexer hook including `userops-safe`, so
a Safe that only ever emitted its deployment op would count as active and
`deployedNeverUsed` would always be 0. `hyxora_activities` + `hyxora_ramp_orders`
are product use; a sponsored op is not.

Also note the join: `hyxora_activities.wallet` and `hyxora_ramp_orders.wallet`
match the Safe address, and every consumer lowercases `safe_addresses`
(`collectSafes`), so compare lowercased. `hyxora_activities.user_privy_id` is
nullable, so it cannot be the only join key.

**Cache:** 5 minutes, same as `/users/stats`.

### Or: extend `/users/stats`

Adding `activation.buckets` and `activation.fundedNeverUsed` to the existing
`/users/stats` response is equally fine and saves a request — the panel already
calls it. Keep the four legacy counters alongside so nothing that reads them breaks.

---

## Where these land

| Endpoint | Panel |
|---|---|
| `/system/tvl-freshness` | `cerebro/sistema/TvlFreshnessPanel` |
| `/system/unpriced-positions` | `cerebro/sistema/UnpricedPositionsPanel` |
| `/users/activation` | `cerebro/sistema/UserActivationPanel` |

Los tres renderizaban un bloque «Pendiente de endpoint» con exactamente estas rutas;
desde el 2026-08-27 leen el endpoint real y cada panel cayó por su cuenta, sin
depender de los otros dos.

## Two corrections to `admin.md` while you are in there

Both cost us a rendering bug, and both are still wrong in the copy we hold:

1. **Chain IDs Reference lists HyperEVM as `13381`.** The id the indexers actually
   stamp is **`999`** (`hyxora-admin-main/src/lib/chains.ts` is the registry both
   sides read). Copying the doc's number left «Por cadena» rendering "Chain 999".
2. **`/holdings` is documented as `chainId` + `chainName`** and actually sends
   `chain`, the Zerion text slug — its source table stores the slug where every
   other table stores an integer `chain_id`. `/holdings/holders` sends the same.
