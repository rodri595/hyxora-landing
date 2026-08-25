import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Current gas price per chain, via `eth_gasPrice` on each configured RPC.
 *
 * This is the *live* half of the Costos «Límites de gas» table. The other half
 * — the configured ceiling — comes from app-api's `/admin/gas-limits`, which
 * needs the bot token. The two are deliberately separate requests so the live
 * prices still render when the ceilings are unavailable.
 *
 * `chain` matches app-api's own chain vocabulary so the panel can join the two
 * responses without a translation table.
 */

const CHAINS = [
  { chain: "base", label: "Base", chainId: 8453, envVar: "BASE_RPC_URL" },
  { chain: "polygon", label: "Polygon", chainId: 137, envVar: "POLYGON_RPC_URL" },
  { chain: "bsc", label: "BSC", chainId: 56, envVar: "BSC_RPC_URL" },
  { chain: "hyperevm", label: "HyperEVM", chainId: 999, envVar: "HYPEREVM_RPC_URL" },
];

const WEI_PER_GWEI = 1e9;

/**
 * @param {{ chain: string, label: string, chainId: number, envVar: string }} entry
 * @return {Promise<Object>} One row with `currentGwei`, or `error` on failure.
 */
const fetchGasPrice = async (entry) => {
  const rpcUrl = process.env[entry.envVar];
  const base = { chain: entry.chain, label: entry.label, chainId: entry.chainId };

  if (!rpcUrl) return { ...base, currentGwei: null, error: `${entry.envVar} no configurado` };

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    const body = await response.json();
    if (body?.error) return { ...base, currentGwei: null, error: body.error.message };

    const wei = Number.parseInt(body?.result, 16);
    if (!Number.isFinite(wei)) {
      return { ...base, currentGwei: null, error: "Respuesta RPC inválida" };
    }

    return { ...base, currentGwei: wei / WEI_PER_GWEI, error: null };
  } catch (error) {
    return {
      ...base,
      currentGwei: null,
      error: error?.name === "TimeoutError" ? "Timeout" : (error?.message ?? "Error de red"),
    };
  }
};

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const rows = await Promise.all(CHAINS.map(fetchGasPrice));

  return Response.json({ rows, checkedAt: new Date().toISOString() });
}
