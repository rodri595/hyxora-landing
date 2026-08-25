import { cerebroChainLabel } from "@/constants/cerebro";

/**
 * Reading `/holdings/holders` against a row of the tables above.
 *
 * The endpoint matches on symbol or vault name and nothing else, so it answers
 * "who holds USDC" — while a row up there is a (symbol, chain) pair, because SOL on
 * Base and SOL on Solana are different positions and `/holdings` reports them apart.
 * These two helpers bridge that gap and, more importantly, keep it visible: a
 * holder's `valueUsd` is their exposure to the *symbol* across every chain in
 * `chains`, and pretending otherwise would quietly overstate the row.
 */

/**
 * Holders of a row, narrowed to the chain that row is about.
 *
 * A holder is kept when `chains` says they hold the symbol on this row's chain.
 * Comparison is on rendered labels, so a table row carrying `chain: "base"` matches
 * a holder carrying "Base" — the same reason `cerebroChainLabel` exists.
 *
 * A holder whose `chains` is empty or unreadable is kept rather than dropped: the
 * search already matched them on the asset, and silently hiding a real holder is
 * worse than showing one whose network we could not confirm.
 *
 * @param {Object[]} holders `data.holders` from `/holdings/holders`.
 * @param {{ chain?: string, chainName?: string, chainId?: number | string }} row
 * @return {Object[]} Holder rows, largest position first.
 */
export const holdersOnChain = (holders, row) => {
  if (!Array.isArray(holders)) return [];

  const chain = cerebroChainLabel(row);

  return holders
    .filter((holder) => {
      const chains = Array.isArray(holder?.chains) ? holder.chains : [];
      if (chains.length === 0 || chain === "—") return true;
      return chains.some((name) => cerebroChainLabel({ chain: name, chainName: name }) === chain);
    })
    .map((holder) => ({
      ...holder,
      // How many networks the figure spans, so the value column can say when it is
      // wider than the row it was opened from.
      chainCount: Array.isArray(holder?.chains) ? holder.chains.length : 0,
      chainsLabel: Array.isArray(holder?.chains) ? holder.chains.join(", ") : "",
    }))
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
};

/**
 * Label for a holder: email, else the Twitter handle, else the tail of the Privy DID.
 *
 * @param {Object} holder
 * @return {string}
 */
export const holderLabel = (holder) => {
  if (holder?.email) return holder.email;

  const handle = holder?.twitterUsername ?? holder?.username;
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;

  const did = holder?.privyId ?? "";
  return did.length > 16 ? `…${did.slice(-12)}` : did || "—";
};
