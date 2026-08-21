/**
 * Adapters for the /admin/fees payload.
 *
 * The ported dashboard's screenshots show the rendered tables but not the JSON,
 * so the exact field names aren't confirmed. Every guess lives here rather than
 * scattered through the panels: when the real shape is known, this is the only
 * file that changes. The panels themselves carry a "Ver JSON" inspector so the
 * first authenticated load reveals the truth.
 */

/** First finite number among the candidates, else null. */
const num = (...candidates) =>
  candidates.find((value) => typeof value === "number" && Number.isFinite(value)) ?? null;

/** First non-empty string among the candidates, else null. */
const str = (...candidates) =>
  candidates.find((value) => typeof value === "string" && value.length > 0) ?? null;

/** Anything not explicitly false/0/"false" counts as active. */
const isActive = (raw) => {
  const flag = raw?.active ?? raw?.isActive ?? raw?.enabled ?? true;
  return flag !== false && flag !== 0 && flag !== "false";
};

/** Pull an array out of a payload that might be the array itself or wrap it. */
const pickArray = (payload, ...keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

/**
 * Display names for operation keys. Anything unmapped renders as the raw key —
 * which is why BUY_ETF / SELL_ETF show verbatim in the original dashboard.
 * Keyed on a squashed form so casing and separators don't matter.
 */
const OPERATION_LABELS = {
  swap: "Swap",
  vaultdeposit: "Vault deposit",
  vaultwithdraw: "Vault withdraw",
  internaltransfer: "Internal transfer",
  externaltransfer: "External transfer",
  offramp: "Off-ramp (crypto → SEPA)",
  offrampsepa: "Off-ramp (crypto → SEPA)",
  onramp: "On Ramp deposit",
  onrampdeposit: "On Ramp deposit",
};

const squash = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * @param {string} key
 * @return {string} Friendly label, or the key itself when unmapped.
 */
export const operationLabel = (key) => OPERATION_LABELS[squash(key)] ?? String(key ?? "—");

/**
 * @param {unknown} payload Raw /admin/fees response.
 * @return {{ name: string, priceAmount: number | null, currency: string,
 *   stripeProductId: string | null, active: boolean, raw: unknown }[]}
 */
export const normalizePlans = (payload) =>
  pickArray(payload?.plans ?? payload, "plans", "memberships").map((raw) => ({
    name: str(raw?.name, raw?.plan, raw?.planName, raw?.tier) ?? "—",
    priceAmount: num(raw?.price, raw?.amount, raw?.priceAmount, raw?.monthlyPrice),
    currency: str(raw?.currency, raw?.priceCurrency) ?? "EUR",
    stripeProductId: str(
      raw?.stripeProductId,
      raw?.stripeProduct,
      raw?.productId,
      raw?.stripe_product_id
    ),
    active: isActive(raw),
    raw,
  }));

/**
 * @param {unknown} payload Raw /admin/fees response.
 * @return {{ plan: string, operation: string, percent: number | null,
 *   minUsd: number | null, maxUsd: number | null, active: boolean }[]}
 */
export const normalizeFees = (payload) =>
  pickArray(payload?.fees ?? payload, "fees", "feeSchema", "schema").map((raw) => ({
    plan: str(raw?.plan, raw?.planName, raw?.membership, raw?.tier) ?? "—",
    operation: str(raw?.operation, raw?.op, raw?.type, raw?.action) ?? "—",
    percent: num(raw?.percentage, raw?.percent, raw?.feePercent, raw?.fee, raw?.rate),
    minUsd: num(raw?.min, raw?.minFee, raw?.minUsd, raw?.minAmount),
    maxUsd: num(raw?.max, raw?.maxFee, raw?.maxUsd, raw?.maxAmount),
    active: isActive(raw),
  }));

/**
 * Pivot the flat fee list into operation-rows × plan-columns.
 *
 * Plan order follows the API rather than a hardcoded list — the backend already
 * returns them in the order the dashboard displays them, and hardcoding would
 * silently drop any plan added later.
 *
 * @param {ReturnType<typeof normalizeFees>} fees
 * @param {ReturnType<typeof normalizePlans>} plans
 * @return {{ planNames: string[], rows: object[] }} Each row is
 * `{ operation, label, [planName]: fee | null }` so DataTable can sort on a plan column.
 */
export const buildFeeMatrix = (fees, plans) => {
  // Plans that appear only in the fee list still deserve a column.
  const planNames = [...plans.map((plan) => plan.name)];
  for (const fee of fees) {
    if (fee.plan !== "—" && !planNames.includes(fee.plan)) planNames.push(fee.plan);
  }

  const byOperation = new Map();

  for (const fee of fees) {
    if (!byOperation.has(fee.operation)) {
      byOperation.set(fee.operation, {
        operation: fee.operation,
        label: operationLabel(fee.operation),
      });
    }
    byOperation.get(fee.operation)[fee.plan] = fee;
  }

  return { planNames, rows: [...byOperation.values()] };
};

/**
 * Whitelisted tokens / vaults. Same defensive treatment as the fee schema — the
 * endpoints themselves are unconfirmed (see hooks/admin/useGetWhitelist.jsx).
 *
 * @param {unknown} payload
 * @param {"tokens" | "vaults"} kind
 * @return {object[]}
 */
export const normalizeWhitelistRows = (payload, kind) => {
  const rows = pickArray(payload, kind, "whitelist", "items", "data");

  return rows.map((raw) => ({
    symbol: str(raw?.symbol, raw?.ticker) ?? "—",
    name: str(raw?.name, raw?.tokenName, raw?.vaultName, raw?.label) ?? "—",
    // Kept raw so chainLabel() can decide between a name and an id.
    chainName: str(raw?.chainName, raw?.chain, raw?.network),
    chainId: num(raw?.chainId, raw?.chain_id),
    decimals: num(raw?.decimals, raw?.decimal),
    address: str(raw?.address, raw?.tokenAddress, raw?.vaultAddress, raw?.contract),
    type: str(raw?.type, raw?.protocol, raw?.kind, raw?.vaultType),
    defiLlamaId: str(raw?.defiLlamaId, raw?.defillamaId, raw?.llamaId, raw?.poolId),
    active: isActive(raw),
    raw,
  }));
};

/**
 * The whitelist endpoints may name the chain or only give an id.
 *
 * Deliberately does NOT fall back to `constants/cerebro.js`: that map only covers
 * the four chains Cerebro reports on, while these tables also list Ethereum,
 * Polygon and Arbitrum. A wrong name is worse than a bare id.
 *
 * @param {{ chainName: string | null, chainId: number | null }} row
 * @return {string}
 */
export const chainLabel = (row) => {
  if (row?.chainName) return row.chainName;
  if (row?.chainId !== null && row?.chainId !== undefined) return `Chain ${row.chainId}`;
  return "—";
};
