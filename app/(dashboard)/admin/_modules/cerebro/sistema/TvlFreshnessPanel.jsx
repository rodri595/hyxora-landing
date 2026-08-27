"use client";

import { useGetTvlFreshness } from "@/hooks/cerebro/useGetTvlFreshness";
import { formatDateTime, formatNumber, timeAgo } from "@/utils/format";
import { AnimatedCount } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

const isCount = (value) => typeof value === "number" && Number.isFinite(value);

/** One labelled figure on the footer line. */
const Fact = ({ label, value, title }) => (
  <div className="flex items-center gap-1.5">
    <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
      {label}
    </span>
    <span
      className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.65)]"
      title={title}
    >
      {value}
    </span>
  </div>
);

/**
 * How stale the TVL behind Saldos and Usuarios is, user by user.
 *
 * Read `/system/tvl-freshness` and not `/system/health`: the latter reports one
 * global timestamp, the max of the same column, so a single user refreshing moves
 * it while everyone else stays a day behind. The histogram is the only thing that
 * says how much of the TVL on the other tabs is current.
 */
const TvlFreshnessPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetTvlFreshness();

  const { fresh1h, within1d, over1d, never, total, newest, oldest } = data ?? {};

  // The two ways of being out of date, added because the headline treats them the
  // same: `over1d` is a portfolio that has drifted, `never` one that was never
  // fetched at all. Null rather than 0 when either field is missing — "nobody is
  // lagging" is a claim, and a field that did not arrive is no evidence for it.
  const lagging = isCount(over1d) && isCount(never) ? over1d + never : null;

  return (
    <Panel
      title="Actualidad de cartera (TVL)"
      description="Cuándo se refrescaron por última vez las posiciones de Zerion, usuario a usuario. Alimenta las pestañas de Saldos y Usuarios: la parte rezagada de este histograma es exactamente la parte de la TVL que allí va por detrás de la real."
      tone={lagging > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {lagging !== null &&
          (lagging > 0 ? (
            <p className="mb-2.5 font-inter text-[11px] font-medium leading-[1.5] tracking-[-0.44px] text-amber-700">
              {formatNumber(lagging)}{" "}
              {lagging === 1 ? "usuario sin refrescar" : "usuarios sin refrescar"} en el último día
              — su saldo en Saldos y Usuarios se queda corto hasta el próximo barrido.
            </p>
          ) : (
            <p className="mb-2.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-emerald-700">
              Todos los usuarios con Safe se refrescaron en el último día.
            </p>
          ))}

        <div className="flex flex-wrap gap-2.5">
          <StatCard value={<AnimatedCount value={fresh1h} />} label="Menos de 1h" tone="good" />
          <StatCard
            value={<AnimatedCount value={within1d} />}
            label="En el último día"
            tone="neutral"
          />
          <StatCard
            value={<AnimatedCount value={over1d} />}
            label="Más de 1 día"
            tone={over1d > 0 ? "warning" : "muted"}
            hint="desactualizados"
          />
          <StatCard
            value={<AnimatedCount value={never} />}
            label="Nunca refrescados"
            tone={never > 0 ? "warning" : "muted"}
            hint="Safe sin snapshot"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t-[0.7px] border-[rgba(25,54,63,0.06)] pt-3">
          <Fact label="Usuarios con Safe" value={formatNumber(total)} />
          <Fact
            label="Refresco más reciente"
            value={timeAgo(newest)}
            title={formatDateTime(newest)}
          />
          <Fact label="Más antiguo" value={timeAgo(oldest)} title={formatDateTime(oldest)} />
        </div>

        <p className="mt-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          Los cuatro tramos son excluyentes y suman el total, que solo cuenta usuarios con Safe: una
          cuenta de Privy sin wallet no tiene nada que refrescar. Cerebro es de solo lectura, así
          que «Actualizar» aquí vuelve a leer el histograma — disparar el refresco de Zerion sigue
          siendo cosa del cron y de los botones del dashboard antiguo.
        </p>
      </QueryState>
    </Panel>
  );
};

export default TvlFreshnessPanel;
