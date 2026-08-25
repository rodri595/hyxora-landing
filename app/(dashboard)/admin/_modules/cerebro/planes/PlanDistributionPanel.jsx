"use client";

import { useGetOverview } from "@/hooks/cerebro/useGetOverview";
import { formatNumber } from "@/utils/format";
import { useMemo } from "react";
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
        <div className="flex flex-wrap gap-2.5">
          {rows.map((row) => (
            <StatCard
              key={row.plan}
              value={formatNumber(row.users)}
              label={row.plan}
              hint={`${formatNumber(row.registered)} registrados`}
              tone={row.registered > 0 ? "neutral" : "muted"}
            />
          ))}
        </div>
      </QueryState>
    </Panel>
  );
};

export default PlanDistributionPanel;
