import { shortenHash } from "@/utils/format";

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
 * Chains whose indexer cursors are **expected** to sit frozen: `active: false` in
 * the old dashboard's registry (`hyxora-admin-main/src/lib/chains.ts`).
 *
 * Not the same thing as being absent from `cerebroActiveChains`. Polygon is still a
 * network the dashboard lists — it keeps its row in every per-chain table and its
 * history in the data — but nothing routes through it any more, so its cursors never
 * advance again and painting them red is crying wolf at a state nobody can fix.
 * Ethereum is deprecated outright and belongs here for the same reason. «Estado del
 * sistema» greys both out and leaves them out of its stalled count, exactly as
 * `SystemHealthCard.tsx` does with `chainById(id)?.active !== false`.
 */
export const cerebroColdCursorChainIds = new Set([137, 1]);

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

  // ── The app backend's own vocabulary ────────────────────────────────────────
  // `/users/{privyId}/transactions` labels each op from three sources, best first:
  // `hyxora_activities.action_type` (these), the tagger's heuristic, then the
  // treasury row's `operation_type` (the lowercase keys above). So one table mixes
  // both spellings, and folding them here keeps «Swap» a single legend entry
  // instead of «Swap» and «Swap quote» sitting next to each other.
  SWAP_QUOTE: "Swap",
  SWAP: "Swap",
  BRIDGE: "Bridge",
  VAULT_DEPOSIT: "Depósito en vault",
  ORDER_VAULT_DEPOSIT: "Depósito en vault",
  DEPOSIT: "Depósito en vault",
  VAULT_WITHDRAW: "Retiro de vault",
  WITHDRAW: "Retiro de vault",
  ONRAMP: "On-ramp",
  OFFRAMP: "Off-ramp",
  BUY_ETF: "Compra xStock",
  XSTOCK_BUY: "Compra xStock",
  SELL_ETF: "Venta xStock",
  XSTOCK_SELL: "Venta xStock",
  INTERNAL_TRANSFER: "Transferencia interna",
  EXTERNAL_TRANSFER: "Transferencia externa",
  SEND: "Envío",
  RECEIVE: "Recepción",
};

/**
 * The tagger key an operation belongs to, whichever vocabulary it arrived in.
 *
 * `cerebroOperationColor` is keyed on the lowercase tagger words, so a row labelled
 * `SWAP_QUOTE` would otherwise fall to the unmapped rotation and land a different
 * colour from the `swap` row beside it — in the same table, for the same thing.
 *
 * @param {string | null | undefined} operation
 * @return {string} A key of `cerebroOperationColors`, or the lowercased input when
 * it maps to nothing — the colour helper's fallback rotation handles it from there.
 */
export const cerebroOperationKey = (operation) => {
  if (typeof operation !== "string" || operation.trim() === "") return "unknown";

  const key = operation.trim();
  if (cerebroOperationColors[key]) return key;

  const lower = key.toLowerCase();
  if (cerebroOperationColors[lower]) return lower;

  return backendOperationKeys[key.toUpperCase()] ?? lower;
};

