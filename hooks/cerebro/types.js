/**
 * Shared JSDoc typedefs for the Cerebro admin API (the gateway's /admin service).
 * Runtime-free: this module exists so hooks can `@import` these shapes and get
 * autocomplete on `data` without moving the project to TypeScript.
 */

/** @typedef {"basic" | "premium" | "business" | "founder"} CerebroPlan */

/**
 * @typedef {"swap" | "bridge" | "deposit" | "withdraw" | "onramp" | "offramp"
 *   | "stake" | "unstake" | "claim" | "approve" | "other"} CerebroOperation
 */

/** @typedef {137 | 8453 | 56 | 999 | number} CerebroChainId */

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
 * @property {string} [chainName] Documented by `admin.md`, not actually sent —
 * resolve the label with `cerebroChainLabel()`.
 * @property {number} costUsd
 * @property {number} [ops] The name the API answers with, as the old dashboard's
 * query did.
 * @property {number} [opsCount] The name `admin.md` documents. Read both with
 * `firstNumber()`.
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
 * Rows arrive with the field names of the query behind the endpoint, not the ones
 * `admin.md` documents — `totalUsers` / `ops` / `netUsd` rather than `usersCount` /
 * `opsCount` / `marginUsd`, with `costUsd` and `feesUsd` the only two the doc got
 * right. `toPlanRow()` in `costos/CostsByPlanPanel` reads either spelling.
 *
 * @typedef {Object} CostByPlanRow
 * @property {CerebroPlan} plan
 * @property {number} [usersCount] Documented spelling of `totalUsers`.
 * @property {number} [totalUsers] Every user on the plan, active or not.
 * @property {number} [activeUsers] Users with at least one sponsored op. Undocumented.
 * @property {number} [opsCount] Documented spelling of `ops`.
 * @property {number} [ops]
 * @property {number} costUsd
 * @property {number} [avgCostPerActiveUser] Mean cost per *active* user. Undocumented,
 * and not derivable from `costUsd` and `activeUsers` — upstream it averages per user
 * over those with spend, weighting each active user equally rather than by spend.
 * @property {number} feesUsd
 * @property {number} [marginUsd] Documented spelling of `netUsd`.
 * @property {number} [netUsd]
 */

/**
 * A row of `/costs/expensive`.
 *
 * `admin.md` documents `timestamp`, an `operation` tag and a nested `user`
 * object. The endpoint is a port of the old dashboard's
 * `getExpensiveSponsoredOps` and sends that query's names instead:
 * `blockTimestamp`, the user joined in flat next to the raw `sender`, and no
 * operation at all — `sponsored_user_ops.action_type` holds the tag but the
 * query never selected it. `chainId`, `txHash` and `costUsd` are the only three
 * names both shapes share, which is exactly the set that rendered.
 *
 * Both spellings are typed as optional here and `toExpensiveOpRow()` in
 * `costos/ExpensiveOpsPanel` reads either, so the panel keeps working if the
 * doc is made true upstream.
 *
 * @typedef {Object} ExpensiveOperationRow
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {IsoDate} [timestamp] Documented spelling of `blockTimestamp`.
 * @property {IsoDate} [blockTimestamp]
 * @property {number} costUsd Pimlico bill — chain gas plus its surcharge.
 * @property {number} [bundlerCostUsd] Raw on-chain gas, what the explorer shows.
 * @property {number} [gasUsed]
 * @property {boolean} [success]
 * @property {CerebroOperation} [operation] Not currently sent — see above.
 * @property {string} [sender] Safe that signed the op; the join key for the user.
 * @property {string | null} [privyId] Null on an orphan op — no known wallet matched.
 * @property {string | null} [email]
 * @property {string | null} [twitterUsername]
 * @property {{ privyId: string, email: string }} [user] Documented nesting of the three above.
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
 * @property {CerebroOperation} operationType `admin.md` calls this `operation`; the
 * API answers with the old dashboard query's spelling.
 * @property {number} transfers
 * @property {number} totalAmount Sum in token units, undocumented but sent.
 * @property {number} totalUsd
 */

