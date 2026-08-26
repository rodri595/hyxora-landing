"use client";

import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { cn } from "@/utils";
import { formatDateTime, formatNumber, hoursSince, timeAgo } from "@/utils/format";
import MeterBar from "../../shared/MeterBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";

/** Past this, the ported dashboard calls a user's portfolio stale. */
const STALE_HOURS = 24;

const TvlFreshnessPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const withTvl = data?.tvl?.usersWithTvl;
  const withoutTvl = data?.tvl?.usersWithoutTvl;
  const freshness = data?.tvl?.freshness;

  const hours = hoursSince(freshness);
  const isStale = hours !== null && hours > STALE_HOURS;
  const isUnknown = hours === null;

  // `/system/health` reports the two counts but not their sum, so the population
  // is only known when both arrived — otherwise the bars have no denominator.
  const covered =
    typeof withTvl === "number" && typeof withoutTvl === "number" ? withTvl + withoutTvl : null;

  const tvlErrorCount = Array.isArray(data?.system?.tvlErrors) ? data.system.tvlErrors.length : 0;

  return (
    <Panel
      title="Actualidad de cartera (TVL)"
      description="Cuándo se refrescaron por última vez las posiciones de Zerion. Alimenta las pestañas de Saldos y Usuarios: si el snapshot va viejo, la TVL que ves allí va por detrás de la real."
      tone={isStale ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-stretch">
          {/* The one figure that decides whether anything else on Saldos can be
              trusted, so it gets the size and the colour rather than a tile in a row. */}
          <div
            className={cn(
              "flex flex-col justify-center gap-0.5 rounded-lg border-[0.7px] px-3.5 py-3 sm:min-w-49",
              isUnknown
                ? "border-[rgba(25,54,63,0.06)] bg-[rgba(25,54,63,0.02)]"
                : isStale
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-emerald-200 bg-emerald-50/60"
            )}
          >
            <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
              Último refresco
            </span>
            <span
              className={cn(
                "font-inter text-[22px] font-semibold leading-tight tracking-[-0.88px]",
                isUnknown
                  ? "text-[rgba(25,54,63,0.35)]"
                  : isStale
                    ? "text-amber-700"
                    : "text-emerald-700"
              )}
            >
              {timeAgo(freshness)}
            </span>
            <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              {isUnknown
                ? "el endpoint no devolvió timestamp"
                : isStale
                  ? `${formatDateTime(freshness)} · por encima de ${STALE_HOURS}h`
                  : formatDateTime(freshness)}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3.5 py-3">
            <MeterBar
              label="Usuarios con TVL valorada"
              value={withTvl}
              total={covered}
              tone="good"
            />
            <MeterBar
              label="Usuarios sin TVL"
              value={withoutTvl}
              total={covered}
              tone="muted"
              hint="cartera vacía o nunca refrescada"
            />
            <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
              {covered === null
                ? "Población desconocida — falta uno de los dos contadores."
                : `${formatNumber(covered)} usuarios en total según /system/health.`}
            </p>
          </div>
        </div>

        {tvlErrorCount > 0 && (
          <p className="mt-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600">
            {tvlErrorCount} error(es) de TVL en el último refresco — ver «Posiciones sin precio»
            justo debajo.
          </p>
        )}

        <div className="mt-3">
          <PendingEndpoint
            needs="Falta el histograma por antigüedad («< 1h», «último día», «> 1 día», «nunca») y el usuario más desactualizado: /system/health solo da un timestamp global, que se mueve en cuanto un solo usuario se refresca y por tanto no dice cuántos van rezagados. La consulta ya existe tal cual en el dashboard antiguo (getTvlFreshness) — el spec está en docs/cerebro-sistema-endpoints.md. Los botones «Actualizar activos» / «Actualizar todos» no se piden: son escrituras y Cerebro es de solo lectura."
            fields={["GET /system/tvl-freshness"]}
            shape={{
              fresh1h: 28,
              within1d: 392,
              over1d: 0,
              never: 0,
              total: 420,
              newest: "2026-08-26T09:58:00.000Z",
              oldest: "2026-08-25T12:04:00.000Z",
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default TvlFreshnessPanel;
