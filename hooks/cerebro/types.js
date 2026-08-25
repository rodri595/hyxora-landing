/**
 * Shared JSDoc typedefs for the Cerebro admin API (admin.hyxora.com/api/v1).
 * Runtime-free: this module exists so hooks can `@import` these shapes and get
 * autocomplete on `data` without moving the project to TypeScript.
 */

/** @typedef {"basic" | "premium" | "business" | "founder"} CerebroPlan */

/**
 * @typedef {"swap" | "bridge" | "deposit" | "withdraw" | "onramp" | "offramp"
 *   | "stake" | "unstake" | "claim" | "approve" | "other"} CerebroOperation
 */

/** @typedef {137 | 8453 | 56 | 13381 | number} CerebroChainId */

/** @typedef {string} IsoDate ISO-8601 timestamp, e.g. "2025-01-15T12:34:56.000Z" */

/** @typedef {string} DayString Calendar day, "YYYY-MM-DD" */

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

/** @typedef {{ plan: CerebroPlan, count: number }} PlanCount */

/**
 * @typedef {Object} CerebroOverview
 * @property {number} totalUsers
 * @property {number} registeredUsers
 * @property {PlanCount[]} registeredByPlan
 * @property {PlanCount[]} usersByPlan
 * @property {number} totalOps
 * @property {number} newUsers30d
 * @property {{ vaultName: string, tvlUsd: number }} topVault
 * @property {{ symbol: string, totalUsd: number }} topAsset
 * @property {{ usersWithTvl: number, medianUsd: number, meanUsd: number, totalUsd: number }} medianTvl
 */

/* -------------------------------------------------------------------------- */
/* P&L                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} PnlOperationRow
 * @property {CerebroOperation} operation
 * @property {number} feesUsd
 * @property {number} costUsd
 * @property {number} marginUsd
 * @property {number} opsCount
 * @property {number} usersCount
 */

/**
 * @typedef {Object} PnlOperations
 * @property {PnlOperationRow[]} rows
 * @property {{ feesUsd: number, costUsd: number, marginUsd: number, opsCount: number, usersCount: number }} totals
 */

/**
 * @typedef {Object} PnlDailyPoint
 * @property {DayString} date
 * @property {number} feesUsd
 * @property {number} costUsd
 * @property {number} marginUsd
 */

/**
 * @typedef {Object} PnlMembershipRow
 * @property {CerebroPlan} plan
 * @property {number} usersCount
 * @property {number} feesUsd
 * @property {number} costUsd
 * @property {number} marginUsd
 * @property {{ symbol: string, totalUsd: number }[]} topHoldings
 */

/* -------------------------------------------------------------------------- */
/* Costs                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} CostTotals
 * @property {{ lifetimeUsd: number, lifetimeOps: number, last30dUsd: number, last7dUsd: number }} evm
 * @property {{ lifetimeUsd: number, lifetimeOps: number, last30dUsd: number, last30dOps: number, last7dUsd: number }} solana
 */

/**
 * @typedef {Object} CostDailyPoint
 * @property {DayString} day
 * @property {number} costUsd
 * @property {number} feesUsd
 * @property {number} marginUsd
 */

/**
 * @typedef {Object} CostByChainRow
 * @property {CerebroChainId} chainId
 * @property {string} chainName
 * @property {number} costUsd
 * @property {number} opsCount
 */

/**
 * @typedef {Object} CostByOperationRow
 * @property {CerebroOperation} operation
 * @property {number} opsCount
 * @property {number} costUsd
 * @property {number} feesUsd
 * @property {number} marginUsd
 */

/**
 * @typedef {Object} CostByPlanRow
 * @property {CerebroPlan} plan
 * @property {number} usersCount
 * @property {number} opsCount
 * @property {number} costUsd
 * @property {number} feesUsd
 * @property {number} marginUsd
 */

/**
 * @typedef {Object} ExpensiveOperationRow
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {IsoDate} timestamp
 * @property {number} costUsd
 * @property {CerebroOperation} operation
 * @property {{ privyId: string, email: string }} user
 */

/* -------------------------------------------------------------------------- */
/* Fees                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} FeeTotals
 * @property {{ lifetimeUsd: number, last30dUsd: number, last7dUsd: number }} evm
 * @property {{ lifetimeUsd: number, last30dUsd: number, last7dUsd: number, fees: number }} solana
 */

