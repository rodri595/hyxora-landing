"use client";

import CopyButton from "@/components/CopyButton";
import { useCerebroAccess } from "@/hooks/cerebro/useCerebroAccess";
import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { cn } from "@/utils";
import { cerebroBaseUrl } from "@/utils/cerebroAxios";
import { useCallback, useState } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";

const Row = ({ label, children }) => (
  <div className="flex items-start gap-3 py-1.5 border-b-[0.7px] border-[rgba(25,54,63,0.05)] last:border-b-0">
    <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)] w-[120px] shrink-0 pt-px">
      {label}
    </span>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

/**
 * Connection diagnostic for the Cerebro API — kept separate from the real panels
 * because it answers "is this reaching the backend at all", not "how is the
 * system doing".
 *
 * Distinguishes the three failures that look identical in the UI otherwise:
 * not logged in, logged in but not allowlisted (401), and blocked before the
 * response (CORS / network — an axios error with no `response`).
 */
const ConnectionPanel = () => {
  const { enabled, privyId } = useCerebroAccess();
  const { data, error, isFetching, refetch, dataUpdatedAt } = useGetSystemHealth();
  const [latencyMs, setLatencyMs] = useState(null);

  const runTest = useCallback(async () => {
    const startedAt = performance.now();
    await refetch();
    setLatencyMs(Math.round(performance.now() - startedAt));
  }, [refetch]);

  const httpStatus = error?.response?.status ?? null;
  const state = isFetching ? "loading" : error ? "error" : data ? "ok" : "idle";

  const statusPill = {
    idle: { label: "Sin probar", className: "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)]" },
    loading: {
      label: "Probando…",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    ok: {
      label: "Conectado",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    error: {
      label: httpStatus ? `Error ${httpStatus}` : "Sin respuesta",
      className: "bg-red-50 text-red-700 border border-red-200",
    },
  }[state];

  return (
    <Panel
      title="Diagnóstico de conexión"
      description="Comprueba que el servicio /admin del gateway responde y que tu Privy ID está en el allowlist del backend."
      action={<RefreshButton onClick={runTest} isLoading={isFetching} label="Probar conexión" />}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px]",
            statusPill.className
          )}
        >
          {statusPill.label}
        </span>
        {latencyMs !== null && state === "ok" && (
          <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.4)]">
            {latencyMs} ms
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <Row label="Endpoint">
          <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.65)] break-all">
            GET {cerebroBaseUrl}/system/health
          </span>
        </Row>

        <Row label="Sesión Hyxora">
          <span
            className={cn(
              "font-inter text-[10px] tracking-[-0.4px]",
              enabled ? "text-emerald-700" : "text-red-700"
            )}
          >
            {enabled ? "Sesión activa" : "Sin sesión — inicia sesión primero"}
          </span>
        </Row>

        <Row label="Tu Privy ID">
          {privyId ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.65)] truncate">
                {privyId}
              </span>
              <CopyButton text={privyId} />
            </div>
          ) : (
            <span className="font-inter text-[10px] text-[rgba(25,54,63,0.35)]">—</span>
          )}
        </Row>

        {dataUpdatedAt > 0 && (
          <Row label="Última lectura">
            <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.55)]">
              {new Date(dataUpdatedAt).toLocaleString()}
            </span>
          </Row>
        )}
      </div>

      {error && (
        <div className="mt-2.5 flex flex-col gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-2">
          <span className="font-inter text-[10px] font-medium text-red-700 tracking-[-0.4px]">
            {error.message}
          </span>
          {(httpStatus === 401 || httpStatus === 403) && (
            <span className="font-inter text-[10px] leading-[1.5] text-red-600/80 tracking-[-0.4px]">
              La sesión llegó al gateway pero no autoriza este servicio: o el JWT ya no vale (vuelve
              a iniciar sesión) o tu ID no está en ADMIN_ALLOWLIST_PRIVY_IDS. Copia el Privy ID de
              arriba y pásaselo al equipo de backend.
            </span>
          )}
          {!httpStatus && (
            <span className="font-inter text-[10px] leading-[1.5] text-red-600/80 tracking-[-0.4px]">
              No llegó ninguna respuesta HTTP. Es CORS o red: el navegador bloqueó la petición antes
              de leerla. El backend tiene que permitir este origen en Access-Control-Allow-Origin
              (con Authorization en Access-Control-Allow-Headers).
            </span>
          )}
        </div>
      )}

      {data && (
        <details className="mt-2.5">
          <summary className="cursor-pointer font-inter text-[10px] font-medium text-[rgba(25,54,63,0.5)] hover:text-[#19363F] tracking-[-0.4px] transition-colors list-none">
            Ver JSON completo
          </summary>
          <pre
            data-lenis-prevent
            className="mt-2 max-h-[320px] overflow-auto overscroll-contain rounded-lg bg-[rgba(25,54,63,0.03)] border-[0.7px] border-[rgba(25,54,63,0.08)] p-2.5 font-mono text-[10px] leading-[1.5] text-[rgba(25,54,63,0.7)]"
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </Panel>
  );
};

export default ConnectionPanel;
