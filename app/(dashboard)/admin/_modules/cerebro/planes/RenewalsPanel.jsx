"use client";

import { cerebroPlanLabel, cerebroPlans } from "@/constants/cerebro";
import { useGetRenewals } from "@/hooks/cerebro/useGetRenewals";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { RENEWAL_DAYS } from "./constants";

/**
 * Memberships lapsing in the next `RENEWAL_DAYS` days, by plan.
 *
 * Counts only — `/users/renewals` returns `total` and `byPlan` and nothing about who
 * they are, so this says how much is up for renewal and not who to write to. Getting
 * the list would need the users behind those counts, which no endpoint exposes.
 *
 * Plans are laid out in `cerebroPlans` order rather than in whatever order the
 * response arrives, and a plan with nothing expiring still gets a tile: a missing
 * tile reads as "no data", and zero is an answer.
 */
const RenewalsPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetRenewals({ days: RENEWAL_DAYS });

  const byPlan = useMemo(() => {
    const counts = data?.byPlan ?? {};
    return cerebroPlans.map((plan) => ({
      plan,
      count: Number(counts[plan]) || 0,
    }));
  }, [data]);

  // Plans the API named that we don't know about — a tier added after
  // constants/cerebro.js was written would otherwise vanish from the total.
  const extra = useMemo(() => {
    const counts = data?.byPlan ?? {};
    return Object.keys(counts).filter((plan) => !cerebroPlans.includes(plan));
  }, [data]);

  const total = data?.total ?? 0;

  return (
    <Panel
      title="Renovaciones próximas"
      meta={`próximos ${RENEWAL_DAYS} días`}
      description="Membresías que caducan dentro de la ventana, repartidas por plan."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2">
          <StatCard
            value={<AnimatedCount value={total} />}
            label="Total a renovar"
            tone={total > 0 ? "warning" : "muted"}
            hint={`Caducan antes de ${RENEWAL_DAYS} días`}
          />
          {byPlan.map(({ plan, count }) => (
            <StatCard
              key={plan}
              value={<AnimatedCount value={count} />}
              label={cerebroPlanLabel(plan)}
              tone={count > 0 ? "neutral" : "muted"}
            />
          ))}
        </div>

        {extra.length > 0 && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
            La API devolvió planes que no conocemos: {extra.join(", ")}. Cuentan en el total pero no
            tienen tarjeta — añádelos a `cerebroPlans` en constants/cerebro.js.
          </p>
        )}

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Solo recuentos: /users/renewals no devuelve quiénes son, así que esto dice cuánto hay en
          juego, no a quién escribir. Para la lista haría falta que el endpoint expusiera los
          usuarios detrás de cada cifra.
          {total > 0 && ` Ahora mismo son ${formatNumber(total)} membresías.`}
        </p>
      </QueryState>
    </Panel>
  );
};

export default RenewalsPanel;
