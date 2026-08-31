"use client";

import { cn } from "@/utils";

/**
 * One control for the whole Ingresos tab, mirroring the `?raw=1` link the old
 * dashboard put in the Earnings header — the three endpoints that accept
 * `includeNonWhitelisted` (`/fees/treasury/by-chain`, `/fees/treasury/by-token`,
 * `/fees/recent`) are read side by side, and letting each panel filter differently
 * only invites comparing two numbers that were never counting the same rows.
 *
 * Off by default, like the API. «Solo lista blanca» keeps the tokens Hyxora
 * actually charges in; «Todas las entradas» drops that filter and brings in dust
 * and spam airdrops, whose USD value the indexer guessed. Useful for auditing what
 * reached the treasury, misleading as a revenue figure.
 *
 * The old dashboard also printed the whitelist size next to the link. Cerebro
 * exposes no whitelist endpoint, so that count is not available here.
 *
 * @param {Object} props
 * @param {boolean} props.value
 * @param {(next: boolean) => void} props.onChange
 */
const WhitelistToggle = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
      {value
        ? "Mostrando todas las entradas al tesoro, incluidos tokens fuera de la lista blanca: entra polvo y airdrops de spam cuyo valor en USD es una estimación."
        : "Mostrando solo entradas en tokens de la lista blanca de Hyxora, que es lo que cobramos de verdad."}
    </p>

    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cn(
        "shrink-0 rounded-lg border-[0.7px] px-2.5 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] transition-colors",
        value
          ? "border-[#19363F] bg-[#19363F] text-white"
          : "border-[rgba(25,54,63,0.12)] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)]"
      )}
    >
      {value ? "Ver solo lista blanca" : "Ver todas las entradas"}
    </button>
  </div>
);

export default WhitelistToggle;
