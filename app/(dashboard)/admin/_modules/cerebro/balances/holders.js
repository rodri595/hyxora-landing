import { cerebroChainLabel } from "@/constants/cerebro";

/**
 * Reading `/holdings/holders` against the Top tokens table.
 *
 * The endpoint matches on symbol or position name and nothing else, so it answers
 * "who holds USDC" — while a row up there is a (symbol, chain) pair, because SOL on
 * Base and SOL on Solana are different positions and `/holdings` reports them apart.
 * These two helpers bridge that gap and, more importantly, keep it visible: a
 * holder's `valueUsd` is their exposure to the *symbol* across every chain in
 * `chains`, and pretending otherwise would quietly overstate the row.
 */

/**
 * Comparison key for a chain, whichever vocabulary it arrives in.
 *
 * `holders[].chains` is `array_agg(distinct p.chain)` over the same column
 * `/holdings` reads for `chain`, so it carries Zerion slugs — "base",
 * "binance-smart-chain" — and *not* the labels admin.md's example shows. Resolving
 * both sides through `cerebroChainLabel` and then dropping case and punctuation
 * makes "binance-smart-chain" and "BNB Chain" land on the same key, so the match
 * holds whichever of the two the API turns out to send.
 *
 * @param {{ chain?: string, chainName?: string, chainId?: number | string }} row
 * @return {string} "" when the chain is unknown.
 */
const chainKey = (row) =>
  cerebroChainLabel(row)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Holders of a row, narrowed to the chain that row is about.
 *
 * A holder is kept when `chains` says they hold the symbol on this row's chain.
 * Comparison is on the resolved label, so a table row carrying `chain: "base"`
 * matches a holder carrying "base" or "Base" — the same reason `cerebroChainLabel`
 * exists. Comparing the raw strings is what left every expanded row empty.
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

  const chain = chainKey(row);

  return holders
    .filter((holder) => {
      const chains = Array.isArray(holder?.chains) ? holder.chains : [];
      if (chains.length === 0 || chain === "") return true;
      return chains.some((name) => chainKey({ chain: name }) === chain);
    })
    .map((holder) => {
      const chains = Array.isArray(holder?.chains) ? holder.chains : [];

      return {
        ...holder,
        // How many networks the figure spans, so the value column can say when it is
        // wider than the row it was opened from.
        chainCount: chains.length,
        // Labelled, not raw: the slugs would read "base, polygon" under a table
        // whose own «Redes» column says "Base".
        chainsLabel: chains.map((name) => cerebroChainLabel({ chain: name })).join(", "),
      };
    })
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
