/**
 * Vocabulary of the Hyxora app backend (app-api.hyxora.com).
 *
 * Kept apart from `constants/cerebro.js`: Cerebro's operation keys are its own
 * eleven lowercase categories, while these are the eleven `action` values the
 * fee schema uses. They overlap in meaning but not in spelling, and mapping one
 * onto the other would quietly merge rows that aren't the same thing.
 */

/** `action` values accepted by the fee schema, per the OpenAPI spec. */
export const appApiFeeActions = [
  "VAULT_DEPOSIT",
  "VAULT_WITHDRAW",
  "INTERNAL_TRANSFER",
  "EXTERNAL_TRANSFER",
  "SWAP_QUOTE",
  "BRIDGE",
  "ORDER_VAULT_DEPOSIT",
  "OFFRAMP",
  "BUY_ETF",
  "SELL_ETF",
  "UNATTRIBUTED",
];

/**
 * Spanish labels for `appApiFeeActions`. BUY_ETF / SELL_ETF are deliberately
 * left verbatim — that's how the ported dashboard shows them.
 */
export const appApiFeeActionLabels = {
  VAULT_DEPOSIT: "Depósito en vault",
  VAULT_WITHDRAW: "Retiro de vault",
  INTERNAL_TRANSFER: "Transferencia interna",
  EXTERNAL_TRANSFER: "Transferencia externa",
  SWAP_QUOTE: "Swap",
  BRIDGE: "Bridge",
  ORDER_VAULT_DEPOSIT: "Orden de depósito en vault",
  OFFRAMP: "Off-ramp (crypto → SEPA)",
  BUY_ETF: "BUY_ETF",
  SELL_ETF: "SELL_ETF",
  UNATTRIBUTED: "Sin atribuir",
};

/** Chains app-api reports on. Superset of Cerebro's map — it includes Solana. */
export const appApiChainLabels = {
  solana: "Solana",
  base: "Base",
  bsc: "BSC",
  mainnet: "Ethereum",
  hyperevm: "HyperEVM",
  polygon: "Polygon",
  matic: "Polygon",
  arbitrum: "Arbitrum",
};

/**
 * app-api returns money in minor units and fees in basis points.
 * @param {number | null | undefined} value Minor units, e.g. 1900.
 * @return {number | null} Major units, e.g. 19.
 */
export const fromMinorUnits = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value / 100 : null;

/**
 * @param {number | null | undefined} bps Basis points, e.g. 20.
 * @return {number | null} Percent, e.g. 0.2.
 */
export const bpsToPercent = (bps) =>
  typeof bps === "number" && Number.isFinite(bps) ? bps / 100 : null;
