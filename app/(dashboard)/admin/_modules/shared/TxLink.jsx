"use client";

import { cerebroTxUrl } from "@/constants/cerebro";
import { shortenHash } from "@/utils/format";

const ExternalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6 3h7v7M13 3 4 12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Truncated transaction hash, linked to the chain's explorer when we know one.
 *
 * HyperEVM has no confirmed explorer, so its hashes render as plain text rather
 * than as a link that goes nowhere.
 *
 * @param {Object} props
 * @param {number | string} props.chainId
 * @param {string} props.txHash
 * @param {number} [props.lead]
 * @param {number} [props.tail]
 */
const TxLink = ({ chainId, txHash, lead = 8, tail = 4 }) => {
  const url = cerebroTxUrl(chainId, txHash);
  const label = shortenHash(txHash, { lead, tail });

  if (!url) {
    return <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]">{label}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-[10px] text-[rgba(25,54,63,0.6)] hover:text-[#19363F] transition-colors"
    >
      {label}
      <ExternalIcon />
    </a>
  );
};

export default TxLink;
