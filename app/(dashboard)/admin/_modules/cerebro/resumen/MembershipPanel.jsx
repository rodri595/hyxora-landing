"use client";

import { useGetPnlMembership } from "@/hooks/cerebro/useGetPnlMembership";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import MembershipCard from "./MembershipCard";

/**
 * P&L per membership tier for the selected window.
 *
 * `/pnl/membership` only takes `from` and `to` — unlike the rest of this tab it
 * has no plan, op, chain or user filter — so this section always reports on every
 * plan across every network. The panel says so rather than letting a filtered page
 * imply these cards moved with it.
 *
 * @param {Object} props
 * @param {{ from: string, to: string, plan?: string, op?: string, chain?: string, user?: string }} props.filters
 */
const MembershipPanel = ({ filters }) => {
  const range = useMemo(() => ({ from: filters.from, to: filters.to }), [filters.from, filters.to]);

  const { data, error, isLoading, isFetching, refetch } = useGetPnlMembership(range);

  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => (b.marginUsd ?? 0) - (a.marginUsd ?? 0)),
    [data]
  );

  const ignoresFilters = Boolean(filters.op || filters.chain || filters.user || filters.plan);

  return (
    <Panel
      title="Por membresía"
      description={`Ingresos, gastos y margen de cada plan del ${filters.from} al ${filters.to}, con el desglose por funcionalidad y las posiciones más grandes de sus usuarios.`}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="Ningún plan registró actividad en la ventana."
      >
        {ignoresFilters && (
          <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 bg-amber-50/60 border-[0.7px] border-amber-200 rounded-lg px-2.5 py-2 mb-3">
            Esta sección solo respeta las fechas. /pnl/membership no acepta los filtros de plan,
            funcionalidad, red ni usuario, así que las tarjetas siguen mostrando todos los planes y
            todas las redes.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {rows.map((row) => (
            <MembershipCard key={row.plan} row={row} filters={range} />
          ))}
        </div>

        <div className="mt-3.5">
          <PendingEndpoint
            needs="Tres cosas que el dashboard original enseña en estas tarjetas y /pnl/membership no devuelve. Las altas y bajas del plan en la ventana, que son el dato de rotación. Y en las posiciones: si cada una es token o vault, cuántos titulares tiene, y el total de cartera del plan — sin ese total no se puede decir «39.8% de la cartera», solo comparar posiciones entre sí."
            fields={[
              "/pnl/membership → signups, churn por plan",
              "topHoldings[] → type, holders",
              "/pnl/membership → holdingsTotalUsd por plan",
            ]}
            shape={{
              report: [
                {
                  plan: "founder",
                  usersCount: 45,
                  signups: 1,
                  churn: 0,
                  feesUsd: 22.46,
                  costUsd: 0.32,
                  marginUsd: 22.14,
                  holdingsTotalUsd: 25891.4,
                  topHoldings: [
                    {
                      symbol: "fUSDC",
                      name: "Fluid USDC",
                      type: "vault",
                      totalUsd: 10301.22,
                      holders: 19,
                    },
                  ],
                },
              ],
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default MembershipPanel;