/**
 * One `/fees/treasury/by-chain` row.
 *
 * `chainName` is documented but does not arrive — the endpoint is a port of the old
 * dashboard's `getTreasuryByChain()` and answers with that query's columns, so the
 * chain has to be resolved from `chainId`. The same reason `userFeesUsd` and
 * `otherUsd` show up here without appearing in admin.md: the port kept them. They
 * are marked optional so a panel reading them has to say what it does when they
 * are missing, rather than treating `totalUsd` as user revenue.
 *
 * Solana arrives as chainId `1399811149`, the `treasury_fees` sentinel, not the
 * `101` that /fees/recent uses.
 *
 * @typedef {Object} TreasuryByChainRow
 * @property {CerebroChainId} chainId
 * @property {string} [chainName]
 * @property {number} transfers
 * @property {number} tokens
 * @property {number} totalUsd Every inflow, user fees and treasury management alike.
 * @property {number} [userFeesUsd] Inflows from a known user Safe, NFT sales excluded.
 * @property {number} [otherUsd] The remainder: team funding, internal swaps.
 */

/**
 * @typedef {Object} NftFees
 * @property {{ days: number, totalUsd: number, sales: number }} recent
 * @property {{ totalUsd: number, sales: number }} allTime
 */

/**
 * One `/fees/diagnostics` row. Every field below `source` is optional on purpose:
 * the endpoint is a port of the old dashboard's `getOpTagDiagnostics()` and the
 * live response does not match the spellings admin.md documents — `operation` and
 * `feesUsd` arrive empty, the way `/fees/recent` sends `operationType` and
 * `amountUsd` for the same treasury rows. `ingresos/FeeTaggingPanel` reads all of
 * them, and treats a row carrying `transfers` as one the server already grouped.
 *
 * @typedef {Object} FeeDiagnosticRow
 * @property {CerebroChainId} [chainId]
 * @property {string} [txHash]
 * @property {IsoDate} [timestamp]
 * @property {CerebroOperation} [operation]
 * @property {CerebroOperation} [operationType] Same value, SQL spelling.
 * @property {string} [source] `hyxora` (backend tag) or `heuristic` (router ladder).
 * @property {string} [parentMethod] Contract method that originated the transfer.
 * @property {number} [transfers] Only on a pre-grouped response.
 * @property {number} [feesUsd]
 * @property {number} [amountUsd] Same value, SQL spelling.
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
 * The onboarding funnel: the same shape `/users/activation` documents, currently
 * assembled client-side by `useGetUserActivation`, which classifies every row of a
 * full `/users` sweep because that endpoint answers 500. Keeping the shape identical
 * is what makes switching back a one-hook change.
 *
 * Buckets are mutually exclusive and sum to the sweep, evaluated in funnel order.
 * «Desplegada» is a Safe we have paid gas for; «usada» is a treasury fee or more
 * sponsored ops than the one that deployed the wallet. Server-side those are a
 * sponsored UserOp and a `hyxora_activities` / `hyxora_ramp_orders` row — never
 * `last_active_at`, which the deployment op also stamps, and never `scope`, which
 * appears to be built on it.
 *
 * @typedef {Object} UserActivation
 * @property {number | null} total
 * @property {ActivationBuckets} buckets
 * @property {ParkedUser[]} balanceNeverUsed The bucket of the same name listed out,
 * `tvlUsd` descending. A support list, not a statistic.
 * @property {string[]} [warnings] Structural failures — a sweep that stopped short,
 * a population that disagrees with `/users/stats`. Rendered above the funnel.
 * @property {string[]} [notes] Known approximations, chiefly the activity proxy.
 * Rendered muted under the funnel: an explained gap is not an alarm.
 * @property {number} [sweptUsers] How many `/users` rows were classified.
 * @property {number} [fundedThresholdUsd] Balance over which a user counts as funded.
 */

