"use client";

import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { formatNumber, hoursSince, timeAgo } from "@/utils/format";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

const STALE_HOURS = 24;

const TvlFreshnessPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const withTvl = data?.tvl?.usersWithTvl ?? null;
  const withoutTvl = data?.tvl?.usersWithoutTvl ?? null;
  const freshness = data?.tvl?.freshness;
  const isStale = (hoursSince(freshness) ?? 0) > STALE_HOURS;

  return (
    <Panel
      title="Actualidad de cartera (TVL)"
      description="Cuándo se refrescaron por última vez las posiciones de los usuarios. Alimenta las pestañas de Balances y Usuarios: si el snapshot está viejo, la TVL que se muestra allí va por detrás de la real."
      tone={isStale ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={formatNumber(withTvl)}
            label="Usuarios con TVL"
            tone={withTvl > 0 ? "good" : "muted"}
          />
          <StatCard
            value={formatNumber(withoutTvl)}
            label="Usuarios sin TVL"
            tone={withoutTvl > 0 ? "muted" : "neutral"}
          />
          <StatCard
            value={timeAgo(freshness)}
            label="Último refresco"
            tone={isStale ? "warning" : "good"}
            hint={freshness ? new Date(freshness).toLocaleString() : undefined}
          />
        </div>

        {Array.isArray(data?.system?.tvlErrors) && data.system.tvlErrors.length > 0 && (
          <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600 mt-2.5">
            {data.system.tvlErrors.length} error(es) de TVL reportados — ver «Posiciones sin
            precio».
          </p>
        )}

        <div className="mt-3">
          <PendingEndpoint
            needs="El desglose por antigüedad (< 1h, último día, > 1 día, nunca) y los botones «Actualizar activos» / «Actualizar todos» no existen en la API v1: /system/health solo da un timestamp global y dos contadores, y todos los endpoints de Cerebro son de lectura."
            fields={["GET /system/tvl-freshness → buckets", "POST /system/tvl-refresh"]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default TvlFreshnessPanel;
