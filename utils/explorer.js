import { base, baseSepolia, sepolia } from 'viem/chains';

export const getExplorerUrl = (chainId) => {
  switch (chainId) {
    case base.id:
      return 'https://basescan.org';
    case baseSepolia.id:
      return 'https://sepolia.basescan.org';
    case sepolia.id:
      return 'https://sepolia.etherscan.io';
    default:
      return 'https://sepolia.etherscan.io';
  }
};

export const getTransactionUrl = (chainId, txHash) => {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
};

export const getAddressUrl = (chainId, address) => {
  return `${getExplorerUrl(chainId)}/address/${address}`;
};

export const getTokenUrl = (chainId, tokenAddress, tokenId) => {
  const baseUrl = `${getExplorerUrl(chainId)}/token/${tokenAddress}`;
  return tokenId ? `${baseUrl}?a=${tokenId}` : baseUrl;
};

