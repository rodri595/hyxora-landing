"use client";

import { useGetUserStats } from "@/hooks/cerebro/useGetUserStats";
import { formatNumber } from "@/utils/format";
import { AnimatedCount } from "../../shared/AnimatedValue";
import MeterBar from "../../shared/MeterBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import PendingEndpoint from "../../shared/PendingEndpoint";
import QueryState from "../../shared/QueryState";

const UserActivationPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetUserStats();

  const activation = data?.activation;
  const total = activation?.total;
  const withWallet = activation?.withWallet;
  const withTvl = activation?.withTvl;
  const active = activation?.active;

  // The only exclusive bucket the four counters yield without assuming how they
  // overlap: everyone who never got as far as creating a wallet.
  const withoutWallet =
    typeof total === "number" && typeof withWallet === "number" ? total - withWallet : null;

  return (
    <Panel
      title="Activación de usuarios"
      description="Hasta dónde llega cada usuario en el onboarding. Los cuatro contadores de /users/stats se solapan, así que se leen como etapas sobre el mismo total — no como tramos excluyentes que sumen. Clasificación solo visual: no se oculta a nadie."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-stretch">
          <div className="flex flex-col justify-center gap-0.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3.5 py-3 sm:min-w-44">
            <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
              Usuarios totales
            </span>
            <span className="font-inter text-[22px] font-semibold leading-tight tracking-[-0.88px] text-[#19363F]">
              <AnimatedCount value={total} />
            </span>
            <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              {withoutWallet === null
                ? "sin wallet: —"
                : `${formatNumber(withoutWallet)} sin wallet · abandonaron el onboarding`}
            </span>
          </div>

          {/* Each bar is that criterion's share of `total`, which is the one
              comparison the response supports. Ordered widest to narrowest so the
              drop-off between stages is the shape you see first. */}
          <div className="flex flex-1 flex-col justify-center gap-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3.5 py-3">
            <MeterBar label="Con wallet creada" value={withWallet} total={total} tone="neutral" />
            <MeterBar label="Con saldo (TVL > 0)" value={withTvl} total={total} tone="warning" />
            <MeterBar label="Activos" value={active} total={total} tone="good" />
          </div>
        </div>

        <div className="mt-3">
          <PendingEndpoint
            needs="El embudo de cinco tramos del dashboard antiguo («sin wallet», «wallet sin desplegar», «desplegada nunca usada», «con saldo nunca usada», «activos») necesita saber el solapamiento entre wallet, saldo y actividad: /users/stats devuelve cuatro totales sueltos y solo «sin wallet» se puede derivar sin suponer un orden. Falta también la lista de usuarios con fondos aparcados que nunca usaron la app — la promo EURC de mayo dejó un grupo, y es una lista de contacto, no una estadística. Los tramos, las tablas de origen y una duda abierta sobre qué cuenta como «desplegada» están en docs/cerebro-sistema-endpoints.md."
            fields={["GET /users/activation", "o /users/stats → activation.buckets"]}
            shape={{
              total: 447,
              buckets: {
                noWallet: 27,
                walletNotDeployed: 286,
                deployedNeverUsed: 42,
                fundedNeverUsed: 16,
                active: 76,
              },
              fundedNeverUsed: [
                {
                  privyId: "did:privy:abc123",
                  email: "user@example.com",
                  tvlUsd: 105.03,
                  safe: "0x7b0c...44cc",
                  createdAt: "2026-05-14T10:00:00.000Z",
                },
              ],
            }}
          />
        </div>
      </QueryState>
    </Panel>
  );
};

export default UserActivationPanel;