/**
 * The five stages, in funnel order. Spec'd as `fundedNeverUsed`; shipped as
 * `balanceNeverUsed`. Null where a counter could not be worked out.
 *
 * @typedef {Object} ActivationBuckets
 * @property {number | null} noWallet Signed up with Privy, never created a Safe.
 * @property {number | null} walletNotDeployed Safe address, no sponsored gas, under $0.50.
 * @property {number | null} deployedNeverUsed Gas paid for, no product use, under $0.50.
 * @property {number | null} balanceNeverUsed Over $0.50 parked, never used the app.
 * @property {number | null} active Everyone else.
 */

/**
 * @typedef {Object} ParkedUser
 * @property {string | null} privyId
 * @property {string | null} email
 * @property {number} tvlUsd
 * @property {string | null} safe Primary Safe, full address — the UI truncates it,
 * and drops the column when `/users` omits the field.
 * @property {IsoDate | null} createdAt
 */

/**
 * A row of GET /users.
 *
 * admin.md's example lists nine of these fields. The endpoint is a port of
 * `getUsersOverview` and sends every column that query's mapper produced, so the
 * rest — the handles, both addresses, the op/tx counters, the NFT token ids and
 * the renewal date — arrive too and are what the table and its drawer are built
 * on. Undocumented is not the same as absent; each one below has been seen on the
 * wire. Still treat any of them as optional: a null `email` (Twitter-only login),
 * a null `safeAddress` (account that never created a wallet) and an empty
 * `nftTokenIds` are all normal.
 *
 * @typedef {Object} CerebroUser
 * @property {string} privyId
 * @property {string | null} email Null when the account logged in through Twitter.
 * @property {string | null} username Privy handle, distinct from `twitterUsername`.
 * @property {string | null} twitterUsername Undocumented.
 * @property {string | null} signerAddress The EOA behind the Safe. Undocumented.
 * @property {CerebroPlan} plan
 * @property {string | null} membershipStatus
 * @property {IsoDate | null} membershipRenewDate Undocumented.
 * @property {string | null} kycStatus "NOT_AVAILABLE" for anyone who never started it.
 * @property {IsoDate} createdAt
 * @property {string | null} safeAddress First Safe only — the same CREATE2 address
 * on every EVM chain. Undocumented.
 * @property {number} nftBalance
 * @property {string[]} nftTokenIds Founder NFT ids, sorted numerically. Undocumented.
 * @property {number} tvlUsd
 * @property {number} costUsd
 * @property {number} costOps Sponsored ops behind `costUsd`. Undocumented.
 * @property {number} feesUsd
 * @property {number} feeTxs Fee transfers behind `feesUsd`. Undocumented.
 * @property {number} netUsd `feesUsd - costUsd`, our margin on them — not their return.
 */

/**
 * @typedef {Object} CerebroUsersPage
 * @property {CerebroUser[]} users
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * One sponsored UserOp, with the fee the user paid us on it when there was one.
 *
 * admin.md documents `timestamp` / `costUsd` / `feesUsd` / `operation`; the source
 * query (`getUserTransactions`) emits `blockTimestamp` / `totalCostUsd` / `feeUsd` /
 * `operationType` plus the bundler-vs-paymaster split and the token pair behind the
 * op. Both spellings are read at the edge — `toTxRow()` in
 * `usuarios/detail/normalize.js` — the same way `ingresos/FeeTaggingPanel` reads
 * `/fees/diagnostics`.
 *
 * @typedef {Object} UserTransaction
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {IsoDate} [timestamp] Documented spelling.
 * @property {IsoDate} [blockTimestamp] Query spelling.
 * @property {number} [costUsd] Documented spelling of the total Pimlico bill.
 * @property {number} [totalCostUsd] Query spelling.
 * @property {number} [bundlerCostUsd] Query only. The bundler half of the total.
 * @property {number} [paymasterCostUsd] Query only. The 10% paymaster surcharge.
 * @property {number} [feesUsd] Documented spelling.
 * @property {number} [feeUsd] Query spelling.
 * @property {string | null} [feeTokens] Comma-joined symbols the fee was taken in.
 * @property {CerebroOperation} [operation] Documented spelling.
 * @property {string | null} [operationType] Query spelling. Backend `SWAP_QUOTE`-style
 * labels and the tagger's lowercase ones both land here.
 * @property {string | null} [fromChain] Zerion slug; populated only for backend-tagged rows.
 * @property {string | null} [toChain]
 * @property {string | null} [fromToken] Contract address, not a symbol.
 * @property {string | null} [toToken]
 * @property {boolean} [success]
 */

