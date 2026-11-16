/**
 * Response shapes for the Hyxora app backend (the gateway's `/app` service),
 * reached through `/api/app-api`.
 *
 * Verified 2026-08-24 against the OpenAPI spec at app-api.hyxora.com/api-docs
 * and, for `/membership` and the fee schema, against live responses from the
 * public `/membership` and `/fees` endpoints.
 *
 * ⚠️ Money is in **minor units** (cents) throughout: a plan at `price: 1900` is
 * €19.00, and a fee `minAmount: 50` / `maxAmount: 225` is $0.50 → $2.25. The
 * ported dashboard renders the divided values. `feeBps` is basis points, so
 * `feeBps: 20` is 0.20%.
 */

/**
 * @typedef {Object} Membership
 * @property {string} _id
 * @property {string} name              "BASIC", "PREMIUM", "NFT Founder HYXORA", "Staff Member"…
 * @property {string} description
 * @property {string} data              JSON *string* — colour and per-locale benefit lists.
 * @property {number} price             Minor units. 1900 → €19.00.
 * @property {string} currency          ISO-4217. Mixed across plans (EUR and USD both appear).
 * @property {string} [stripeProductId] Absent — not null — on plans without one.
 * @property {string} [image]
 * @property {"month" | "year"} interval
 * @property {number} [intervalCount]
 * @property {number[]} [rewardsLevel]  Referral bps per level, up to 5.
 */

/**
 * @typedef {Object} FeeConfig
 * A single cell of the plan × operation matrix. Combinations that carry no fee
 * are **absent** from the array rather than present at zero — "sin comisión
 * definida" and "0%" are different states and render differently.
 * @property {string} action           VAULT_DEPOSIT, SWAP_QUOTE, BUY_ETF…
 * @property {string | null} membershipId
 * @property {number} feeBps           Basis points. 20 → 0.20%.
 * @property {number | null} minAmount Minor units. `0` and `null` both mean "no floor".
 * @property {number | null} maxAmount Minor units. `0` and `null` both mean "sin tope".
 * @property {boolean} isActive
 * @property {Membership | null} membership Denormalised — the plan this row applies to.
 */

/**
 * @typedef {Object} WhitelistedToken
 * @property {string} address
 * @property {string} name
 * @property {string} symbol
 * @property {string} displaySymbol
 * @property {number} chainId
 * @property {string} chainName        Includes "solana", which has no chainId in Cerebro's map.
 * @property {number} decimals
 * @property {boolean} isActive
 * @property {{ price: number, marketCap?: number, priceChange24h?: number }} [priceData]
 * @property {string} [imageUrl]
 * @property {string} [lastSyncedAt]
 */

/**
 * @typedef {Object} WhitelistedVault
 * @property {string} address
 * @property {string} name
 * @property {string} chain
 * @property {number} chainId
 * @property {string} type             Generic, MorphoV1, SummerFi, Yo…
 * @property {string} defillamaId      Feeds the APY shown in the app — worth eyeballing for typos.
 * @property {boolean} isActive
 * @property {boolean} favorite
 * @property {string} [riskLevel]
 * @property {string[]} [tags]
 */

/**
 * A `/admin/users` row as the proxy forwards it (KYC, referral and role fields are
 * dropped server-side). Verified 2026-11-13 against the staging spec, after
 * hyxora-app-backend #206; `privyId` and `country` added 2026-11-16. Join to
 * Cerebro by `privyId`, then email, then wallet.
 *
 * A fully cancelled membership is **wiped**, so every `membership*` key is absent —
 * read a missing key as "no membership", not as unknown.
 *
 * @typedef {Object} AppApiUser
 * @property {string} _id
 * @property {string} [privyId]        The DID Cerebro keys on.
 * @property {string} email
 * @property {string | null} [country] ISO code, e.g. "ES". Null when the profile has none.
 * @property {string} wallet           The user's Safe — Cerebro's `safeAddress`.
 * @property {string} signer           The EOA behind it — Cerebro's `signerAddress`.
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string | null} [name]    `firstName + lastName`; null without a profile.
 * @property {{ _id: string, name: string, tier?: string } | null} [membership]
 * @property {string} [membershipStatus]
 * @property {string} [membershipStartDate]
 * @property {string} [membershipRenewDate] End of the current period.
 * @property {string | null} [membershipLastRenewedAt] Go-forward only from #206.
 * @property {"month" | "year" | null} [membershipInterval]
 * @property {"stripe" | "onchain" | "manual"} [membershipPaymentType]
 * @property {string | null} [cancelEffectiveDate] Only set while `toCancel`.
 * @property {string} [createdAt]
 */

export {};
