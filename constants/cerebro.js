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

/** Chain IDs Cerebro reports on, keyed by chainId. */
export const cerebroChains = {
  137: "Polygon",
  8453: "Base",
  56: "BSC",
  13381: "HyperEVM",
  // Not an EVM chain id — Solana has none. 101 is the cluster number the backend
  // stamps on Solana rows so they can share a column with the EVM ones, and it
  // arrives on the /costs/recent and /fees/recent feeds. Those rows also carry
  // `source: "solana"`, which is the field to trust when the two disagree.
  101: "Solana",
};

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
 * Block explorers per chain, for tx links in the fee tables.
 *
 * `utils/explorer.js` can't be used here: it only knows the chains the app itself
 * transacts on and falls back to Sepolia Etherscan for everything else, which would
 * produce dead links for Cerebro's Polygon/BSC rows.
 *
 * HyperEVM (13381) is deliberately absent — no confirmed explorer, and a wrong link
 * is worse than plain text. Its hashes render unlinked until we have one.
 */
export const cerebroExplorers = {
  137: "https://polygonscan.com",
  8453: "https://basescan.org",
  56: "https://bscscan.com",
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
