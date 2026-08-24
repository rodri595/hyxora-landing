import { requireAdmin } from "@/utils/server/requireAdmin";

/**
 * Solana fee-payer balance — the wallet that pays SOL gas for xStock trades.
 *
 * When it runs dry, xStock trading stops. The panel flags "top up" below
 * `SOLANA_FUNDING_MIN_SOL`. Priced through DefiLlama's free coins endpoint
 * (no key); if pricing fails the SOL figure is still returned, since the
 * balance is the number that actually matters.
 */

const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_PRICE_URL = "https://coins.llama.fi/prices/current/coingecko:solana";

/** @return {Promise<number | null>} SOL price in USD, or null if unavailable. */
const fetchSolPrice = async () => {
  try {
    const response = await fetch(SOL_PRICE_URL, {
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = await response.json();
    const price = body?.coins?.["coingecko:solana"]?.price;
    return typeof price === "number" ? price : null;
  } catch {
    return null;
  }
};

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const rpcUrl = process.env.SOLANA_RPC_URL;
  const feePayer = process.env.SOLANA_FEE_PAYER;

  if (!rpcUrl || !feePayer) {
    return Response.json(
      { error: "SOLANA_RPC_URL o SOLANA_FEE_PAYER no están configurados." },
      { status: 500 }
    );
  }

  let lamports;
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [feePayer],
      }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });

    const body = await response.json();
    if (body?.error) {
      return Response.json({ error: `RPC de Solana: ${body.error.message}` }, { status: 502 });
    }
    lamports = body?.result?.value;
  } catch {
    return Response.json({ error: "No se pudo consultar el RPC de Solana." }, { status: 502 });
  }

  if (typeof lamports !== "number") {
    return Response.json(
      { error: "El RPC de Solana devolvió un saldo inválido." },
      { status: 502 }
    );
  }

  const sol = lamports / LAMPORTS_PER_SOL;
  const minSol = Number(process.env.SOLANA_FUNDING_MIN_SOL ?? "0.1");
  const priceUsd = await fetchSolPrice();

  return Response.json({
    address: feePayer,
    sol,
    minSol,
    // How many times over the minimum — the useful read when deciding to top up.
    ratio: minSol > 0 ? sol / minSol : null,
    low: sol < minSol,
    priceUsd,
    valueUsd: priceUsd === null ? null : sol * priceUsd,
    checkedAt: new Date().toISOString(),
  });
}
