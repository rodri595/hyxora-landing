import { cerebroChainLabel } from "@/constants/cerebro";

/**
 * Turning the holdings index into holder rows.
 *
 * The index is one entry per user with their whole position list; this collapses
 * it the way the old dashboard's SQL did — filter to the asset, group by user,
 * sum `value_usd`.
 */

/**
 * Holders of one exact token, as the Top tokens table identifies it: a row there
 * is a (symbol, chain) pair, because SOL on Base and SOL on Solana are different
 * positions and Cerebro reports them apart.
 *
 * A user can still hold the same token across several Safes, so their positions
 * are summed rather than listed — one row per user, as in the old dashboard.
 *
 * Chain is compared on the rendered label rather than the raw field, so a token
 * row carrying `chain: "base"` still matches a position carrying `chainId: 8453`.
 *
 * @param {Object[]} holders `data.holders` from the index.
 * @param {{ symbol: string, chain?: string, chainId?: number | string }} token
 * @return {Object[]} Holder rows, largest position first.
 */
export const holdersOfToken = (holders, token) => {
  if (!Array.isArray(holders) || !token?.symbol) return [];

  const symbol = token.symbol.toLowerCase();
  const chain = cerebroChainLabel(token);

  return holders
    .map((holder) => {
      const matched = holder.positions.filter(
        (position) =>
          position.symbol.toLowerCase() === symbol && cerebroChainLabel(position) === chain
      );
      if (matched.length === 0) return null;

      return {
        privyId: holder.privyId,
        email: holder.email,
        username: holder.username,
        plan: holder.plan,
        refreshedAt: holder.refreshedAt,
        valueUsd: matched.reduce((sum, position) => sum + position.valueUsd, 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.valueUsd - a.valueUsd);
};

/**
 * Label for a holder: email, else @username, else the tail of the Privy DID.
 *
 * @param {Object} holder
 * @return {string}
 */
export const holderLabel = (holder) => {
  if (holder.email) return holder.email;
  if (holder.username) return `@${holder.username}`;
  const did = holder.privyId ?? "";
  return did.length > 16 ? `…${did.slice(-12)}` : did || "—";
};
