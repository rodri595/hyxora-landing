# Hyxora Admin Dashboard API v1

**Base URL:** `https://admin.hyxora.com/api/v1`

**Authentication:** All endpoints require a Privy bearer token in the `Authorization` header.

```
Authorization: Bearer <privy-access-token>
```

The token must belong to a user in the `ADMIN_ALLOWLIST_PRIVY_IDS` allowlist.

> Sixteen endpoints shipped on 2026-08-25 and are documented in a separate section
> at the end of this file, «Endpoints added 2026-08-25». Six of them closed gaps the
> admin dashboard had filed as `PendingEndpoint`.

---

## Endpoints

### Overview

**GET /overview**

KPI summary cards: total users, registered users, total ops, new users (30d), median TVL, top vault, top asset.

**Query Parameters:**

- `plan` (optional): Filter by plan (`basic`, `premium`, `business`, `founder`)

**Response:**

```json
{
  "totalUsers": 1234,
  "registeredUsers": 856,
  "registeredByPlan": [
    { "plan": "premium", "count": 120 },
    { "plan": "basic", "count": 736 }
  ],
  "usersByPlan": [
    { "plan": "basic", "count": 1100 },
    { "plan": "premium", "count": 134 }
  ],
  "totalOps": 45678,
  "newUsers30d": 89,
  "topVault": {
    "vaultName": "Aave USDC",
    "tvlUsd": 1234567.89
  },
  "topAsset": {
    "symbol": "USDC",
    "totalUsd": 987654.32
  },
  "medianTvl": {
    "usersWithTvl": 800,
    "medianUsd": 1234.56,
    "meanUsd": 2345.67,
    "totalUsd": 1876543.21
  }
}
```

**Cache:** 5 minutes

---

### P&L (Profit & Loss)

#### GET /pnl/operations

P&L by functionality: swap, bridge, deposit, withdraw, etc. Returns fees, cost, margin, ops count, users count per operation type.

**Query Parameters:**

- `from` (required): Start date (YYYY-MM-DD)
- `to` (required): End date (YYYY-MM-DD)
- `plan` (optional): Filter by plan
- `op` (optional): Filter by operation type (`swap`, `bridge`, `deposit`, `withdraw`, `onramp`, `offramp`, etc.)
- `chain` (optional): Filter by chain ID (e.g., `137` for Polygon, `8453` for Base)
- `user` (optional): Filter by Privy ID

**Response:**

```json
{
  "rows": [
    {
      "operation": "swap",
      "feesUsd": 12345.67,
      "costUsd": 2345.67,
      "marginUsd": 10000.0,
      "opsCount": 5678,
      "usersCount": 234
    },
    {
      "operation": "bridge",
      "feesUsd": 8765.43,
      "costUsd": 1234.56,
      "marginUsd": 7530.87,
      "opsCount": 1234,
      "usersCount": 156
    }
  ],
  "totals": {
    "feesUsd": 45678.9,
    "costUsd": 5678.9,
    "marginUsd": 40000.0,
    "opsCount": 12345,
    "usersCount": 456
  }
}
```

**Cache:** 2 minutes

---

#### GET /pnl/daily

Daily P&L time series: fees, cost, margin per day.

**Query Parameters:**

- `from` (required): Start date (YYYY-MM-DD)
- `to` (required): End date (YYYY-MM-DD)
- `plan` (optional): Filter by plan
- `op` (optional): Filter by operation type
- `chain` (optional): Filter by chain ID
- `user` (optional): Filter by Privy ID
- `bucket` (optional): Aggregation period (`day`, `week`, `month`, default: `day`)

**Response:**

```json
{
  "series": [
    {
      "date": "2025-01-01",
      "feesUsd": 1234.56,
      "costUsd": 234.56,
      "marginUsd": 1000.0
    },
    {
      "date": "2025-01-02",
      "feesUsd": 1567.89,
      "costUsd": 267.89,
      "marginUsd": 1300.0
    }
  ]
}
```

**Cache:** 2 minutes

---

#### GET /pnl/membership

Per-plan stats: user count, fees, cost, margin, top holdings per plan.

**Query Parameters:**

- `from` (required): Start date (YYYY-MM-DD)
- `to` (required): End date (YYYY-MM-DD)

**Response:**

