"use client";

import { cerebroChainLabel } from "@/constants/cerebro";
import { useGetUnpricedPositions } from "@/hooks/cerebro/useGetUnpricedPositions";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
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
 * One row of `symbols`.
 *
 * The API splits the stored `"SYMBOL@chain"` string for us and sends `chain` as a
 * Zerion slug, the same spelling `/holdings` uses — so it resolves through
 * `cerebroChainLabel`, never by matching the raw text. `chain` is documented as
 * nullable, and a symbol that still carries an "@" is the case where the split had
 * nothing to split on upstream: parse it here rather than show "wstETH@base" as if
 * that were the token.
 *
 * @param {{ symbol?: string, chain?: string | null, users?: number }} entry
 * @param {number} index
 */
const toRow = (entry, index) => {
  const raw = typeof entry?.symbol === "string" ? entry.symbol.trim() : "";
  const [symbol, embedded] = raw.split("@");
  const chain = entry?.chain ?? embedded ?? null;

  return {
    key: `${raw || "sin-simbolo"}-${index}`,
    symbol: symbol || raw || "—",
    chainLabel: chain ? cerebroChainLabel({ chain }) : null,
    users: typeof entry?.users === "number" ? entry.users : null,
  };
};

/**
 * Assets Zerion returns but cannot price.
 *
 * Nothing else in the dashboard surfaces these: the position is dropped from the
 * TVL sum without a trace, so an affected user's balance is simply too low and
 * looks perfectly ordinary. Almost always a vault or token price feed that went
 * away, which means the fix is upstream and the chip disappears on its own once
 * the feed returns.
 */
const UnpricedPositionsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetUnpricedPositions();

  const rows = useMemo(() => (Array.isArray(data?.symbols) ? data.symbols.map(toRow) : []), [data]);

  const totalUsers = typeof data?.totalUsers === "number" ? data.totalUsers : null;
  const hasIssue = rows.length > 0 || (totalUsers ?? 0) > 0;

  return (
    <Panel
      title="Posiciones sin precio"
      description="Posiciones que Zerion muestra pero no pudo valorar en el último refresco. Aportan $0 al TVL, así que el saldo de cualquier usuario afectado queda subestimado — normalmente por una fuente de precios de vault o token caída."
      tone={hasIssue ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {hasIssue ? (
          <>
            <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600">
              {totalUsers === null
                ? `${formatNumber(rows.length)} ${rows.length === 1 ? "activo" : "activos"} sin valorar`
                : `${formatNumber(totalUsers)} ${totalUsers === 1 ? "usuario afectado" : "usuarios afectados"} · ${formatNumber(rows.length)} ${rows.length === 1 ? "activo" : "activos"} sin valorar`}
              .
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {rows.map((row) => (
                <span
                  key={row.key}
                  className="inline-flex items-baseline gap-1.5 rounded-md border-[0.7px] border-red-200 bg-red-50/70 px-2 py-1"
                >
                  <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-800">
                    {row.symbol}
                  </span>
                  {row.chainLabel && (
                    <span className="font-inter text-[10px] tracking-[-0.4px] text-red-500">
                      {row.chainLabel}
                    </span>
                  )}
                  {row.users !== null && (
                    <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-red-500">
                      · {formatNumber(row.users)} {row.users === 1 ? "usuario" : "usuarios"}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <p className="mt-2.5 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              Las fichas van ordenadas por usuarios afectados. Un mismo usuario puede tener varias
              posiciones sin precio, así que sumarlas da más que los usuarios afectados. Se
              recalcula en cada refresco de Zerion: si la fuente de precios vuelve, la ficha
              desaparece sola.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border-[0.7px] border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-emerald-700">
            <CheckIcon />
            <span className="font-inter text-[11px] font-medium tracking-[-0.44px]">
              Todas las posiciones valoradas correctamente.
            </span>
          </div>
        )}
      </QueryState>
    </Panel>
  );
};

export default UnpricedPositionsPanel;
