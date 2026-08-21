"use client";

import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";

/**
 * `system.tvlErrors` is documented in admin.md only as an empty array, so its row
 * shape is unknown. Rather than guess at field names, known keys are rendered
 * when present and the raw entry is dumped otherwise — that way a non-empty
 * response is visible immediately instead of silently rendering blank cells.
 */
const ErrorRow = ({ entry }) => {
  if (entry && typeof entry === "object") {
    const symbol = entry.symbol ?? entry.tokenSymbol ?? entry.vaultName;
    const detail = entry.reason ?? entry.error ?? entry.message;

    if (symbol || detail) {
      return (
        <div className="flex items-start justify-between gap-3 py-2 border-b-[0.7px] border-[rgba(25,54,63,0.05)] last:border-b-0">
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
            {symbol ?? "—"}
          </span>
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.55)] text-right">
            {detail ?? "—"}
          </span>
        </div>
      );
    }
  }

  return (
    <pre className="font-mono text-[10px] leading-[1.5] text-[rgba(25,54,63,0.6)] py-1.5 whitespace-pre-wrap break-all">
      {JSON.stringify(entry)}
    </pre>
  );
};

const UnpricedPositionsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const tvlErrors = Array.isArray(data?.system?.tvlErrors) ? data.system.tvlErrors : [];
  const hasErrors = tvlErrors.length > 0;

  return (
    <Panel
      title="Posiciones sin precio"
      description="Posiciones que el proveedor muestra pero no pudo valorar en el último refresco. Aportan $0 al TVL, así que el saldo de cualquier usuario afectado queda subestimado — normalmente por una fuente de precios de vault/token caída."
      tone={hasErrors ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {hasErrors ? (
          <div className="flex flex-col">
            <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600 mb-1.5">
              {tvlErrors.length} posición(es) sin valorar.
            </p>
            {tvlErrors.map((entry, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: entries have no documented id
              <ErrorRow key={index} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-emerald-700">
            Todas las posiciones valoradas correctamente.
          </p>
        )}

        <div className="mt-3">
          <PendingEndpoint
            needs="Esto se apoya en `system.tvlErrors` de /system/health, que admin.md documenta solo como array vacío — no sabemos qué campos trae cada entrada. Si el dashboard original muestra token, cadena y usuarios afectados, hace falta confirmar la forma o exponerlo aparte."
            fields={["GET /system/unpriced-positions", "docs: forma de system.tvlErrors[]"]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default UnpricedPositionsPanel;
