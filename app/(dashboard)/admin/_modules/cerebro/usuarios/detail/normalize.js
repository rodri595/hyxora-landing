import { cerebroChainLabel, cerebroTokenSymbol } from "@/constants/cerebro";
import { firstNumber, sumDefined } from "../../../shared/aggregate";

/**
 * Reading `/users/{privyId}` and its three siblings.
 *
 * These endpoints are ports of `hyxora-admin-main/src/lib/queries.ts`, and — as
 * with `/holdings` and `/fees/diagnostics` before them — several answer with the
 * field names that query's mapper produced rather than the ones admin.md
 * documents. `/users/{privyId}/vaults` and `/pnl` are documented by name only and
 * proxy an app backend that serialises **every USD field as a decimal string**.
 *
 * So nothing in the drawer reads a response field directly. Everything comes
 * through here, every figure goes through `firstNumber` (which coerces those
 * strings), and a field that arrives under neither spelling reads back as `null`
 * rather than `0` — on a page showing someone's balance, a confident zero is worse
 * than an honest dash.
 */

/**
 * First non-empty string among alternative spellings. The sibling of `firstNumber`.
 *
 * @param {...(string | null | undefined)} values
 * @return {string | null}
 */
export const firstString = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/* Portfolio positions                                                        */
/* -------------------------------------------------------------------------- */

/**
 * An xStock is a plain SPL token on the user's Solana wallet — nothing in the
 * position row marks it as an equity except Zerion's `name` ("SP500 xStock"). The
 * old dashboard keys off exactly that marker, and it stays chain-agnostic on
 * purpose so it can't accidentally swallow SOL or USDC.
 *
 * @param {{ name?: string }} position
 * @return {boolean}
 */
const isXStock = (position) => /xstock/i.test(position?.name ?? "");

/**
 * A yield-bearing deposit, as opposed to a token sitting in the Safe.
 *
 * `reward` positions — gauge accruals, incentive dust, almost always under $1 —
 * are deliberately not vaults: they would head the vault list by count while
 * contributing nothing, which is why the old dashboard folds them into wallet
 * assets. Ported from `isYieldingVaultPosition` in its `lib/vaults.ts`.
 *
 * @param {{ protocol?: string | null, positionType?: string }} position
 * @return {boolean}
 */
const isVaultPosition = (position) => {
  const protocol = position?.protocol;
  if (!protocol || String(protocol).toLowerCase() === "wallet") return false;
  return position?.positionType !== "reward";
};

/**
 * One position, in the shape the tables render.
 *
 * `valueUsd` is the query's spelling and `usdValue` admin.md's; `chain` is a Zerion
 * slug and `chainId` the number the doc claims — `cerebroChainLabel` reads either,
 * which is the whole reason it exists.
 *
 * @param {Object} position
 * @param {number} index Only used to build a stable React key; a user can hold the
 * same symbol under two protocols, so symbol alone is not unique.
 * @return {Object}
 */
const toPositionRow = (position, index) => {
  const chainLabel = cerebroChainLabel(position ?? {});

  return {
    id: `${position?.symbol ?? "?"}-${position?.protocol ?? ""}-${chainLabel}-${index}`,
    chainLabel,
    protocol: position?.protocol ?? null,
    symbol: firstString(position?.symbol) ?? "—",
    name: firstString(position?.name) ?? "",
    balance: firstNumber(position?.balance),
    priceUsd: firstNumber(position?.priceUsd, position?.price),
    valueUsd: firstNumber(position?.valueUsd, position?.usdValue, position?.totalUsd),
    positionType: position?.positionType ?? null,
    iconUrl: position?.iconUrl ?? null,
  };
};

/**
 * Positions split into the three groups the portfolio tab shows, each with its own
 * total.
 *
 * The split is the point: a $6.8k Fluid deposit and $0.21 of leftover SOL are both
 * "positions", and reading them in one list tells you nothing about where the money
 * actually is. Order matters too — vaults first because that is where the balance
 * lives, xStocks next because they are a product rather than a leftover, loose
 * tokens last.
 *
 * Rows sort by chain and then by value, so a chain's positions stay together
 * without the table needing one header per network the way the old page did.
 *
 * @param {Object[]} positions `portfolio.positions` from `/users/{privyId}`.
 * @return {{ vaults: Object[], xstocks: Object[], wallet: Object[],
 * vaultTotal: number, xstockTotal: number, walletTotal: number, count: number }}
 */
