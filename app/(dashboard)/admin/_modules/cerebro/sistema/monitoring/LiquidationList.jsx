"use client";

import { cerebroChainLabel } from "@/constants/cerebro";
import { cn } from "@/utils";
import { formatUsd } from "@/utils/format";
import AddressLink from "../../../shared/AddressLink";

/**
 * Token amounts span six orders of magnitude here — 0.00031 cbBTC next to a
 * four-figure xStock position — so a fixed precision is always wrong for one of
 * them. Same ladder the old dashboard used.
 *
 * @param {number | null | undefined} value
 * @return {string}
 */
const tokenAmount = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) return "0";
  const digits = value >= 1000 ? 0 : value >= 1 ? 2 : 6;
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
};

/** One accrued position, chip-sized: what it is, how much, what it's worth. */
const TokenChip = ({ item }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border-[0.7px] border-amber-200 bg-amber-50 px-2 py-1 font-inter text-[10px] tracking-[-0.4px]">
    <span className="font-semibold text-amber-900">{item.symbol}</span>
    <span className="tabular-nums text-amber-700">{tokenAmount(item.amount)}</span>
    <span className="tabular-nums text-amber-600/70">
      · {formatUsd(item.valueUsd, { decimals: 2 })}
    </span>
    {item.chain && (
      <span className="text-amber-600/50">· {cerebroChainLabel({ chain: item.chain })}</span>
    )}
  </span>
);

/**
 * One treasury. It renders whether or not it holds anything: a wallet with
 * nothing to swap is a *result*, and flattening these into one table — which is
 * what this block replaced — dropped the clean wallets entirely, leaving no way
 * to tell «checked, empty» from «never checked».
 */
const WalletRow = ({ wallet }) => {
  const hasItems = wallet.items.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border-[0.7px] px-3 py-2.5",
        wallet.error
          ? "border-red-200 bg-red-50/70"
          : hasItems
            ? "border-amber-200 bg-amber-50/40"
            : "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.02)]"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-2 font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
          {wallet.label}
          <AddressLink address={wallet.address} />
        </span>

        {wallet.error ? (
          <span className="font-inter text-[10px] tracking-[-0.4px] text-red-600">
            {wallet.error}
          </span>
        ) : hasItems ? (
          <span className="font-inter text-[12px] font-semibold tabular-nums tracking-[-0.48px] text-amber-700">
            {formatUsd(wallet.totalUsd, { decimals: 2 })}
          </span>
        ) : (
          <span className="font-inter text-[10px] tracking-[-0.4px] text-emerald-700">
            nada que liquidar
          </span>
        )}
      </div>

      {hasItems && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {wallet.items.map((item) => (
            <TokenChip key={`${item.chain}-${item.symbol}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Fee tokens worth swapping to USDC.
 *
 * Fees arrive in whatever token the user transacted in, so the treasuries
 * accumulate price risk we never chose to take. Stablecoins are already the
 * target and native gas tokens are operational float, so both are excluded —
 * what's left is genuinely worth liquidating.
 *
 * @param {Object} props
 * @param {Array} props.wallets
 */
const LiquidationList = ({ wallets }) => (
  <div className="flex flex-col gap-2">
    {wallets.map((wallet) => (
      <WalletRow key={wallet.address} wallet={wallet} />
    ))}
  </div>
);

export default LiquidationList;
