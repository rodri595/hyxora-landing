"use client";

import { useGetUserStats } from "@/hooks/cerebro/useGetUserStats";
import { formatNumber } from "@/utils/format";
import { AnimatedCount } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

const UserActivationPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetUserStats();

  const activation = data?.activation;
  const total = activation?.total ?? null;
  const withWallet = activation?.withWallet ?? null;
  const active = activation?.active ?? null;
  const withTvl = activation?.withTvl ?? null;

  // The only bucket the four counters let us derive without guessing at overlaps.
  const withoutWallet =
    typeof total === "number" && typeof withWallet === "number" ? total - withWallet : null;

  return (
    <Panel
      title="Activación de usuarios"
      description="Hasta dónde llega cada usuario en el onboarding. Clasificación solo visual — no oculta a nadie."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-wrap gap-2.5">
          <StatCard value={<AnimatedCount value={total} />} label="Usuarios totales" />
          <StatCard
            value={<AnimatedCount value={withoutWallet} />}
            label="Sin wallet"
            tone={withoutWallet > 0 ? "muted" : "neutral"}
            hint="total − con wallet"
          />
          <StatCard value={<AnimatedCount value={withWallet} />} label="Con wallet" />
          <StatCard
            value={<AnimatedCount value={withTvl} />}
            label="Con saldo"
            tone={withTvl > 0 ? "warning" : "neutral"}
          />
          <StatCard
            value={<AnimatedCount value={active} />}
            label="Activos"
            tone={active > 0 ? "good" : "neutral"}
          />
        </div>

        <div className="mt-3">
          <PendingEndpoint
            needs="Los cinco tramos del dashboard original («wallet sin desplegar», «desplegada nunca usada», «con saldo nunca usada») necesitan saber el solapamiento entre wallet, saldo y actividad — /users/stats solo devuelve cuatro totales sueltos. La tabla de usuarios con fondos aparcados tampoco tiene endpoint."
            fields={[
              "GET /users/activation → tramos excluyentes",
              "GET /users/activation/funded-inactive → email, tvlUsd, safe",
            ]}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default UserActivationPanel;