export const groupPositions = (positions) => {
  const rows = (Array.isArray(positions) ? positions : []).map(toPositionRow);

  const byChainThenValue = (a, b) =>
    a.chainLabel === b.chainLabel
      ? (b.valueUsd ?? 0) - (a.valueUsd ?? 0)
      : a.chainLabel.localeCompare(b.chainLabel);

  const xstocks = rows.filter((row) => isXStock(row)).sort(byChainThenValue);
  const rest = rows.filter((row) => !isXStock(row));
  const vaults = rest.filter(isVaultPosition).sort(byChainThenValue);
  const wallet = rest.filter((row) => !isVaultPosition(row)).sort(byChainThenValue);

  const total = (group) => group.reduce((sum, row) => sum + (row.valueUsd ?? 0), 0);

  return {
    vaults,
    xstocks,
    wallet,
    vaultTotal: total(vaults),
    xstockTotal: total(xstocks),
    walletTotal: total(wallet),
    count: rows.length,
  };
};

/* -------------------------------------------------------------------------- */
/* Transactions                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The «Detalle» column: the token pair, and the chain hop when there was one.
 *
 * Only backend-tagged rows carry these — a tx the heuristic labelled has all four
 * fields null and renders nothing, which is honest. Tokens arrive as contract
 * addresses, so they go through `cerebroTokenSymbol`.
 *
 * @param {Object} tx
 * @return {{ from: string | null, to: string | null, hop: string | null }}
 */
const toTxDetail = (tx) => {
  const from = cerebroTokenSymbol(tx?.fromChain, tx?.fromToken);
  const to = cerebroTokenSymbol(tx?.toChain, tx?.toToken);

  const crossChain =
    tx?.fromChain &&
    tx?.toChain &&
    String(tx.fromChain).toLowerCase() !== String(tx.toChain).toLowerCase();

  return {
    from,
    to,
    hop: crossChain
      ? `${cerebroChainLabel({ chain: tx.fromChain })} → ${cerebroChainLabel({ chain: tx.toChain })}`
      : null,
  };
};

/**
 * One sponsored op, cost and fee side by side.
 *
 * admin.md documents `timestamp` / `costUsd` / `feesUsd` / `operation`; the query
 * emits `blockTimestamp` / `totalCostUsd` / `feeUsd` / `operationType`. Both are
 * read, exactly as `ingresos/FeeTaggingPanel.toTagRow()` does for the fee feeds.
 *
 * `netUsd` is recomputed rather than trusted: it is the one figure a reader will
 * check by subtracting the two columns next to it, so it has to be those two
 * columns. A missing *fee* is a real zero — most ops earn nothing — so only a row
 * where neither side arrived reads back as null.
 *
 * @param {Object} tx
 * @param {number} index
 * @return {Object}
 */
export const toTxRow = (tx, index) => {
  const costUsd = firstNumber(tx?.totalCostUsd, tx?.costUsd);
  const feeUsd = firstNumber(tx?.feeUsd, tx?.feesUsd);

  return {
    // A batched bundler tx can hold several ops from the same Safe, so the hash
    // repeats across rows and can't be the key on its own.
    id: `${tx?.chainId ?? "?"}-${tx?.txHash ?? index}-${index}`,
    chainId: tx?.chainId ?? null,
    chainLabel: cerebroChainLabel(tx ?? {}),
    txHash: tx?.txHash ?? null,
    timestamp: firstString(tx?.blockTimestamp, tx?.timestamp, tx?.createdAt),
    operation: firstString(tx?.operationType, tx?.operation),
    detail: toTxDetail(tx),
    bundlerCostUsd: firstNumber(tx?.bundlerCostUsd),
    paymasterCostUsd: firstNumber(tx?.paymasterCostUsd),
    costUsd,
    feeUsd,
    feeTokens: firstString(tx?.feeTokens),
    netUsd: costUsd === null && feeUsd === null ? null : (feeUsd ?? 0) - (costUsd ?? 0),
    success: tx?.success,
  };
};