```json
{
  "report": [
    {
      "plan": "premium",
      "usersCount": 120,
      "feesUsd": 12345.67,
      "costUsd": 2345.67,
      "marginUsd": 10000.0,
      "topHoldings": [
        { "symbol": "USDC", "totalUsd": 456789.0 },
        { "symbol": "ETH", "totalUsd": 234567.0 }
      ]
    }
  ]
}
```

**Cache:** 5 minutes

---

### Costs

#### GET /costs/totals

Lifetime, 30-day, and 7-day sponsored gas cost totals + operation counts (EVM + Solana).

**Response:**

```json
{
  "evm": {
    "lifetimeUsd": 123456.78,
    "lifetimeOps": 98765,
    "last30dUsd": 12345.67,
    "last7dUsd": 3456.78
  },
  "solana": {
    "lifetimeUsd": 2345.67,
    "last30dUsd": 456.78,
    "last7dUsd": 123.45,
    "last30dOps": 567,
    "lifetimeOps": 8901
  }
}
```

**Cache:** 10 minutes

---

#### GET /costs/daily

Daily cost/fee/margin time series for charts.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**

```json
{
  "series": [
    {
      "day": "2025-01-01",
      "costUsd": 1234.56,
      "feesUsd": 5678.9,
      "marginUsd": 4444.34
    }
  ]
}
```

**Cache:** 10 minutes

---

#### GET /costs/by-chain

Cost breakdown by blockchain network.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**

```json
{
  "rows": [
    {
      "chainId": 137,
      "chainName": "Polygon",
      "costUsd": 12345.67,
      "opsCount": 5678
    },
    {
      "chainId": 8453,
      "chainName": "Base",
      "costUsd": 9876.54,
      "opsCount": 4321
    }
  ]
}
```

**Cache:** 10 minutes

---

#### GET /costs/by-operation

Cost breakdown by operation type with fee/margin.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**

```json
{
  "rows": [
    {
      "operation": "swap",
      "opsCount": 5678,
      "costUsd": 2345.67,
      "feesUsd": 12345.67,
      "marginUsd": 10000.0
    }
  ]
}
```

**Cache:** 10 minutes

---

#### GET /costs/by-plan

Cost breakdown by membership plan.

**Response:**

```json
{
  "rows": [
    {
      "plan": "premium",
      "usersCount": 120,
      "opsCount": 5678,
      "costUsd": 2345.67,
      "feesUsd": 12345.67,
      "marginUsd": 10000.0
    }
  ]
}
```

**Cache:** 10 minutes

---

#### GET /costs/expensive

High-cost sponsored operations for review (ops above threshold).

**Query Parameters:**

- `threshold` (optional): USD threshold (default: 0.50)
- `limit` (optional): Max rows to return (default: 50, max: 200)

**Response:**

```json
{
  "rows": [
    {
      "chainId": 137,
      "txHash": "0xabc123...",
      "timestamp": "2025-01-15T12:34:56.000Z",
      "costUsd": 2.34,
      "operation": "swap",
      "user": {
        "privyId": "did:privy:abc123",
        "email": "user@example.com"
      }
    }
  ]
}
```

**Cache:** 5 minutes

---

### Fees

#### GET /fees/totals

Lifetime, 30-day, and 7-day treasury fee totals (user fees, excluding NFT sales) + Solana xStock fee income.

**Response:**

```json
{
  "evm": {
    "lifetimeUsd": 234567.89,
    "last30dUsd": 23456.78,
    "last7dUsd": 5678.9
  },
  "solana": {
    "lifetimeUsd": 1234.56,
    "last30dUsd": 234.56,
    "last7dUsd": 56.78,
    "fees": 890
  }
}
```

**Cache:** 10 minutes

---

#### GET /fees/by-operation

Fee breakdown by operation type.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**

```json
{
  "rows": [
    {
      "operation": "swap",
      "opsCount": 5678,
      "feesUsd": 12345.67
    }
  ]
}
```

**Cache:** 10 minutes

---

#### GET /fees/treasury/by-token

Treasury inflows grouped by (chain, token) with operation type breakdown.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)
- `source` (optional): `user-fees`, `treasury-management`, or `all` (default: `user-fees`)
- `includeNonWhitelisted` (optional): Include non-whitelisted tokens (default: `false`)