/**
 * @typedef {Object} UserTransactionsPage
 * @property {UserTransaction[]} transactions
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * One fiat ramp order, from the app backend's `/bank/{wallet}/orders`.
 *
 * The deposit and withdraw legs are broken out on purpose: "the user says they sent
 * money and nothing arrived" is `expectedAmount > 0` with `depositAmount` at 0 and
 * the order still pending, which is invisible if you only read `status`.
 *
 * @typedef {Object} UserRampOrder
 * @property {string} orderId Also the bank reference code the user quotes.
 * @property {"onramp" | "offramp" | string} [direction] Query spelling.
 * @property {"onramp" | "offramp" | string} [type] Documented spelling.
 * @property {string} status
 * @property {string | null} [depositStatus]
 * @property {number | null} [depositAmount] What the bank actually credited.
 * @property {string | null} [depositCurrency]
 * @property {string | null} [withdrawStatus]
 * @property {number | null} [withdrawAmount]
 * @property {string | null} [withdrawCurrency]
 * @property {number | null} [expectedAmount] What the user said they would send.
 * @property {number | null} [fee]
 * @property {string | null} [txHash]
 * @property {CerebroChainId | null} [chainId]
 * @property {IsoDate | null} createdAt
 * @property {IsoDate | null} [updatedAt]
 */

/**
 * GET /users/{privyId} — everything about one user in a single response.
 *
 * Documented shapes and query shapes disagree across most of this object, so every
 * field below lists both and `usuarios/detail/normalize.js` reads whichever turns
 * up. Two that matter especially:
 *
 * - **`positions[].chain` is a Zerion slug**, not a `chainId`. Same story as
 *   `/holdings` (see `Holdings` below) — the source table stores the slug as text.
 *   Resolve it with `cerebroChainLabel()`, which reads either.
 * - **`margin.netUsd` / `marginUsd`** is Hyxora's margin on the user: fees they
 *   paid us minus gas we sponsored. It is not their investment return; that is
 *   `UserPnl`, and the two are unrelated numbers that both render as signed USD.
 *
 * @typedef {Object} UserDetail
 * @property {Object} portfolio
 * @property {UserPosition[]} portfolio.positions Ordered by value, descending.
 * @property {{ totalUsd: number, vaultUsd: number, refreshedAt: IsoDate, date: DayString } | null}
 * portfolio.tvl Null for a user whose portfolio has never been snapshotted.
 * @property {{ costUsd: number, costOps?: number, feesUsd: number, feeTxs?: number,
 * marginUsd?: number, netUsd?: number }} portfolio.margin Lifetime, NFT sales excluded.
 * @property {Object} [user] The user row itself, when the endpoint embeds it.
 * @property {number} [nftBalance]
 * @property {string[]} [nftTokenIds]
 * @property {{ rows?: UserTransaction[], transactions?: UserTransaction[], page: number,
 * pageSize: number, total: number }} transactions First page only; page it with
 * `useGetUserTransactions` so paging doesn't refetch the portfolio.
 * @property {UserRampOrder[]} rampOrders
 * @property {{ freeOps: number, paidOps: number, totalOps?: number, freeRatio?: number,
 * paidCostUsd?: number, freeCostUsd?: number }} freeVsPaid A free op is a sponsored
 * op with no treasury fee behind it — the subsidy, at user granularity.
 */