/**
 * The transaction rows out of whichever envelope they came in.
 *
 * `/users/{privyId}` nests its first page under `transactions.rows`;
 * `/users/{privyId}/transactions` returns `transactions` at the top level. The
 * drawer reads both so the tab can render from the detail response before its own
 * paginated query has resolved.
 *
 * @param {Object | null} source
 * @return {Object[]}
 */
export const readTxRows = (source) => {
  const rows = Array.isArray(source?.transactions)
    ? source.transactions
    : Array.isArray(source?.rows)
      ? source.rows
      : [];
  return rows.map(toTxRow);
};

/* -------------------------------------------------------------------------- */
/* Ramp orders                                                                */
/* -------------------------------------------------------------------------- */

/**
 * One SEPA order, with the deposit and withdraw legs kept apart.
 *
 * The reason they stay apart is the support case this table exists for: a user
 * saying "I sent the money and nothing arrived" is an onramp with an
 * `expectedAmount` and a `depositAmount` of zero, still pending. Collapse the legs
 * into one "amount" and that order looks identical to one for €0.
 *
 * @param {Object} order
 * @return {Object}
 */
export const toRampRow = (order) => {
  const direction = firstString(order?.direction, order?.type)?.toLowerCase() ?? null;
  const isOnramp = direction === "onramp";

  const legAmount = isOnramp
    ? firstNumber(order?.depositAmount)
    : firstNumber(order?.withdrawAmount);
  const legCurrency = isOnramp
    ? firstString(order?.depositCurrency, order?.withdrawCurrency)
    : firstString(order?.withdrawCurrency, order?.depositCurrency);

  // admin.md documents a flat `amountUsd` in place of the two legs. If that is what
  // arrives, the figure is **dollars** — pairing it with the EUR the SEPA legs
  // default to would print a $100 order as €100, which is not a rounding error but
  // a different number. So it only stands in when neither leg is there, and it
  // brings its own currency with it.
  const documentedUsd = legAmount === null ? firstNumber(order?.amountUsd) : null;

  const settledAmount = legAmount ?? documentedUsd;
  const currency = documentedUsd !== null ? "USD" : legCurrency;
  const createdAt = firstString(order?.createdAt);
  const createdMs = createdAt ? new Date(createdAt).getTime() : Number.NaN;

  return {
    id: order?.orderId ?? `${direction}-${createdAt}`,
    orderId: order?.orderId ?? null,
    direction,
    status: firstString(order?.status) ?? "—",
    depositStatus: firstString(order?.depositStatus),
    withdrawStatus: firstString(order?.withdrawStatus),
    // Zero and null are different answers here: 0 is "the bank credited nothing
    // yet", null is "this leg doesn't apply". Only a positive figure counts as
    // settled, which is what makes the pending banner below possible.
    settledAmount,
    hasSettled: (settledAmount ?? 0) > 0,
    expectedAmount: firstNumber(order?.expectedAmount),
    currency,
    fee: firstNumber(order?.fee),
    txHash: firstString(order?.txHash),
    chainId: order?.chainId ?? null,
    createdAt,
    // An unparseable date would otherwise make this NaN, and `NaN !== null` is
    // true — the cell would render "hace NaNd" rather than nothing.
    ageDays: Number.isFinite(createdMs) ? Math.floor((Date.now() - createdMs) / 86_400_000) : null,
  };
};

/**
 * Onramps the user started and the bank has not credited — the one row on this
 * table anybody opens it for.
 *
 * @param {Object[]} rows Output of `toRampRow`.
 * @return {Object[]}
 */
export const pendingDeposits = (rows) =>
  rows.filter(
    (row) =>
      row.direction === "onramp" &&
      row.status.toLowerCase() === "pending" &&
      (row.expectedAmount ?? 0) > 0 &&
      !row.hasSettled
  );