/**
 * @typedef {Object} FeeByOperationRow
 * @property {CerebroOperation} operation
 * @property {number} opsCount
 * @property {number} feesUsd
 */

/**
 * @typedef {Object} TreasuryByTokenRow
 * @property {CerebroChainId} chainId
 * @property {string} tokenSymbol
 * @property {string} tokenAddress
 * @property {CerebroOperation} operation
 * @property {number} transfers
 * @property {number} totalUsd
 */

/**
 * @typedef {Object} TreasuryByChainRow
 * @property {CerebroChainId} chainId
 * @property {string} chainName
 * @property {number} transfers
 * @property {number} tokens
 * @property {number} totalUsd
 */

/**
 * @typedef {Object} NftFees
 * @property {{ days: number, totalUsd: number, sales: number }} recent
 * @property {{ totalUsd: number, sales: number }} allTime
 */

/**
 * @typedef {Object} FeeDiagnosticRow
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {IsoDate} timestamp
 * @property {CerebroOperation} operation
 * @property {string} source
 * @property {number} feesUsd
 */

/* -------------------------------------------------------------------------- */
/* Users                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} UserStats
 * @property {number} totalUsers
 * @property {number} registeredUsers
 * @property {number} newUsers
 * @property {{ day: DayString, count: number }[]} signups
 * @property {{ total: number, withWallet: number, active: number, withTvl: number }} activation
 */

/**
 * @typedef {Object} CerebroUser
 * @property {string} privyId
 * @property {string} email
 * @property {string} username
 * @property {CerebroPlan} plan
 * @property {string} membershipStatus
 * @property {string} kycStatus
 * @property {IsoDate} createdAt
 * @property {number} tvlUsd
 * @property {number} costUsd
 * @property {number} feesUsd
 * @property {number} netUsd
 * @property {number} nftBalance
 */

/**
 * @typedef {Object} CerebroUsersPage
 * @property {CerebroUser[]} users
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * @typedef {Object} UserTransaction
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {IsoDate} timestamp
 * @property {number} costUsd
 * @property {number} feesUsd
 * @property {CerebroOperation} operation
 */

/**
 * @typedef {Object} UserTransactionsPage
 * @property {UserTransaction[]} transactions
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * @typedef {Object} UserDetail
 * @property {Object} portfolio
 * @property {{ chainId: CerebroChainId, symbol: string, balance: number, usdValue: number }[]} portfolio.positions
 * @property {{ totalUsd: number, vaultUsd: number, refreshedAt: IsoDate }} portfolio.tvl
 * @property {{ costUsd: number, feesUsd: number, marginUsd: number }} portfolio.margin
 * @property {{ rows: UserTransaction[], page: number, pageSize: number, total: number }} transactions
 * @property {{ orderId: string, type: "onramp" | "offramp", status: string, amountUsd: number, createdAt: IsoDate }[]} rampOrders
 * @property {{ freeOps: number, paidOps: number }} freeVsPaid
 */

/* -------------------------------------------------------------------------- */
/* Holdings & System                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Rows come from the positions snapshot, whose chain column is Zerion own text slug
 * ("base", "solana", "binance-smart-chain") rather than the numeric chainId every
 * other Cerebro endpoint reports. admin.md documents chainId/chainName here; the API
 * sends `chain`. Resolve it with `cerebroChainLabel()`, which reads either.
 *
 * @typedef {Object} Holdings
 * @property {{ symbol: string, name: string, chain: string, totalUsd: number, holders: number }[]} tokens
 * @property {{ vaultName: string, symbol: string, chain: string, totalUsd: number, holders: number }[]} vaults
 */

/**
 * @typedef {Object} SystemHealth
 * @property {Object} system
 * @property {{ kind: string, chainId: CerebroChainId, lastBlock: number, updatedAt: IsoDate }[]} system.indexers
 * @property {unknown[]} system.tvlErrors
 * @property {boolean} system.backendCacheOk
 * @property {{ freshness: IsoDate, usersWithTvl: number, usersWithoutTvl: number }} tvl
 * @property {{ latestTreasuryFee: IsoDate, latestUserOp: IsoDate }} data
 */

export {};