/**
 * One Zerion position in a user's portfolio snapshot.
 *
 * `positionType` and `protocol` are what separate a vault deposit from a raw token
 * balance; `name` is what identifies an xStock ("SP500 xStock"), since those are
 * plain SPL tokens on the Solana wallet and nothing else marks them.
 *
 * @typedef {Object} UserPosition
 * @property {string} [chain] Zerion slug — "base", "solana", "binance-smart-chain".
 * @property {CerebroChainId} [chainId] If the port converted it after all.
 * @property {string | null} protocol
 * @property {string} symbol
 * @property {string} name
 * @property {number} balance
 * @property {number} [priceUsd]
 * @property {number} [valueUsd] Query spelling.
 * @property {number} [usdValue] Documented spelling.
 * @property {string} [positionType] "deposit" for vaults, "wallet" for held tokens,
 * "reward" for gauge dust.
 * @property {string | null} [iconUrl]
 */

/**
 * GET /users/{privyId}/vaults — undocumented shape, proxied from the app backend's
 * `/vault/positions/{wallet}`.
 *
 * **Every USD field arrives as a decimal string** there ("21.823166113498612"), so
 * nothing here may be read without coercion.
 *
 * @typedef {Object} UserVaults
 * @property {number | string} [totalPnlUsd]
 * @property {number | string} [totalAssetsUsd]
 * @property {{ vaultAddress: string, vaultName: string, chain?: string, chainId?: CerebroChainId,
 * assetsUsd?: number | string, pnlUsd?: number | string, roe?: number | string, apy?: number,
 * symbol?: string, iconUrl?: string }[]} [positions]
 */

/**
 * GET /users/{privyId}/pnl — undocumented shape. The EVM and Solana halves of what
 * the user has made, which no other endpoint carries.
 *
 * @typedef {Object} UserPnl
 * @property {number | string} [totalPnlUsd]
 * @property {Object} [evm] Tokens and vaults on the Safes.
 * @property {Object} [solana] The xStocks wallet.
 * @property {Object} [vaults] The vault subset of `evm` — contained in it, not added to it.
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

/**
 * GET /system/tvl-freshness. Four mutually exclusive buckets that sum to `total`,
 * which counts users with at least one Safe — an account that never created a
 * wallet has nothing to refresh and would sit in `never` for good.
 *
 * @typedef {Object} TvlFreshness
 * @property {number} fresh1h Refreshed within the last hour.
 * @property {number} within1d Between one hour and one day ago.
 * @property {number} over1d Stale; the panel warns on this.
 * @property {number} never `tvl_refreshed_at is null`.
 * @property {number} total
 * @property {IsoDate | null} newest Same instant as `SystemHealth.tvl.freshness`.
 * @property {IsoDate | null} oldest Ignores the never-refreshed.
 */

/**
 * GET /system/unpriced-positions — positions Zerion returned but could not price on
 * the last refresh. They contribute $0 to TVL, so every affected user's balance is
 * understated.
 *
 * The source column stores `"SYMBOL@chain"` strings and the API splits them, so
 * `chain` is a Zerion slug ("base") like `/holdings` sends — resolve it through
 * `cerebroChainLabel()`, never by matching the raw string. It is null when the
 * stored string carried no chain half.
 *
 * `totalUsers` counts distinct users, so it is not the sum of `symbols[].users`:
 * one user holding two unpriced assets appears in two rows.
 *
 * @typedef {Object} UnpricedPositions
 * @property {number} totalUsers
 * @property {UnpricedSymbol[]} symbols Ordered `users` desc, then symbol asc.
 */

/**
 * @typedef {Object} UnpricedSymbol
 * @property {string} symbol
 * @property {string | null} chain Zerion slug.
 * @property {number} users
 */

