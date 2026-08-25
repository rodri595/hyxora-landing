"use client";

import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { useGetUserTrends } from "@/hooks/cerebro/useGetUserTrends";
import { formatNumber, formatUsd, formatUsdAxis } from "@/utils/format";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnimatedCount, AnimatedMoney } from "../../shared/AnimatedValue";
import { TooltipSurface, tooltipWrapperStyle, useHeldTooltip } from "../../shared/ChartTooltip";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { GROWTH_DAYS, TVL_LINE } from "./constants";

const AXIS = "rgba(25,54,63,0.4)";
const GRID = "rgba(25,54,63,0.08)";

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * One snapshot row down to the two fields the curve needs.
 *
 * Tolerant on both: `date` is what the reference documents, `day` is what
 * `/users/stats` calls the same thing, and a Postgres `date_trunc` serialises either
 * as a full timestamp. Rows without a parseable day are dropped rather than plotted
 * at an arbitrary position — the failure that left the growth chart flat next door
 * was a silent one, and this is the same shape of risk.
 *
 * @param {Record<string, unknown>} row
 * @return {{ day: string, tvlUsd: number, users: number | null } | null}
 */
const toPoint = (row) => {
  const raw = row?.date ?? row?.day;
  const day = typeof raw === "string" ? raw.slice(0, 10) : "";
  if (!DAY_PATTERN.test(day)) return null;

  const tvlUsd = Number(row?.tvlUsd ?? row?.tvl ?? row?.totalUsd);
  if (!Number.isFinite(tvlUsd)) return null;

  const users = Number(row?.totalUsers);

  return { day, tvlUsd, users: Number.isFinite(users) ? users : null };
};

const ChartTooltip = (props) => {
  const { visible, payload, label } = useHeldTooltip(props.active, props.payload, props.label);
  if (!payload) return null;
  const point = payload[0]?.payload;

  return (
    <TooltipSurface visible={visible}>
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.45)] mb-1">
        {label}
      </p>
      <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
        <span className="font-semibold tabular-nums text-emerald-700">
          {formatUsd(point?.tvlUsd, { decimals: 0 })}
        </span>
        {point?.users !== null && point?.users !== undefined && (
          <span> · {formatNumber(point.users)} usuarios</span>
        )}
      </p>
    </TooltipSurface>
  );
};

/**
 * App-wide TVL: the current figure, and the curve behind it.
 *
 * The curve was an ask until `/users/trends` shipped — every other TVL field in the
 * API is a snapshot of right now, and drawing a line from one point would have been
 * inventing its shape.
 *
 * The two halves deliberately read different endpoints. The headline stays on
 * `/overview`, which sums each user's latest snapshot; the curve comes from
 * `daily_snapshots`, which admin.md is explicit about being a chart cache and never
 * the source of truth for a current number. Expect the last point and the headline
 * to differ slightly — that gap is the cache, not an error, and this panel would
 * rather show it than hide it by drawing both from the same place.
 */
const AppTvlPanel = () => {
  const overview = useGetOverview();
  const trends = useGetUserTrends({ days: GROWTH_DAYS });

  const tvl = overview.data?.medianTvl;

  const series = useMemo(
    () =>
      (trends.data?.snapshots ?? [])
        .map(toPoint)
        .filter(Boolean)
        .sort((a, b) => a.day.localeCompare(b.day)),
    [trends.data]
  );

  const first = series[0] ?? null;
  const last = series[series.length - 1] ?? null;
  const change = first && last && first.tvlUsd > 0 ? last.tvlUsd / first.tvlUsd - 1 : null;

  return (
    <Panel
      title="TVL de la app"
      meta={series.length > 0 ? `${series.length} días` : undefined}
      description="Valor total depositado por todos los usuarios, según el último snapshot de cada uno."
      action={
        <div className="flex items-center gap-2.5">
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-emerald-700 whitespace-nowrap hidden sm:inline">
            {formatUsd(tvl?.totalUsd, { decimals: 0 })} actual
          </span>
          <RefreshButton
            onClick={() => {
              overview.refetch();
              trends.refetch();
            }}
            isLoading={overview.isFetching || trends.isFetching}
          />
        </div>
      }
    >
      <QueryState isLoading={overview.isLoading} error={overview.error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard
            value={<AnimatedMoney value={tvl?.totalUsd} decimals={0} />}
            label="TVL total"
            hint="Suma de todas las posiciones rastreadas"
          />
          <StatCard
            value={<AnimatedMoney value={tvl?.medianUsd} />}
            label="Mediana por usuario"
            hint="La mitad de los usuarios está por debajo"
          />
          <StatCard
            value={<AnimatedMoney value={tvl?.meanUsd} />}
            label="Media por usuario"
            hint="Se dispara con una sola cartera grande"
          />
          <StatCard
            value={<AnimatedCount value={tvl?.usersWithTvl} />}
            label="Usuarios con TVL"
            hint="Solo cuentan los que tienen saldo"
          />
        </div>
      </QueryState>

      <div className="mt-3.5">
        <QueryState
          isLoading={trends.isLoading}
          error={trends.error}
          isEmpty={!trends.isLoading && !trends.error && series.length === 0}
          emptyLabel="/users/trends no devolvió snapshots con fecha y TVL para esta ventana."
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="cerebroTvlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TVL_LINE} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={TVL_LINE} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey="day"
                tickFormatter={(value) => value.slice(5).split("-").reverse().join("/")}
                tick={{ fontSize: 10, fill: AXIS }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatUsdAxis}
                tick={{ fontSize: 10, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: GRID }}
                wrapperStyle={tooltipWrapperStyle}
              />
              <Area
                type="monotone"
                dataKey="tvlUsd"
                name="TVL"
                stroke={TVL_LINE}
                strokeWidth={1.6}
                fill="url(#cerebroTvlFill)"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {change !== null && (
            <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
              Del {first.day} al {last.day}, de {formatUsd(first.tvlUsd, { decimals: 0 })} a{" "}
              {formatUsd(last.tvlUsd, { decimals: 0 })} —{" "}
              <span className={change >= 0 ? "text-emerald-700" : "text-red-600"}>
                {change >= 0 ? "+" : ""}
                {(change * 100).toFixed(1)}%
              </span>
              . La curva sale de `daily_snapshots`, que es caché de gráficas: el último punto puede
              no cuadrar exactamente con la cifra actual de arriba.
            </p>
          )}
        </QueryState>
      </div>

      <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
        Los snapshots por usuario se refrescan con la actividad, así que el TVL total mezcla fechas:
        es la suma del último dato de cada uno, no una foto de un instante concreto.
      </p>
    </Panel>
  );
};

export default AppTvlPanel;
