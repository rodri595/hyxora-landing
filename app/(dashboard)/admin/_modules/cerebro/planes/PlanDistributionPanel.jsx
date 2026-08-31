"use client";

import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import CompositionBar from "../../shared/CompositionBar";
import MeterBar from "../../shared/MeterBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

/**
 * Merge `usersByPlan` (everyone) with `registeredByPlan` (completed signup) so a
 * plan with lots of accounts but few registrations is visible at a glance.
 */
const mergeByPlan = (usersByPlan = [], registeredByPlan = []) => {
  const registered = new Map(registeredByPlan.map((row) => [row.plan, row.count]));

  return usersByPlan.map((row) => ({
    plan: row.plan,
    users: row.count ?? 0,
    registered: registered.get(row.plan) ?? 0,
  }));
};

const PlanDistributionPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetOverview();

  const rows = useMemo(() => mergeByPlan(data?.usersByPlan, data?.registeredByPlan), [data]);

  const composition = useMemo(
    () => rows.map((row) => ({ label: cerebroPlanLabel(row.plan), value: row.users })),
    [rows]
  );

  // Sorted by size so the widest bar leads; a plan with no accounts at all has no
  // completion rate to report and would draw an empty track that reads as 0%.
  const funnels = useMemo(
    () => [...rows].filter((row) => row.users > 0).sort((a, b) => b.users - a.users),
    [rows]
  );

  return (
    <Panel
      title="Distribución por plan"
      description="Cuántas cuentas hay en cada plan y cuántas completaron el registro. La diferencia son cuentas creadas que nunca terminaron el onboarding."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="El endpoint no devolvió planes."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            {rows.map((row) => (
              <StatCard
                key={row.plan}
                value={<AnimatedCount value={row.users} />}
                label={cerebroPlanLabel(row.plan)}
                hint={`${formatNumber(row.registered)} registrados`}
                tone={row.registered > 0 ? "neutral" : "muted"}
              />
            ))}
          </div>

          <div>
            <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)] mb-2">
              Reparto de cuentas
            </h4>
            <CompositionBar
              items={composition}
              formatValue={(value) => formatNumber(value)}
              ariaLabel="Reparto de cuentas entre los planes"
            />
          </div>

          {funnels.length > 0 && (
            <div>
              <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)] mb-2">
                Registro completado por plan
              </h4>
              <div className="flex flex-col gap-2">
                {funnels.map((row) => (
                  <MeterBar
                    key={row.plan}
                    label={cerebroPlanLabel(row.plan)}
                    value={row.registered}
                    total={row.users}
                    tone={row.registered === 0 ? "warning" : "good"}
                    hint={`de ${formatNumber(row.users)}`}
                  />
                ))}
              </div>
              <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
                La barra llena es quien terminó el onboarding; lo que falta son cuentas creadas que
                se quedaron a medias. Un plan al 100% no significa que estén activos, solo
                registrados.
              </p>
            </div>
          )}
        </div>
      </QueryState>
    </Panel>
  );
};

export default PlanDistributionPanel;
