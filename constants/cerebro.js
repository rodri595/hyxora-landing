/** Membership plans accepted by the `plan` filter. */
export const cerebroPlans = ["basic", "premium", "business", "founder"];

/**
 * Operation types accepted by the `op` filter and returned in `operation` fields.
 *
 * This is Cerebro's own tagger vocabulary, not the app backend's `action` enum —
 * see `constants/appApi.js` for that one. `transfer` is deliberately absent: rows
 * tagged before the tagger could tell the two apart are folded into
 * `external_transfer` server-side.
 *
 * The tagger gains categories faster than this list does — «alta de wallet» turned
 * up without warning — so nothing here may assume the list is exhaustive. Resolve
 * labels through `cerebroOperationLabel()` rather than indexing the map directly.
 */
export const cerebroOperations = [
  "swap",
  "bridge",
  "deposit",
  "withdraw",
  "internal_transfer",
  "external_transfer",
  "onramp",
  "offramp",
  "xstock_buy",
  "xstock_sell",
  "receive",
  "unknown",
];

/**
 * Chain IDs Cerebro reports on, keyed by chainId.
 *
 * HyperEVM is **999**, not 13381: the old dashboard's registry
 * (`hyxora-admin-main/src/lib/chains.ts`) is what the indexers stamp on every
 * `sponsored_user_ops` row, and Cerebro groups by that column. 13381 was a guess,
 * and it is what left «Por cadena» rendering "Chain 999".
 */
export const cerebroChains = {
  137: "Polygon",
  8453: "Base",
  56: "BSC",
  999: "HyperEVM",
  // Not an EVM chain id — Solana has none, and it arrives under two different
  // numbers depending on which table the row came from. 101 is the cluster number
  // the app backend stamps, on the /costs/recent and /fees/recent feeds; those
  // rows also carry `source: "solana"`, the field to trust when the two disagree.
  // 1399811149 is the sentinel the old dashboard's indexer writes into
  // `treasury_fees.chain_id` (`SOLANA_CHAIN_ID` in its chains.ts) to keep the
  // non-EVM rows out of every EVM aggregation, so it is what the group-by
  // endpoints report — /fees/treasury/by-chain among them.
  101: "Solana",
  1399811149: "Solana",
  // Deprecated. Hyxora stopped routing through Ethereum, but its historical
  // treasury rows are still in the table and still come back from the group-by
  // endpoints, which don't filter them. Labelled so a stray row reads "Ethereum"
  // rather than "Chain 1"; deliberately absent from `cerebroActiveChains` below,
  // the way the old dashboard's EXCLUDED_CHAIN_IDS kept that data but never
  // counted it.
  1: "Ethereum",
};

/**
 * The networks Hyxora runs on, in the order the old dashboard lists them:
 * `ALL_CHAINS` from `hyxora-admin-main/src/lib/chains.ts`, with Solana appended
 * the way its «Redes» page does it — non-EVM, so it lives outside that registry.
 *
 * Per-chain breakdowns iterate **this** list and look each API row up by id,
 * instead of rendering whatever rows came back. Cerebro's group-by endpoints only
 * emit a row for a chain that has data, so reading the response directly is what
 * dropped Polygon — no treasury inflows yet — off «Ingresos por cadena», while
 * putting a "Chain 1" row there for Ethereum's history.
 */
export const cerebroActiveChains = [
  { chainId: 8453, name: "Base" },
  { chainId: 137, name: "Polygon" },
  { chainId: 56, name: "BSC" },
  { chainId: 999, name: "HyperEVM" },
  { chainId: 1399811149, name: "Solana" },
];

/**
 * Chain *slugs* — Zerion own vocabulary, which /holdings reports instead of a
 * chainId because its source table (daily_positions_by_user) stores the slug as
 * text. Solana has no numeric id in that map at all, so slugs are the only key
 * that covers every row there.
 */
export const cerebroChainSlugs = {
  ethereum: "Ethereum",
  base: "Base",
  polygon: "Polygon",
  "binance-smart-chain": "BNB Chain",
  hyperevm: "HyperEVM",
  solana: "Solana",
};

/**
 * Label for a row that identifies its chain either way round: /holdings sends
 * `chain: "base"`, every other Cerebro endpoint sends `chainId: 8453`. Reading only
 * one of the two is what left the «Redes» column showing "Chain undefined".
 *
 * Unknown slugs are title-cased rather than dashed — a chain we simply have not
 * labelled yet reads better spelled out than hidden behind a dash.
 *
 * @param {{ chain?: string, chainName?: string, chainId?: number | string }} row
 * @return {string}
 */
