import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Fee tokens sitting in the treasuries that should be swapped to USDC.
 *
 * Fees arrive in whatever token the user transacted in. Anything non-stable is
 * price risk we're holding involuntarily, so the panel lists what has accrued
 * past `LIQUIDATION_ALERT_USD` in either treasury.
 *
 * Read through Zerion, which authenticates with HTTP Basic — the API key as the
 * username, empty password. Fail-soft per wallet: one failing address returns
 * its own error row rather than 500-ing the panel.
 */

const ZERION_BASE = "https://api.zerion.io/v1";

/**
 * Stablecoins and native gas tokens, excluded from the swap list. Stables are
 * already the target; gas tokens are operational float that pays for sponsored
 * transactions, not fee income to liquidate. Lowercased symbols.
 */
const STABLE_OR_GAS = new Set([
  "usdc",
  "usdt",
  "usdc.e",
  "usdbc",
  "dai",
  "eurc",
  "usds",
  "usde",
  "sol",
  "wsol",
  "eth",
  "weth",
  "bnb",
  "wbnb",
  "pol",
  "matic",
  "hype",
  "whype",
]);

/**
 * @param {string} address
 * @param {string} authHeader
 * @return {Promise<Array>} Raw Zerion position records.
 */
const fetchPositions = async (address, authHeader) => {
  // Trailing slash matters — Zerion 301s without it and drops the auth header.
  const url = `${ZERION_BASE}/wallets/${address}/positions/?currency=usd&filter%5Btrash%5D=only_non_trash&sort=value`;

  const response = await fetch(url, {
    headers: { Authorization: authHeader, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Zerion respondió ${response.status}`);

  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
};

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const apiKey = process.env.ZERION_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ZERION_API_KEY no está configurada." }, { status: 500 });
  }

  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
  const threshold = Number(process.env.LIQUIDATION_ALERT_USD ?? "1");

  // Solana may hold fees across several wallets. `SOLANA_TREASURY_ADDRESSES`
  // (comma-separated) wins when set; the singular var is the fallback, and a
  // wallet listed in both is only scanned once so it can't double-count.
  const solanaAddresses = [
    ...(process.env.SOLANA_TREASURY_ADDRESSES ?? process.env.SOLANA_TREASURY_ADDRESS ?? "")
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean)
      .reduce((unique, address) => unique.add(address), new Set()),
  ];

  const targets = [
    ...solanaAddresses.map((address, index) => ({
      label: solanaAddresses.length > 1 ? `Tesorería Solana ${index + 1}` : "Tesorería Solana",
      address,
    })),
    { label: "Tesorería EVM", address: process.env.TREASURY_ADDRESS },
  ].filter((target) => Boolean(target.address));

  const wallets = await Promise.all(
    targets.map(async ({ label, address }) => {
      try {
        const positions = await fetchPositions(address, authHeader);

        const items = positions
          .map((position) => {
            const info = position?.attributes?.fungible_info ?? {};
            return {
              symbol: info.symbol ?? "?",
              name: info.name ?? null,
              chain: position?.relationships?.chain?.data?.id ?? null,
              amount: position?.attributes?.quantity?.float ?? null,
              valueUsd: position?.attributes?.value ?? 0,
            };
          })
          .filter(
            (item) =>
              typeof item.valueUsd === "number" &&
              item.valueUsd >= threshold &&
              !STABLE_OR_GAS.has(item.symbol.toLowerCase())
          )
          .sort((a, b) => b.valueUsd - a.valueUsd);

        return {
          label,
          address,
          items,
          totalUsd: items.reduce((sum, item) => sum + item.valueUsd, 0),
          error: null,
        };
      } catch (error) {
        return {
          label,
          address,
          items: [],
          totalUsd: 0,
          error: error?.message ?? "Error consultando Zerion",
        };
      }
    })
  );

  return Response.json({
    wallets,
    threshold,
    totalUsd: wallets.reduce((sum, wallet) => sum + wallet.totalUsd, 0),
    actionable: wallets.some((wallet) => wallet.items.length > 0),
    checkedAt: new Date().toISOString(),
  });
}