/* -------------------------------------------------------------------------- */
/* Headline blocks                                                            */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object | null} tvl `portfolio.tvl`, which is null for a user whose
 * portfolio has never been snapshotted.
 * @return {{ totalUsd: number | null, vaultUsd: number | null, refreshedAt: string | null,
 * date: string | null }}
 */
export const readTvl = (tvl) => ({
  totalUsd: firstNumber(tvl?.totalUsd),
  vaultUsd: firstNumber(tvl?.vaultUsd),
  refreshedAt: firstString(tvl?.refreshedAt),
  date: firstString(tvl?.date),
});

/**
 * Hyxora's lifetime margin **on** this user: what they paid us in treasury fees
 * against what we spent sponsoring their gas. NFT sales are excluded upstream.
 *
 * Not to be confused with `readPnl`, which is what the *user* made. Both render as
 * signed USD and they are unrelated numbers, which is why the two panels label
 * their sources rather than sitting side by side unattributed.
 *
 * `recoveryPct` only exists when both sides are positive — "0% cost recovery" for
 * a user who has never transacted is a verdict on nothing.
 *
 * @param {Object | null} margin
 * @return {Object}
 */
export const readMargin = (margin) => {
  const costUsd = firstNumber(margin?.costUsd);
  const feesUsd = firstNumber(margin?.feesUsd);
  const netUsd = firstNumber(margin?.netUsd, margin?.marginUsd);

  return {
    costUsd,
    costOps: firstNumber(margin?.costOps),
    feesUsd,
    feeTxs: firstNumber(margin?.feeTxs),
    netUsd:
      netUsd ?? (costUsd === null && feesUsd === null ? null : (feesUsd ?? 0) - (costUsd ?? 0)),
    recoveryPct:
      (feesUsd ?? 0) > 0 && (costUsd ?? 0) > 0 ? ((feesUsd / costUsd) * 100).toFixed(0) : null,
  };
};

/**
 * The subsidy split: how many of this user's sponsored ops earned us a fee and how
 * many we simply paid for.
 *
 * This is the usual answer to "why is this user's margin negative", so `freeRatio`
 * is recomputed from the counts rather than read — the endpoint may or may not send
 * it, and it is trivially derivable from two fields that always arrive.
 *
 * @param {Object | null} freeVsPaid
 * @return {Object}
 */
export const readFreeVsPaid = (freeVsPaid) => {
  const paidOps = firstNumber(freeVsPaid?.paidOps) ?? 0;
  const freeOps = firstNumber(freeVsPaid?.freeOps) ?? 0;
  const totalOps = firstNumber(freeVsPaid?.totalOps) ?? paidOps + freeOps;

  return {
    paidOps,
    freeOps,
    totalOps,
    freePct: totalOps > 0 ? Math.round((freeOps / totalOps) * 100) : 0,
    paidCostUsd: firstNumber(freeVsPaid?.paidCostUsd),
    freeCostUsd: firstNumber(freeVsPaid?.freeCostUsd),
  };
};

/* -------------------------------------------------------------------------- */
/* Undocumented: /vaults and /pnl                                             */
/* -------------------------------------------------------------------------- */

/**
 * Hyxora's own vault positions, which carry the one thing Zerion cannot: a per-vault
 * PnL. Zerion has no entry price, so it can report what a position is worth and
 * never what it earned.
 *
 * The response shape is undocumented and the app backend it proxies serialises USD
 * as decimal strings, so every figure goes through `firstNumber` and the whole
 * block is dropped when nothing usable arrives — the panel renders its «sin datos»
 * line instead of a column of zeros that would read as "this vault earned nothing".
 *
 * @param {Object | null} data Response of `/users/{privyId}/vaults`.
 * @return {{ totalPnlUsd: number | null, positions: Object[] } | null}
 */