export const cerebroChainLabel = (row = {}) => {
  const { chain, chainName, chainId } = row;
  if (chainName) return chainName;

  if (typeof chain === "string" && chain.trim() !== "") {
    const slug = chain.trim().toLowerCase();
    return (
      cerebroChainSlugs[slug] ??
      slug
        .split("-")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  if (chainId === undefined || chainId === null || chainId === "") return "—";
  return cerebroChains[chainId] ?? `Chain ${chainId}`;
};

/** Sort columns accepted by GET /users. */
export const cerebroUserSorts = ["created", "tvl", "cost", "fees", "net", "plan"];

/** Treasury inflow sources accepted by GET /fees/treasury/by-token. */
export const cerebroTreasurySources = ["user-fees", "treasury-management", "all"];

/**
 * Spanish labels for `cerebroOperations`, plus the aliases the API still emits for
 * older rows. Sentence case, matching the rest of the admin copy.
 */
export const cerebroOperationLabels = {
  swap: "Swap",
  bridge: "Bridge",
  deposit: "Depósito en vault",
  withdraw: "Retiro de vault",
  internal_transfer: "Transferencia interna",
  external_transfer: "Transferencia externa",
  transfer: "Transferencia externa",
  onramp: "On-ramp",
  offramp: "Off-ramp",
  xstock_buy: "Compra xStock",
  xstock_sell: "Venta xStock",
  xstock_fees: "Comisiones y gas xStock (Solana)",
  xstock_fee: "Comisiones xStock (Solana)",
  xstock_sponsorship: "Patrocinio xStock (Solana)",
  xstocks: "xStocks",
  receive: "Recepción",
  send: "Envío",
  fee: "Comisión",
  unknown: "Sin clasificar",
};

/** Casings the humaniser must not lowercase away. */
const operationWordCasing = {
  xstock: "xStock",
  xstocks: "xStocks",
  nft: "NFT",
  evm: "EVM",
  usd: "USD",
  eur: "EUR",
  sepa: "SEPA",
};

/**
 * Display label for an operation key.
 *
 * Falls back to humanising the key rather than to a dash: the tagger adds
 * categories on its own schedule, and a legend of "—" rows is worse than an
 * unaccented «Alta de wallet». A key with no entry above is a copy gap, not
 * missing data.
 *
 * @param {string | null | undefined} operation
 * @return {string}
 */
export const cerebroOperationLabel = (operation) => {
  if (typeof operation !== "string" || operation.trim() === "") {
    return cerebroOperationLabels.unknown;
  }

  const key = operation.trim();
  const known = cerebroOperationLabels[key] ?? cerebroOperationLabels[key.toLowerCase()];
  if (known) return known;

  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => operationWordCasing[word.toLowerCase()] ?? word.toLowerCase());

  if (words.length === 0) return cerebroOperationLabels.unknown;
  const [first, ...rest] = words;
  return [first[0].toUpperCase() + first.slice(1), ...rest].join(" ");
};

/**
 * Colour per operation, keyed by the operation itself and **not** by its position
 * in a sorted list. Two reasons, both learned in the old dashboard:
 *
 *   1. the same functionality keeps its colour across panels, so a revenue donut
 *      and a cost donut can be read side by side; and
 *   2. a colour is never assigned by rank, so the biggest slice can't land on a
 *      near-black or grey entry just because the data happened to sort it first.
 *
 * Every value is a bright hue for that second reason — no slate, grey or black.
 */
export const cerebroOperationColors = {
  swap: "#3B82F6",
  bridge: "#06B6D4",
  deposit: "#10B981",
  withdraw: "#F59E0B",
  internal_transfer: "#6366F1",
  external_transfer: "#8B5CF6",
  // Legacy bucket, folded into external_transfer for display — same colour so the
  // fold is invisible if an un-normalised row ever slips through.
  transfer: "#8B5CF6",
  onramp: "#14B8A6",
  offramp: "#EC4899",
  xstock_buy: "#D946EF",
  xstock_sell: "#F43F5E",
  xstock_fees: "#EC4899",
  xstock_fee: "#EC4899",
  xstock_sponsorship: "#F472B6",
  xstocks: "#D946EF",
  receive: "#0EA5E9",
  send: "#A855F7",
  fee: "#84CC16",
  unknown: "#F97316",
};

/** Rotation for operations the map doesn't name yet — still bright, never grey. */
const operationColorFallback = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#F43F5E",
  "#06B6D4",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#0EA5E9",
];

/**
 * @param {string | null | undefined} operation
 * @param {number} [index] Position in the rendered list, used only to spread the
 * fallback rotation across several unmapped operations.
 * @return {string}
 */
export const cerebroOperationColor = (operation, index = 0) =>
  cerebroOperationColors[operation] ??
  operationColorFallback[index % operationColorFallback.length];

/**
 * Block explorers per chain, for tx links in the fee tables.
 *
 * `utils/explorer.js` can't be used here: it only knows the chains the app itself
 * transacts on and falls back to Sepolia Etherscan for everything else, which would
 * produce dead links for Cerebro's Polygon/BSC rows.
 */
export const cerebroExplorers = {
  137: "https://polygonscan.com",
  8453: "https://basescan.org",
  56: "https://bscscan.com",
  // The explorer the old dashboard's registry links HyperEVM rows to, on the same
  // /tx/ path as every Etherscan fork.
  999: "https://hyperevmscan.io",
  // Solscan takes a signature on the same /tx/ path an EVM explorer takes a hash,
  // so Solana rows on the recent feeds link without a special case.
  101: "https://solscan.io",
};

/**
 * @param {number | string} chainId
 * @param {string} txHash
 * @return {string | null} null when we have no explorer for that chain.
 */
export const cerebroTxUrl = (chainId, txHash) => {
  const explorer = cerebroExplorers[chainId];
  return explorer && txHash ? `${explorer}/tx/${txHash}` : null;
};

/**
 * Plans come back lowercase ("premium"); the admin tables show them capitalised.
 *
 * @param {string | null | undefined} plan
 * @return {string}
 */
export const cerebroPlanLabel = (plan) =>
  typeof plan === "string" && plan.length > 0 ? plan[0].toUpperCase() + plan.slice(1) : "—";
