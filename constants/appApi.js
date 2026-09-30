/**
 * Vocabulary of the Hyxora app backend (the gateway's `/app` service).
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

/**
 * Gas ceilings the **app** falls back to when `/admin/gas-limits` has no row for
 * a chain. Not served by any endpoint: they are hardcoded in the app repo
 * (`hyxora-app/constants/gasLimits.ts` → `DEFAULT_MAX_GAS_PRICES`), and the app's
 * own admin screen shows them under a «Predeterminado» badge exactly like this.
 *
 * Mirrored here so the Costos table can show a ceiling for every chain instead
 * of a dash — but they are a *copy*, so a change in the app repo has to be
 * repeated here. That is why the row says where its number came from.
 */
export const appApiDefaultMaxGasGwei = {
  base: 0.1,
  bsc: 1,
  hyperevm: 15,
  polygon: 750,
};
