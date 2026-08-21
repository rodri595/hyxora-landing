"use client";

import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { formatNumber, formatUsd } from "@/utils/format";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { GROWTH_DAYS } from "./constants";

/**
 * App-wide TVL.
 *
 * The current figure is real — `/overview` reports it — but the curve behind it in
 * the original dashboard is a daily history, and Cerebro has no TVL time series:
 * every TVL field in admin.md is a snapshot of right now. Drawing a line from a
 * single point would be inventing the shape of it, so the chart is an ask.
 */
const AppTvlPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetOverview();
  const tvl = data?.medianTvl;

  return (
    <Panel
      title="TVL de la app"
      description="Valor total depositado por todos los usuarios, según el último snapshot de cada uno."
      action={
        <div className="flex items-center gap-2.5">
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-emerald-700 whitespace-nowrap hidden sm:inline">
            {formatUsd(tvl?.totalUsd, { decimals: 0 })} actual
          </span>
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={formatUsd(tvl?.totalUsd, { decimals: 0 })}
            label="TVL total"
            hint="Suma de todas las posiciones rastreadas"
          />
          <StatCard
            value={formatUsd(tvl?.medianUsd, { decimals: 2 })}
            label="Mediana por usuario"
            hint="La mitad de los usuarios está por debajo"
          />
          <StatCard
            value={formatUsd(tvl?.meanUsd, { decimals: 2 })}
            label="Media por usuario"
            hint="Se dispara con una sola cartera grande"
          />
          <StatCard
            value={formatNumber(tvl?.usersWithTvl)}
            label="Usuarios con TVL"
            hint="Solo cuentan los que tienen saldo"
          />
        </div>

        <div className="mt-2.5">
          <PendingEndpoint
            needs={`La serie diaria que dibuja la curva. Todo lo que admin.md expone de TVL es el estado actual — /overview, /holdings y /system/health dan una foto, no un histórico — así que la gráfica de ${GROWTH_DAYS} días no se puede pintar sin inventarse la forma. Con un punto por día y el número de usuarios con saldo en cada uno basta.`}
            fields={[`GET /tvl/daily?days=${GROWTH_DAYS}`]}
            shape={{
              series: [
                { day: "2026-08-19", tvlUsd: 46876.42, usersWithTvl: 118 },
                { day: "2026-08-20", tvlUsd: 47120.08, usersWithTvl: 119 },
              ],
            }}
          />
        </div>

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Los snapshots por usuario se refrescan con la actividad, así que el TVL total mezcla
          fechas: es la suma del último dato de cada uno, no una foto de un instante concreto.
        </p>
      </QueryState>
    </Panel>
  );
};

export default AppTvlPanel;
