# Hyxora Admin Dashboard API v1

**Base URL:** `https://admin.hyxora.com/api/v1`

**Authentication:** All endpoints require a Privy bearer token in the `Authorization` header.

```
Authorization: Bearer <privy-access-token>
```

The token must belong to a user in the `ADMIN_ALLOWLIST_PRIVY_IDS` allowlist.

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