/**
 * Holder of one asset, from GET /holdings/holders.
 *
 * `valueUsd` is that user's exposure to the searched symbol summed across every
 * chain in `chains` — the query matches on symbol / vault name, not on network, so
 * a row is one user per asset and not one user per (asset, chain).
 *
 * @typedef {Object} AssetHolder
 * @property {string} privyId
 * @property {string | null} email
 * @property {string | null} twitterUsername
 * @property {CerebroPlan | null} plan
 * @property {IsoDate | null} tvlRefreshedAt When Zerion last refreshed this user.
 * @property {number} valueUsd
 * @property {string[]} symbols
 * @property {string[]} chains Rendered chain names, not ids.
 */

/**
 * @typedef {Object} HoldersResult
 * @property {AssetHolder[]} holders
 * @property {string} query
 * @property {number} limit
 */

/* -------------------------------------------------------------------------- */
/* Recent feeds                                                                */
/* -------------------------------------------------------------------------- */

/**
 * One sponsored operation from GET /costs/recent.
 *
 * Snake-cased, unlike every other endpoint here — these are the indexer rows passed
 * through. `source` says which ledger a row came from, and Solana rows carry the
 * fee-payer in `sender` rather than a user address.
 *
 * @typedef {Object} RecentSponsoredOpRow
 * @property {CerebroChainId} chain_id
 * @property {string} tx_hash
 * @property {number} log_index
 * @property {string} sender
 * @property {IsoDate} block_timestamp
 * @property {string | number} cost_usd Gas paid on chain.
 * @property {string | number} bundler_cost_usd What Pimlico invoices, markup included.
 * @property {"evm" | "solana"} source
 */

/**
 * @typedef {Object} RecentSponsoredOpsPage
 * @property {RecentSponsoredOpRow[]} rows
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/**
 * One treasury inflow from GET /fees/recent (and the identical GET /transactions/recent).
 *
 * @typedef {Object} RecentFeeRow
 * @property {CerebroChainId} chainId
 * @property {string} txHash
 * @property {string} fromAddress Who paid.
 * @property {string} toAddress Treasury wallet it landed in.
 * @property {number} amountUsd
 * @property {string} tokenSymbol
 * @property {CerebroOperation} operationType
 * @property {IsoDate} blockTimestamp
 */

/**
 * @typedef {Object} RecentFeesPage
 * @property {RecentFeeRow[]} rows
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

/* -------------------------------------------------------------------------- */
/* Trends, cohorts & founders                                                  */
/* -------------------------------------------------------------------------- */

/**
 * One row of `daily_snapshots`. admin.md's own note applies: this table is a chart
 * cache, never the source of truth for a current figure — read the headline from
 * /overview and only the shape from here.
 *
 * @typedef {Object} DailySnapshot
 * @property {DayString} date
 * @property {number} totalUsers
 * @property {Record<CerebroPlan, number>} usersByPlan
 * @property {number} tvlUsd
 * @property {number} gasCostUsd
 * @property {number} feesUsd
 * @property {number} marginUsd
 */

/**
 * @typedef {Object} UserTrends
 * @property {{ date: DayString, count: number }[]} signups
 * @property {DailySnapshot[]} snapshots
 * @property {number} days
 */

/**
 * @typedef {Object} TopFeePayerRow
 * @property {string} safeAddress
 * @property {string} privyId
 * @property {string | null} email
 * @property {string | null} twitterUsername
 * @property {number} totalUsd
 */

/**
 * Counts only — the endpoint returns how many memberships lapse in the window, not
 * which users they belong to.
 *
 * @typedef {Object} Renewals
 * @property {number} total
 * @property {Record<CerebroPlan, number>} byPlan
 */

