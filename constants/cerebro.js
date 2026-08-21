/** Membership plans accepted by the `plan` filter. */
export const cerebroPlans = ["basic", "premium", "business", "founder"];

/** Operation types accepted by the `op` filter and returned in `operation` fields. */
export const cerebroOperations = [
  "swap",
  "bridge",
  "deposit",
  "withdraw",
  "onramp",
  "offramp",
  "stake",
  "unstake",
  "claim",
  "approve",
  "other",
];

/** Chain IDs Cerebro reports on, keyed by chainId. */
export const cerebroChains = {
  137: "Polygon",
  8453: "Base",
  56: "BSC",
  13381: "HyperEVM",
};

/** Sort columns accepted by GET /users. */
export const cerebroUserSorts = ["created", "tvl", "cost", "fees", "net", "plan"];

/** Treasury inflow sources accepted by GET /fees/treasury/by-token. */
export const cerebroTreasurySources = ["user-fees", "treasury-management", "all"];

/**
 * Spanish labels for `cerebroOperations`, used across the admin UI. The keys are
 * the API vocabulary — the ported dashboard shows extra categories (xStock, deploy,
 * transferencias internas) that Cerebro folds into these eleven.
 */
export const cerebroOperationLabels = {
  swap: "Swap",
  bridge: "Bridge",
  deposit: "Depósito en vault",
  withdraw: "Retiro de vault",
  onramp: "On-ramp",
  offramp: "Off-ramp",
  stake: "Stake",
  unstake: "Unstake",
  claim: "Reclamar",
  approve: "Aprobación",
  other: "Otros",
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