**Response:**

```json
{
  "rows": [
    {
      "chainId": 137,
      "tokenSymbol": "USDC",
      "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "operation": "swap",
      "transfers": 567,
      "totalUsd": 12345.67
    }
  ]
}
```

**Cache:** 5 minutes

---

#### GET /fees/treasury/by-chain

Treasury inflows grouped by blockchain network.

**Query Parameters:**

- `includeNonWhitelisted` (optional): Include non-whitelisted tokens (default: `false`)

**Response:**

```json
{
  "rows": [
    {
      "chainId": 137,
      "chainName": "Polygon",
      "transfers": 5678,
      "tokens": 12,
      "totalUsd": 45678.9
    }
  ]
}
```

**Cache:** 5 minutes

---

#### GET /fees/nft

NFT primary sales revenue (Founder NFTs).

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)

**Response:**

```json
{
  "recent": {
    "days": 30,
    "totalUsd": 12345.67,
    "sales": 12
  },
  "allTime": {
    "totalUsd": 234567.89,
    "sales": 456
  }
}
```

**Cache:** 5 minutes

---

#### GET /fees/diagnostics

Operation tag diagnostics — how fees are classified (for debugging).

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30, max: 365)
- `limit` (optional): Max rows to return (default: 20, max: 100)

**Response:**

```json
{
  "rows": [
    {
      "chainId": 137,
      "txHash": "0xabc123...",
      "timestamp": "2025-01-15T12:34:56.000Z",
      "operation": "swap",
      "source": "hyxora-activity",
      "feesUsd": 12.34
    }
  ]
}
```

**Cache:** 5 minutes

---

### Users

#### GET /users/stats

User statistics: total users, registered users, new users in last N days, daily signup counts, user activation breakdown.

**Query Parameters:**

- `days` (optional): Number of days for new users + signup chart (default: 30, max: 365)

**Response:**

```json
{
  "totalUsers": 1234,
  "registeredUsers": 856,
  "newUsers": 89,
  "signups": [
    { "day": "2025-01-01", "count": 5 },
    { "day": "2025-01-02", "count": 7 }
  ],
  "activation": {
    "total": 1234,
    "withWallet": 1100,
    "active": 856,
    "withTvl": 800
  }
}
```

**Cache:** 5 minutes

---

#### GET /users

Paginated user list with TVL, cost, fees, and plan info.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Rows per page (default: 50, max: 200)
- `sort` (optional): Sort column (`created`, `tvl`, `cost`, `fees`, `net`, `plan`, default: `created`)
- `dir` (optional): Sort direction (`asc`, `desc`, default: `desc`)
- `search` (optional): Filter by email/username
- `scope` (optional): `active` or `inactive`

**Response:**

```json
{
  "users": [
    {
      "privyId": "did:privy:abc123",
      "email": "user@example.com",
      "username": "user123",
      "plan": "premium",
      "membershipStatus": "active",
      "kycStatus": "verified",
      "createdAt": "2024-06-15T12:34:56.000Z",
      "tvlUsd": 12345.67,
      "costUsd": 234.56,
      "feesUsd": 567.89,
      "netUsd": 333.33,
      "nftBalance": 2
    }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 1234
}
```

**Cache:** 5 minutes

---

#### GET /users/[privyId]

Per-user portfolio: positions, TVL, margin, transactions, ramp orders.

**Path Parameters:**

- `privyId`: User's Privy ID

**Query Parameters:**

- `page` (optional): Page number for transactions (default: 1)
- `pageSize` (optional): Rows per page (default: 50, max: 200)

**Response:**

```json
{
  "portfolio": {
    "positions": [
      {
        "chainId": 137,
        "symbol": "USDC",
        "balance": 1234.56,
        "usdValue": 1234.56
      }
    ],
    "tvl": {
      "totalUsd": 12345.67,
      "vaultUsd": 10000.0,
      "refreshedAt": "2025-01-15T12:34:56.000Z"
    },
    "margin": {
      "costUsd": 234.56,
      "feesUsd": 567.89,
      "marginUsd": 333.33
    }
  },
  "transactions": {
    "rows": [
      {
        "chainId": 137,
        "txHash": "0xabc123...",
        "timestamp": "2025-01-15T12:34:56.000Z",
        "costUsd": 1.23,
        "feesUsd": 4.56,
        "operation": "swap"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "total": 567
  },
  "rampOrders": [
    {
      "orderId": "order123",
      "type": "onramp",
      "status": "completed",
      "amountUsd": 100.0,
      "createdAt": "2025-01-15T12:34:56.000Z"
    }
  ],
  "freeVsPaid": {
    "freeOps": 500,
    "paidOps": 67
  }
}
```

