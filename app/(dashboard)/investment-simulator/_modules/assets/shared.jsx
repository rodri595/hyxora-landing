"use client";

import { cn } from "@/utils";

/**
 * Pieces the assets grid, the token drawer and the header all need.
 *
 * They used to be exported from `AssetsModule` itself, which imported the drawer
 * that imported them back. Same helpers, no cycle.
 */

export const USD_FORMAT = { style: "currency", currency: "USD" };
export const UNITS_FORMAT = { maximumFractionDigits: 6 };

export const formatUSD = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

/**
 * A price, not a balance: two decimals hide everything about a token that trades
 * under a cent, so the decimals follow the magnitude.
 *
 * @param {number} value
 * @return {string}
 */
export const formatPrice = (value) => {
  const price = Number(value);
  if (!Number.isFinite(price)) return "—";
  const decimals = price >= 1 ? 2 : price >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
};

export const formatUSDCompact = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

export const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

// token.data es un JSON string con { description: { en, es } }.
export const parseTokenDescription = (raw) => {
  if (!raw) return "";
  try {
    const description = JSON.parse(raw)?.description;
    return description?.es || description?.en || "";
  } catch {
    return "";
  }
};

// El catálogo trae el slug de la cadena; aquí solo se le pone nombre propio.
const CHAIN_LABELS = {
  base: "Base",
  mainnet: "Ethereum",
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
  bsc: "BNB Chain",
  hyperevm: "HyperEVM",
  solana: "Solana",
};

export const chainLabel = (token) => {
  const slug = (token?.chainName || "").toLowerCase();
  return CHAIN_LABELS[slug] || token?.chainName || "";
};

const STABLE_SYMBOLS = new Set(["USDC", "USDT", "EURC", "USD", "EUR", "DAI"]);
const GOLD_SYMBOLS = new Set(["XAUT", "PAXG"]);

/**
 * Qué es cada token, para los filtros de la parrilla.
 *
 * Las acciones tokenizadas (xStocks) se acuñan en Solana con el sufijo «x» —
 * SPYx, GOOGLx, amznx — y es lo único que las separa de una cripto cualquiera:
 * ni el nombre ni el símbolo mostrado lo dicen. Por eso la regla mira las dos
 * cosas a la vez, y no solo la cadena: SOL vive en Base, no en Solana.
 *
 * @param {Object} token
 * @return {"stable" | "gold" | "stock" | "crypto"}
 */
export const tokenCategory = (token) => {
  const symbol = (token?.symbol || "").toUpperCase();
  const display = (token?.displaySymbol || "").toUpperCase();
  if (STABLE_SYMBOLS.has(symbol) || STABLE_SYMBOLS.has(display)) return "stable";
  if (GOLD_SYMBOLS.has(symbol) || GOLD_SYMBOLS.has(display)) return "gold";
  if (Number(token?.chainId) === 101 && symbol.endsWith("X")) return "stock";
  return "crypto";
};

export const CATEGORY_LABELS = {
  crypto: "Cripto",
  gold: "Oro",
  stock: "Acciones",
  stable: "Stablecoins",
};

export const TokenBadge = ({ token, size = 34, className }) =>
  token?.imageUrl ? (
    <img
      src={token.imageUrl}
      alt={token.displaySymbol}
      className={cn("rounded-full shrink-0 object-cover bg-[rgba(25,54,63,0.06)]", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shrink-0 font-inter font-bold text-white bg-[#19363F]",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {token?.displaySymbol?.slice(0, 1)}
    </div>
  );

export const ChangeChip = ({ change, className }) => {
  const value = Number(change) || 0;
  return (
    <span
      className={cn(
        "squircle rounded-[100px] px-2 py-0.5 font-inter text-[10px] font-medium tabular-nums tracking-[-0.4px]",
        value >= 0 ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]",
        className
      )}
    >
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

// Verde/rojo de las variaciones — la curva y el texto leen del mismo sitio.
export const TREND = {
  up: { stroke: "#15803D", fill: "#22C55E" },
  down: { stroke: "#DC2626", fill: "#EF4444" },
};

export const trendOf = (change) => (Number(change) >= 0 ? TREND.up : TREND.down);

// Mismo patrón que components/DevToolButton: se lee en el momento, sin
// suscripción — nada de lo que decide se re-renderiza a mitad de gesto.
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
