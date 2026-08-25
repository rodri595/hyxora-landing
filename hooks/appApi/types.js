/**
 * Response shapes for the Hyxora app backend (app-api.hyxora.com), reached
 * through `/api/app-api`.
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

export {};