**Cache:** 5 minutes

---

#### GET /users/[privyId]/transactions

Per-user transaction history (paginated).

**Path Parameters:**

- `privyId`: User's Privy ID

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Rows per page (default: 50, max: 200)

**Response:**

```json
{
  "transactions": [
    {
      "chainId": 137,
      "txHash": "0xabc123...",
      "timestamp": "2025-01-15T12:34:56.000Z",
      "costUsd": 1.23,
      "feesUsd": 4.56,
      "operation": "swap"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 567
}
```

**Cache:** 5 minutes

---

### Holdings

#### GET /holdings

Top tokens and vaults by aggregate USD exposure across all users.

**Query Parameters:**

- `limit` (optional): Max rows to return (default: 25, max: 100)
- `asOfDate` (optional): Snapshot date (YYYY-MM-DD)

**Response:**

```json
{
  "tokens": [
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "chainId": 137,
      "chainName": "Polygon",
      "totalUsd": 456789.0,
      "holders": 567
    }
  ],
  "vaults": [
    {
      "vaultName": "Aave USDC",
      "symbol": "aUSDC",
      "chainId": 137,
      "chainName": "Polygon",
      "totalUsd": 234567.0,
      "holders": 123
    }
  ]
}
```

**Cache:** 5 minutes

---

### System

#### GET /system/health

System health: indexer cursors, TVL freshness, data freshness, service status.

**Response:**

```json
{
  "system": {
    "indexers": [
      {
        "kind": "treasury-fees",
        "chainId": 137,
        "lastBlock": 12345678,
        "updatedAt": "2025-01-15T12:34:56.000Z"
      }
    ],
    "tvlErrors": [],
    "backendCacheOk": true
  },
  "tvl": {
    "freshness": "2025-01-15T12:34:56.000Z",
    "usersWithTvl": 800,
    "usersWithoutTvl": 56
  },
  "data": {
    "latestTreasuryFee": "2025-01-15T12:34:56.000Z",
    "latestUserOp": "2025-01-15T12:34:56.000Z"
  }
}
```

**Cache:** 1 minute

---

## Chain IDs Reference

- **137**: Polygon
- **8453**: Base
- **56**: BSC (Binance Smart Chain)
- **13381**: HyperEVM

---

## Operation Types

- `swap`: Token swaps
- `bridge`: Cross-chain bridges
- `deposit`: Deposits into vaults
- `withdraw`: Withdrawals from vaults
- `onramp`: Fiat on-ramp (SEPA deposits)
- `offramp`: Fiat off-ramp (SEPA withdrawals)
- `stake`: Staking operations
- `unstake`: Unstaking operations
- `claim`: Claim rewards
- `approve`: Token approvals
- `other`: Uncategorized operations

---

## Error Responses

All errors return:

