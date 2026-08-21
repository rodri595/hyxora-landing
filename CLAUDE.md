# Hyxora Landing — project instructions

## Two backends, two axios clients — never mix them

This app talks to two separate APIs. Picking the wrong client is the single
easiest mistake to make here, so the rule is mechanical:

| Client | Base URL | Auth | Response shape |
|---|---|---|---|
| `@/utils/axios` (`apiClient`) | `NEXT_PUBLIC_HYXORA_API` | Session JWT cookie, auto re-auth on 401 | `data.data.<key>` |
| `@/utils/cerebroAxios` (`cerebroClient`) | `NEXT_PUBLIC_CEREBRO_API` | Raw Privy bearer token per request | raw JSON, no envelope |

**Cerebro** (`admin.hyxora.com/api/v1`) is a cross-project analytics API built by
another team. It is read-only — every endpoint in `admin.md` is a GET — and it
authorises against its own server-side `ADMIN_ALLOWLIST_PRIVY_IDS`, which we
cannot check client-side. A non-allowlisted user just gets a 401; surface it.

### The rule

> **Everything under `app/(dashboard)/admin/_modules/cerebro/` calls the Cerebro
> API and nothing else.** No `apiClient`, no `hooks/admin/*`, no third API.

If the Cerebro section needs data that `admin.md` doesn't document, **do not
reach across to the Hyxora API for it.** Render the `PendingEndpoint` component
naming the endpoint we'd need, the same way `MonitoringPanel` and `SentryPanel`
do. `admin.md` at the repo root is the source of truth for what Cerebro serves.

Never invent placeholder numbers for a missing endpoint. These panels show
balances, fees and error counts — a mocked figure is something someone acts on.

## Hooks live with their API

- `hooks/cerebro/` → Cerebro only, gated by `useCerebroAccess()` (`ready && authenticated`).
- `hooks/admin/` → Hyxora backend admin endpoints, gated by the `roleNames.admin`
  check against `useGetUserInformation()` plus `isSessionReady`.
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

## Conventions

- Formatter is Biome (`npm run lint:fix`). **Scope it to files you changed** —
  running it over a whole directory reformats untouched files and pollutes the diff.
- Money/number/relative-time formatting: `@/utils/format`.
- Admin UI copy is in Spanish.
- `scrollbar-thin` / `scrollbar-thumb-*` classes appear around the codebase but
  are inert — there's no Tailwind scrollbar plugin. Scrollbars are styled globally
  in `app/globals.css`. Don't add them to new code.
