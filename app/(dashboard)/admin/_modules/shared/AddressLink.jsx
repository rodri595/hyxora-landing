"use client";

import { cerebroAddressUrl } from "@/constants/cerebro";
import { cn } from "@/utils";
import { shortenHash } from "@/utils/format";

const ExternalIcon = () => (
  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6 3h7v7M13 3 4 12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Truncated wallet address, linked to its explorer.
 *
 * The sibling of `TxLink`, for the panels that show a wallet rather than a
 * transaction — the Solana fee-payer, the two treasuries. Unlinkable addresses
 * render as plain text rather than as a link that goes nowhere.
 *
 * @param {Object} props
 * @param {string | null | undefined} props.address
 * @param {number | string} [props.chainId] Optional; see `cerebroAddressUrl`.
 * @param {number} [props.lead]
 * @param {number} [props.tail]
 * @param {string} [props.className]
 */
const AddressLink = ({ address, chainId, lead = 6, tail = 4, className }) => {
  const url = cerebroAddressUrl(address, chainId);
  const label = shortenHash(address, { lead, tail });

  if (!url) {
    return (
      <span className={cn("font-mono text-[10px] text-[rgba(25,54,63,0.5)]", className)}>
        {label}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={address}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] text-[rgba(25,54,63,0.55)] hover:text-[#19363F] transition-colors",
        className
      )}
    >
      {label}
      <ExternalIcon />
    </a>
  );
};

export default AddressLink;