```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**

- `400`: Bad request (missing required parameters)
- `401`: Unauthorized (missing or invalid bearer token)
- `500`: Internal server error

---

## Rate Limiting

No rate limiting is currently enforced. However, please respect the cache TTLs and avoid making redundant requests within the cache window.

---

## Notes

- All USD amounts are stored at ingest time using historical prices. EUR conversion is done at render time using current FX rates.
- The `daily_snapshots` table is a chart cache only — never the source of truth for current numbers.
- Per-user TVL snapshot dates differ (activity-driven refresh) — always use the latest date per user, not a global max.

---

# Endpoints added 2026-08-25

Sixteen endpoints the backend team shipped after the sections above were written,
several of them in answer to gaps this dashboard had filed as `PendingEndpoint`.
All verified reachable on `admin.hyxora.com/api/v1` (401 without a token, not 404).

> **The reference we were sent restates the older endpoints too, and its examples
> for those are wrong in at least one place.** It shows `/overview` returning
> `medianTvl` as a plain number and `usersByPlan` as an object map; the API sends
> `medianTvl` as `{ usersWithTvl, medianUsd, meanUsd, totalUsd }` and the plan
> breakdowns as `{ plan, count }[]`, which is what the sections above document and
> what the panels read. Treat this appendix as authoritative about *which*
> endpoints exist and approximate about their field names — the same caveat that
> already applies to `/holdings` (documented `chainId`, sends `chain`).

---

## Costs

### GET /costs/recent

The full sponsored-operation feed, EVM and Solana interleaved by time. Not the
same thing as `/costs/expensive`, which caps at 200 rows above a threshold and
reports no total.

**Query Parameters:**

- `page` (optional): default 1
- `pageSize` (optional): default 10, max 100

**Response:** rows are **snake_cased** — indexer rows passed through, unlike every
other endpoint here.

```json
{
  "rows": [
    {
      "chain_id": 137,
      "tx_hash": "0x...",
      "log_index": 0,
      "sender": "0x...",
      "block_timestamp": "2026-08-24T12:00:00Z",
      "cost_usd": "0.05",
      "bundler_cost_usd": "0.045",
      "source": "evm"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 45678
}
```

`cost_usd` is gas paid on chain; `bundler_cost_usd` is what Pimlico invoices with
its markup. Both are needed to reconcile against dashboard.pimlico.io. Solana rows
carry `source: "solana"`, `chain_id: 101` and the fee-payer (not a user) in
`sender`; `source` is the field to trust when it disagrees with `chain_id`.

**Cache:** 2 minutes · **Used by:** `costos/RecentSponsoredOpsPanel`

---

### GET /costs/gas-limits

Gas ceiling configuration, proxied from the Hyxora backend.

```json
{
  "rows": [
    {
      "chainKey": "polygon",
      "chainName": "Polygon",
      "currentGwei": 500,
      "maxGwei": 1000,
      "source": "override",
      "updatedAt": "2026-08-20T10:00:00Z",
      "pctOfLimit": 50.0
    }
  ],
  "backendOk": true
}
```

**Cache:** 2 minutes · **Not wired.** `costos/GasLimitsPanel` already joins live
`eth_gasPrice` from `/api/monitoring/gas-prices` with the ceilings from app-api.
This is a third route to the same ceilings and would not add the live half.

---

## Fees

### GET /fees/recent

Individual treasury inflows, EVM and Solana, newest first. Replaces
`/fees/diagnostics` for this purpose — that one is a tagging debug endpoint with
no pagination, no total, no payer and no token.

**Query Parameters:**

- `page` (optional): default 1
- `pageSize` (optional): default 10, max 100
- `includeNonWhitelisted` (optional): default `false`

```json
{
  "rows": [
    {
      "chainId": 137,
      "txHash": "0x...",
      "fromAddress": "0x...",
      "toAddress": "0x...",
      "amountUsd": 0.15,
      "tokenSymbol": "USDC",
      "operationType": "swap",
      "blockTimestamp": "2026-08-24T12:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 45678
}
```

No `days` parameter — this walks the whole ledger, unlike the rest of the Ingresos
tab, which is scoped to 30 days.

**Cache:** 2 minutes · **Used by:** `ingresos/LatestUserFeesPanel`

---

### GET /transactions/recent

Same shape, same parameters, same rows as `/fees/recent`. Nothing reads it — one
feed is enough, and two panels showing the same rows under different titles would
invite the reader to add them up.

**Cache:** 2 minutes

---

## Holdings

### GET /holdings/holders

Which users hold a given token or vault. The join `/holdings` could never expose:
it is an aggregate with no way to ask who is behind a number.

**Query Parameters:**

- `query` (**required**): token symbol or vault name. Empty is a 400.
- `limit` (optional): default 100, max 500
- `asOfDate` (optional): `YYYY-MM-DD`. Omit for each user's latest snapshot, which
  is what `/holdings` aggregates.

```json
{
  "holders": [
    {
      "privyId": "did:privy:...",
      "email": "user@example.com",
      "twitterUsername": "@user",
      "plan": "premium",
      "tvlRefreshedAt": "2026-08-24T10:00:00Z",
      "valueUsd": 5000,
      "symbols": ["USDC", "USDT"],
      "chains": ["Polygon", "Base"]
    }
  ],
  "query": "USDC",
  "limit": 100
}
```

Matches on symbol / vault name and **not on chain**, so a holder appears once with
`valueUsd` summed across every network in `chains`. A row in the Balances tables is
a (symbol, chain) pair, so the panel narrows by `chains` and marks any holder whose
figure spans more than one.

**Cache:** 5 minutes · **Used by:** `balances/AssetHolders`, under both tables.

> This is what retired `/api/monitoring/holdings-index`, a route that rebuilt the
> same join by fanning out over `/users` and `/users/{privyId}` — one upstream
> request per user with a balance.

---

## Users

### GET /users/top-fee-payers

Top revenue contributors in the window.

**Query Parameters:** `limit` (default 20, max 100), `days` (default 30, max 365)

```json
{
  "rows": [
    {
      "safeAddress": "0x...",
      "privyId": "did:privy:...",
      "email": "user@example.com",
      "twitterUsername": "@user",
      "totalUsd": 567.89
    }
  ],
  "limit": 20,
  "days": 30
}
```

Returns the head of the list and no grand total, so a share computed off these rows
is a share of the table, not of all revenue.

**Cache:** 5 minutes · **Used by:** `usuarios/TopFeePayersPanel`

---

### GET /users/renewals

Memberships expiring within `days`. **Counts only** — not the users behind them.

**Query Parameters:** `days` (default 30, max 365)

```json
{
  "total": 45,
  "byPlan": { "basic": 20, "premium": 15, "business": 8, "founder": 2 }
}
```

**Cache:** 5 minutes · **Used by:** `planes/RenewalsPanel`

---

### GET /users/trends

Daily signups plus the `daily_snapshots` series. **The first TVL history the API
exposes** — every other TVL field here is a snapshot of right now.

**Query Parameters:** `days` (default 90, max 365)

```json
{
  "signups": [{ "date": "2026-08-24", "count": 5 }],
  "snapshots": [
    {
      "date": "2026-08-24",
      "totalUsers": 1234,
      "usersByPlan": { "basic": 700, "premium": 400 },
      "tvlUsd": 12345678.9,
      "gasCostUsd": 1234.56,
      "feesUsd": 2345.67,
      "marginUsd": 1111.11
    }
  ],
  "days": 90
}
```

Read `snapshots` as the chart cache the Notes section says it is: the shape, never
the current figure. `usuarios/AppTvlPanel` keeps its headline on `/overview` for
exactly that reason, and says so where the two disagree.

**Cache:** 5 minutes · **Used by:** `usuarios/AppTvlPanel`

---

### GET /users/[privyId]/vaults · /pnl · /relay

Per-user vault positions, EVM+Solana PnL summary, and Relay bridge destinations
keyed by origin tx hash. All proxied from the Hyxora backend, **cached 4 hours**.

**Not wired.** There is no per-user detail view in this dashboard yet — `/users`
opens no drawer — so there is nowhere to put them. They are the three to reach for
when one is built.

---

## Chains

### GET /chains

Per-chain summary: TVL, 30-day ops, cost, fees, margin and both indexer cursors,
plus a separate `solana` block.

```json
{
  "chains": [
    {
      "chainId": 137,
      "name": "Polygon",
      "tvlUsd": 5000000,
      "ops30d": 12345,
      "cost30dUsd": 1234.56,
      "fees30dUsd": 2345.67,
      "feesCount30d": 12345,
      "margin30dUsd": 1111.11,
      "useropsLastBlock": 45678901,
      "treasuryLastBlock": 45678900
    }
  ],
  "solana": {
    "tvlUsd": 1000000,
    "earnings30dUsd": 234.56,
    "costs30dUsd": 123.45,
    "margin30dUsd": 111.11
  }
}
```

Window is fixed at 30 days; no parameters.

**Cache:** 5 minutes · **Hook written (`useGetChainsSummary`), panel not switched.**
`redes/ChainsPanel` currently assembles the same table from four endpoints, which is
why its TVL column only covers the top 100 `/holdings` rows. Switching it is a
straight win but replaces a working panel against shapes nobody has seen a real
response for — do it once someone can diff the two side by side.

---

## Founder Economics

### GET /founder-economics

What the Founder NFT tier brings in against what it costs to carry. The same block
is embedded in `/overview/extended`.

```json
{
  "founderCount": 14,
  "syncedFounderCount": 12,
  "unsyncedCount": 2,
  "onChainSupply": 100,
  "onChainHolders": 85,
  "activeFounders": 10,
  "conservativeRevenueUsd": 5000,
  "estimatedRevenueUsd": 7500,
  "founderGasSubsidizedUsd": 250,
  "avgGasPerFounder": 17.86,
  "avgGasPerActiveFounder": 25.0,
  "netPerFounderUsd": 357.14,
  "subsidyRatioPct": 3.33,
  "note": "Revenue estimates based on on-chain activity"
}
```

Both revenue figures are estimates derived from on-chain activity, not invoices —
`note` says so and the panel renders it rather than hiding it.

**Cache:** 5 minutes · **Used by:** `planes/FounderEconomicsPanel`

---

## System

### GET /system/monitoring

Service liveness, Solana funding, **Pimlico runway**, liquidatable holdings.

```json
{
  "services": [
    {
      "name": "API",
      "env": "prod",
      "url": "https://app-api.hyxora.com",
      "status": "up",
      "httpStatus": 200,
      "latencyMs": 123,
      "error": null
    }
  ],
  "solanaFunding": { "address": "...", "sol": 5.5, "usd": 825, "priceUsd": 150, "minSol": 1.0, "low": false },
  "pimlicoRunway": {
    "balanceUsd": 5000,
    "asOf": "2026-08-24T10:00:00Z",
    "spentSince": 1000,
    "remaining": 4000,
    "burnPerDay": 100,
    "daysLeft": 40,
    "minUsd": 1000,
    "low": false
  },
  "liquidatableHoldings": { "wallets": [], "totalUsd": 1000, "actionable": true, "threshold": 500 }
}
```

**Only `pimlicoRunway` is read.** The other three overlap with `/api/monitoring/*`
routes of ours that hit the RPCs and Zerion on request, so ours are true *now*
rather than whenever a cron last ran — see CLAUDE.md. `pimlicoRunway` cannot be
ours: Pimlico's API exposes the configured limit and never the remaining credit, so
it has to be derived from a recorded deposit minus the *unfiltered* op ledger, and
`/costs/*` drops test accounts and retired chains that Pimlico still bills for.

`balanceUsd` is a deposit on record at `asOf`, not a live balance. If nobody updates
it after a top-up the runway walks to zero on a healthy account — the panel says so.

**Cache:** 1 minute · **Used by:** `sistema/SponsorshipPanel`

---

### GET /system/sentry

Unresolved issues, 24-hour event counts, new issues, users affected.

```json
{
  "configured": true,
  "ok": true,
  "error": null,
  "org": "hyxora",
  "project": "hyxora-app",
  "unresolvedCount": 5,
  "atLimit": false,
  "events24h": 123,
  "newIssues24h": 2,
  "usersAffected": 15,
  "issues": [
    {
      "id": "123",
      "shortId": "HYXORA-123",
      "title": "TypeError: Cannot read property 'x' of undefined",
      "culprit": "src/components/Dashboard.tsx",
      "level": "error",
      "count": 45,
      "userCount": 10,
      "firstSeen": "2026-08-20T10:00:00Z",
      "lastSeen": "2026-08-24T11:00:00Z",
      "permalink": "https://sentry.io/...",
      "events24h": 12,
      "isNew": false
    }
  ]
}
```

**Reports its own failures in the body, not in the status code.** No token upstream
is `configured: false`; Sentry refusing is `ok: false` with `error` set. Both come
back 200 with an empty `issues`, and neither means "no errors" — check the flags
before rendering anything reassuring.

**Cache:** 2 minutes · **Used by:** `sistema/SentryPanel`

---

## Overview

### GET /overview/extended

Everything `/overview` has, restructured under `users` / `operations` / `holdings`,
plus `avgFeePerTx`, `mostActiveChain` and the whole `founderEconomics` block.

**Query Parameters:** `plan` (optional)

**Cache:** 5 minutes · **Not wired.** The Resumen tab already assembles these from
`/overview`, `/pnl/*` and `/costs/*` with per-panel windows and filters this
endpoint does not take. Worth revisiting only if Resumen is rebuilt around one
request — and note the nesting differs from `/overview`, so it is not a drop-in.