/** Backend `action_type` → the tagger key that carries its colour. */
const backendOperationKeys = {
  SWAP_QUOTE: "swap",
  SWAP: "swap",
  BRIDGE: "bridge",
  VAULT_DEPOSIT: "deposit",
  ORDER_VAULT_DEPOSIT: "deposit",
  DEPOSIT: "deposit",
  VAULT_WITHDRAW: "withdraw",
  WITHDRAW: "withdraw",
  ONRAMP: "onramp",
  OFFRAMP: "offramp",
  BUY_ETF: "xstock_buy",
  XSTOCK_BUY: "xstock_buy",
  SELL_ETF: "xstock_sell",
  XSTOCK_SELL: "xstock_sell",
  INTERNAL_TRANSFER: "internal_transfer",
  EXTERNAL_TRANSFER: "external_transfer",
  SEND: "send",
  RECEIVE: "receive",
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
 * Explorer link for a *wallet*, which the tx helper can't serve: Solscan files
 * accounts under `/account/` while every Etherscan fork uses `/address/`.
 *
 * `chainId` is optional because the monitoring routes report treasuries by label
 * and never by network — a Safe carries the same address on every EVM chain, so
 * there is no single right answer. Falling back on the address shape sends `0x…`
 * to Basescan, Base being where the treasury actually collects, and everything
 * else to Solscan.
 *
 * @param {string | null | undefined} address
 * @param {number | string} [chainId]
 * @return {string | null} null when we have no explorer for that chain.
 */
export const cerebroAddressUrl = (address, chainId) => {
  if (typeof address !== "string" || address.trim() === "") return null;

  const id = chainId ?? (address.startsWith("0x") ? 8453 : 101);
  const explorer = cerebroExplorers[id];
  if (!explorer) return null;

  return `${explorer}/${explorer.includes("solscan") ? "account" : "address"}/${address}`;
};

/**
 * Plans come back lowercase ("premium"); the admin tables show them capitalised.
 *
 * @param {string | null | undefined} plan
 * @return {string}
 */
export const cerebroPlanLabel = (plan) =>
  typeof plan === "string" && plan.length > 0 ? plan[0].toUpperCase() + plan.slice(1) : "—";

/**
 * Zerion's protocol names, mapped to the labels the product uses.
 *
 * A port of `VAULT_PROTOCOL_DISPLAY` in `hyxora-admin-main/src/lib/vaults.ts`. It
 * normalises, it does not whitelist: a protocol with no entry renders under
 * Zerion's own name rather than being hidden.
 */
const cerebroVaultProtocols = {
  fluid: "Fluid",
  "morpho blue": "Morpho",
  morpho: "Morpho",
  "summer.fi": "SummerFi",
  summerfi: "SummerFi",
  summer: "SummerFi",
  "lazy-summer": "SummerFi",
  "40 acres": "40 Acres",
  "40acres": "40 Acres",
  "forty-acres": "40 Acres",
  "forty acres": "40 Acres",
};

/**
 * @param {string | null | undefined} protocol
 * @return {string}
 */
export const cerebroVaultProtocolLabel = (protocol) => {
  if (typeof protocol !== "string" || protocol.trim() === "") return "—";
  return cerebroVaultProtocols[protocol.trim().toLowerCase()] ?? protocol;
};

/**
 * Contract address → ticker, keyed `${chainId}:${lowercased address}`.
 *
 * Vendored from `hyxora-admin-main/src/lib/tokens.ts`, and a **display fallback in
 * exactly the way that file says it is** — the authoritative list of every token
 * Hyxora supports is the backend's `/token/list`, which this app already reads
 * through `hooks/appApi/useGetWhitelistedTokens`. It is not read here on purpose:
 * the only caller is the «Detalle» column of one user's transaction table, where
 * `/users/{privyId}/transactions` reports the token pair as raw addresses, and
 * fetching a whitelist to letter one column would make `usuarios/` the third
 * exception to the Cerebro-only rule in CLAUDE.md for a cosmetic gain.
 *
 * An address with no entry falls back to its own truncation, which is what the old
 * dashboard renders too — the column never goes blank on an unknown token.
 */
const cerebroTokenSymbols = {
  // Base
  "8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC",
  "8453:0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42": "EURC",
  "8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf": "cbBTC",
  "8453:0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": "cbETH",
  "8453:0x311935cd80b76769bf2ecc9d8ab7635b2139cf82": "SOL",
  "8453:0x4200000000000000000000000000000000000006": "WETH",
  // Base vaults
  "8453:0xef417a2512c5a41f69ae4e021648b69a7cde5d03": "ygOG",
  "8453:0xf24608e0ccb972b0b0f4a6446a0bbf58c701a026": "mwEURC",
  "8453:0xee8f4ec5672f09119b96ab6fb59c27e1b7e44b61": "gtUSDCp",
  "8453:0xf42f5795d9ac7e9d757db633d693cd548cfd9169": "fUSDC",
  "8453:0x1943fa26360f038230442525cf1b9125b5dcb401": "fEURC",
  "8453:0x98c49e13bf99d7cad8069faa2a370933ec9ecf17": "LVUSDC",
  "8453:0x64db8f51f1bf7064bb5a361a7265f602d348e0f0": "LVEURC",
  "8453:0x2bb9ad69feba5547b7cd57aafe8457d40bf834af": "LVWETH",
  "8453:0xb99b6df96d4d5448cc0a5b3e0ef7896df9507cf5": "VAULT",
  // HyperEVM. WHYPE is the canonical cross-chain swap destination there and is
  // absent from the backend whitelist, so without this row the column renders
  // `0x5555…5555`.
  "999:0xf4d9235269a96aadafc9adae454a0618ebe37949": "XAUt0",
  "999:0x5555555555555555555555555555555555555555": "WHYPE",
};

/**
 * Chain **slugs** as the app backend's activity cache spells them, mapped to the
 * numeric ids `cerebroTokenSymbols` is keyed by. `hyxora_activities` stores
 * `from_chain` / `to_chain` as these slugs, so a token lookup has to go through
 * here first.
 */
const cerebroActivityChainIds = {
  base: 8453,
  polygon: 137,
  bsc: 56,
  hyperevm: 999,
};

/**
 * Ticker for a token on a chain, given the vocabulary
 * `/users/{privyId}/transactions` uses: a slug for the chain and a contract
 * address for the token.
 *
 * @param {string | null | undefined} chainSlug "base", "hyperevm", …
 * @param {string | null | undefined} address Contract address.
 * @return {string | null} null when either half is missing — the caller renders
 * nothing rather than a dash for a leg that doesn't exist.
 */
export const cerebroTokenSymbol = (chainSlug, address) => {
  if (typeof address !== "string" || address.trim() === "") return null;
  if (typeof chainSlug !== "string" || chainSlug.trim() === "") return null;

  const chainId = cerebroActivityChainIds[chainSlug.trim().toLowerCase()];
  const known = chainId ? cerebroTokenSymbols[`${chainId}:${address.trim().toLowerCase()}`] : null;

  return known ?? shortenHash(address, { lead: 6, tail: 4 });
};