/**
 * Founder NFT programme economics. Revenue is an estimate the backend derives from
 * on-chain activity; `note` says on what basis, and is meant to be shown.
 *
 * @typedef {Object} FounderEconomics
 * @property {number} founderCount In our database.
 * @property {number} syncedFounderCount Matched to an on-chain holder.
 * @property {number} unsyncedCount
 * @property {number} onChainSupply
 * @property {number} onChainHolders
 * @property {number} activeFounders Founders who actually operated.
 * @property {number} conservativeRevenueUsd
 * @property {number} estimatedRevenueUsd
 * @property {number} founderGasSubsidizedUsd
 * @property {number} avgGasPerFounder
 * @property {number} avgGasPerActiveFounder
 * @property {number} netPerFounderUsd
 * @property {number} subsidyRatioPct
 * @property {string} [note]
 */

/* -------------------------------------------------------------------------- */
/* Chains                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} ChainSummaryRow
 * @property {CerebroChainId} chainId
 * @property {string} name
 * @property {number} tvlUsd
 * @property {number} ops30d
 * @property {number} cost30dUsd
 * @property {number} fees30dUsd
 * @property {number} feesCount30d
 * @property {number} margin30dUsd
 * @property {number | null} useropsLastBlock Indexer cursor.
 * @property {number | null} treasuryLastBlock Indexer cursor.
 */

/**
 * @typedef {Object} ChainsSummary
 * @property {ChainSummaryRow[]} chains
 * @property {{ tvlUsd: number, earnings30dUsd: number, costs30dUsd: number, margin30dUsd: number }} solana
 */

/* -------------------------------------------------------------------------- */
/* Monitoring & Sentry                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The operational block. Everything except `pimlicoRunway` is also computed by our
 * own `/api/monitoring/*` routes, which hit the RPCs and Zerion live; prefer those
 * for anything that has to be true *now*.
 *
 * @typedef {Object} SystemMonitoring
 * @property {{ name: string, env: string, url: string, status: "up" | "down", httpStatus: number | null, latencyMs: number | null, error: string | null }[]} services
 * @property {{ address: string, sol: number, usd: number, priceUsd: number, minSol: number, low: boolean }} solanaFunding
 * @property {PimlicoRunway | null} pimlicoRunway
 * @property {{ wallets: Object[], totalUsd: number, actionable: boolean, threshold: number }} liquidatableHoldings
 */

/**
 * Remaining Pimlico credit. Pimlico's own API reports the configured limit and never
 * the balance left, so this is derived: a recorded deposit minus every sponsored op
 * indexed since `asOf`. `daysLeft` divides what is left by `burnPerDay`.
 *
 * @typedef {Object} PimlicoRunway
 * @property {number} balanceUsd Deposit on record at `asOf`.
 * @property {IsoDate} asOf
 * @property {number} spentSince
 * @property {number} remaining
 * @property {number} burnPerDay
 * @property {number} daysLeft
 * @property {number} minUsd Floor that flips `low`.
 * @property {boolean} low
 */

/**
 * GET /system/sentry. Carries its own failure state rather than a status code:
 * `configured` false means no token upstream, `ok` false means Sentry refused.
 * Both come back 200.
 *
 * @typedef {Object} SentryReport
 * @property {boolean} configured
 * @property {boolean} ok
 * @property {string | null} error
 * @property {string} [org]
 * @property {string} [project]
 * @property {number} unresolvedCount
 * @property {boolean} atLimit True when `unresolvedCount` hit the API's page cap.
 * @property {number} events24h
 * @property {number} newIssues24h
 * @property {number} usersAffected
 * @property {SentryIssue[]} issues
 */

/**
 * @typedef {Object} SentryIssue
 * @property {string} id
 * @property {string} shortId
 * @property {string} title
 * @property {string} culprit
 * @property {"error" | "warning" | "info" | "fatal" | "debug" | string} level
 * @property {number} count Events all time.
 * @property {number} userCount
 * @property {IsoDate} firstSeen
 * @property {IsoDate} lastSeen
 * @property {string} permalink
 * @property {number} events24h
 * @property {boolean} isNew
 */

export {};