export const readVaultPositions = (data) => {
  // The backend's own envelope is `{ data: { positions } }`; the proxy may or may
  // not have unwrapped it, so try both before giving up.
  const source = Array.isArray(data?.positions) ? data : data?.data;
  const positions = Array.isArray(source?.positions) ? source.positions : [];
  if (positions.length === 0) return null;

  const rows = positions
    .map((position, index) => ({
      id: firstString(position?.vaultAddress) ?? `vault-${index}`,
      name: firstString(position?.vaultName, position?.symbol) ?? "—",
      symbol: firstString(position?.symbol),
      chainLabel: cerebroChainLabel(position ?? {}),
      assetsUsd: firstNumber(position?.assetsUsd),
      pnlUsd: firstNumber(position?.pnlUsd),
      roe: firstNumber(position?.roe),
      apy: firstNumber(position?.apy),
    }))
    // Biggest mover first, in either direction — a −$40 position is as much the
    // headline as a +$40 one.
    .sort((a, b) => Math.abs(b.pnlUsd ?? 0) - Math.abs(a.pnlUsd ?? 0));

  return {
    totalPnlUsd: firstNumber(source?.totalPnlUsd),
    totalAssetsUsd: firstNumber(source?.totalAssetsUsd),
    positions: rows,
  };
};

/**
 * One half of the PnL summary — EVM or Solana — whichever field names it turns up
 * under.
 *
 * `costBasis` is derived as value − gain rather than read: that identity is what
 * makes the percentage mean "return on what was put in", and deriving it keeps the
 * figure consistent with the two numbers printed beside it whether or not the
 * endpoint sends a basis of its own.
 *
 * @param {Object | null} block
 * @return {{ pnlUsd: number | null, valueUsd: number | null, pct: number | null } | null}
 */
const readPnlBlock = (block) => {
  if (!block || typeof block !== "object") return null;

  const pnlUsd = firstNumber(block.pnlUsd, block.totalPnlUsd, block.pnl, block.unrealizedPnlUsd);
  const valueUsd = firstNumber(
    block.valueUsd,
    block.totalValueUsd,
    block.assetsUsd,
    block.totalAssetsUsd,
    block.tvlUsd
  );

  if (pnlUsd === null && valueUsd === null) return null;

  const costBasis = valueUsd !== null && pnlUsd !== null ? valueUsd - pnlUsd : null;

  return {
    pnlUsd,
    valueUsd,
    pct: costBasis && costBasis !== 0 ? (pnlUsd / costBasis) * 100 : null,
  };
};

/**
 * `/users/{privyId}/pnl` — what the user has made, EVM and Solana apart.
 *
 * Undocumented shape, so the halves are looked for under several plausible names
 * and any that doesn't turn up is simply absent from the render. Returns null when
 * the response yields nothing at all, which the panel reports as an unread shape
 * rather than as a flat performance.
 *
 * The vaults figure is deliberately *inside* `evm` and never added to it — a vault
 * deposit is one of the EVM positions, so summing the two would double-count it.
 * The panel says so in its footnote for the same reason.
 *
 * @param {Object | null} data
 * @return {{ totalPnlUsd: number | null, totalValueUsd: number | null, evm: Object | null,
 * solana: Object | null, vaults: Object | null } | null}
 */
export const readPnl = (data) => {
  const source = data?.data && typeof data.data === "object" ? data.data : data;
  if (!source || typeof source !== "object") return null;

  const evm = readPnlBlock(source.evm ?? source.evmPnl);
  const solana = readPnlBlock(source.solana ?? source.solanaPnl ?? source.xstocks);
  const vaults = readPnlBlock(source.vaults ?? source.vaultPnl);

  // `sumDefined` and not `a + b`: two halves that each reported a *value* and no
  // PnL would add up to a confident +$0.00, which is the one thing this endpoint
  // must never invent — on a PnL, zero means "broke exactly even", not "unknown".
  // It returns null when neither half carried the figure, which is the honest answer.
  const sumHalves = (key) => sumDefined(evm?.[key], solana?.[key]);

  const totalPnlUsd = firstNumber(source.totalPnlUsd, source.pnlUsd) ?? sumHalves("pnlUsd");
  const totalValueUsd = firstNumber(source.totalValueUsd, source.valueUsd) ?? sumHalves("valueUsd");

  if (totalPnlUsd === null && !evm && !solana) return null;

  return { totalPnlUsd, totalValueUsd, evm, solana, vaults };
};
