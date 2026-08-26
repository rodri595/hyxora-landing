"use client";

import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M3 8.5 6.5 12 13 4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * `system.tvlErrors` is documented in admin.md only as an empty array, so its row
 * shape is unknown and this has to read defensively.
 *
 * The one shape we can predict is the underlying column: `users.tvl_unpriced_held`
 * is a jsonb array of `"SYMBOL@chain"` strings, so a plain string entry is parsed
 * on the `@` and the chain half resolved through `cerebroChainLabel` — the same
 * Zerion slugs `/holdings` sends. Object entries are probed for the obvious keys.
 * Anything else is dumped raw rather than rendered as blank cells: a non-empty
 * response has to be visible immediately, even if we can't name its fields yet.
 *
 * @param {unknown} entry
 * @return {{ symbol: string | null, chainLabel: string | null, users: number | null, raw: unknown }}
 */
const toChip = (entry) => {
  if (typeof entry === "string") {
    const [symbol, chain] = entry.split("@");
    return {
      symbol: symbol || null,
      chainLabel: chain ? cerebroChainLabel({ chain }) : null,
      users: null,
      raw: entry,
    };
  }

  if (entry && typeof entry === "object") {
    const symbol = entry.symbol ?? entry.tokenSymbol ?? entry.vaultName ?? null;
    const hasChain = entry.chain != null || entry.chainId != null || entry.chainName != null;
    const users = typeof entry.users === "number" ? entry.users : null;

    if (symbol) {
      return {
        symbol,
        chainLabel: hasChain ? cerebroChainLabel(entry) : null,
        users,
        raw: entry,
      };
    }
  }

  return { symbol: null, chainLabel: null, users: null, raw: entry };
};

const UnpricedPositionsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const chips = useMemo(
    () => (Array.isArray(data?.system?.tvlErrors) ? data.system.tvlErrors.map(toChip) : []),
    [data]
  );
  const hasErrors = chips.length > 0;

  return (
    <Panel
      title="Posiciones sin precio"
      description="Posiciones que Zerion muestra pero no pudo valorar en el último refresco. Aportan $0 al TVL, así que el saldo de cualquier usuario afectado queda subestimado — normalmente por una fuente de precios de vault o token caída."
      tone={hasErrors ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {hasErrors ? (
          <>
            <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600">
              {formatNumber(chips.length)}{" "}
              {chips.length === 1 ? "posición sin valorar" : "posiciones sin valorar"}.
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((chip, index) =>
                chip.symbol ? (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: entries carry no documented id
                    key={index}
                    className="inline-flex items-baseline gap-1.5 rounded-md border-[0.7px] border-red-200 bg-red-50/70 px-2 py-1"
                  >
                    <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-800">
                      {chip.symbol}
                    </span>
                    {chip.chainLabel && (
                      <span className="font-inter text-[10px] tracking-[-0.4px] text-red-500">
                        {chip.chainLabel}
                      </span>
                    )}
                    {chip.users !== null && (
                      <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-red-500">
                        · {formatNumber(chip.users)} {chip.users === 1 ? "usuario" : "usuarios"}
                      </span>
                    )}
                  </span>
                ) : (
                  <pre
                    // biome-ignore lint/suspicious/noArrayIndexKey: entries carry no documented id
                    key={index}
                    className="w-full whitespace-pre-wrap break-all rounded-md border-[0.7px] border-[rgba(25,54,63,0.1)] bg-[rgba(25,54,63,0.02)] px-2 py-1.5 font-mono text-[10px] leading-[1.5] text-[rgba(25,54,63,0.6)]"
                  >
                    {JSON.stringify(chip.raw)}
                  </pre>
                )
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border-[0.7px] border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-emerald-700">
            <CheckIcon />
            <span className="font-inter text-[11px] font-medium tracking-[-0.44px]">
              Todas las posiciones valoradas correctamente.
            </span>
          </div>
        )}

        <div className="mt-3">
          <PendingEndpoint
            needs="Esto se apoya en `system.tvlErrors` de /system/health, que admin.md documenta solo como array vacío — no sabemos qué campos trae cada entrada, así que un fallo real podría llegar y renderizarse como JSON crudo. El dashboard antiguo agrupa la columna users.tvl_unpriced_held por símbolo y cuenta usuarios afectados (getUnpricedHoldings); basta con eso, o con documentar la forma de tvlErrors[]. Spec en docs/cerebro-sistema-endpoints.md."
            fields={["GET /system/unpriced-positions", "o docs: forma de system.tvlErrors[]"]}
            shape={{
              totalUsers: 3,
              symbols: [
                { symbol: "wstETH", chain: "base", users: 2 },
                { symbol: "sDAI", chain: "polygon", users: 1 },
              ],
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default UnpricedPositionsPanel;
