"use client";

import DataTable from "@/components/DataTable";
import { useGetUserActivation } from "@/hooks/cerebro/useGetUserActivation";
import { formatDateTime, formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo } from "react";
import AddressLink from "../../shared/AddressLink";
import { AnimatedCount } from "../../shared/AnimatedValue";
import MeterBar from "../../shared/MeterBar";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";

const isCount = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * The five stages in funnel order — the order `/users/activation` evaluates them
 * in, and the order the population narrows in.
 *
 * The funnel renders from this list rather than from the response, so a stage that
 * could not be worked out draws an empty bar instead of dropping out of the funnel.
 */
const STAGES = [
  { key: "noWallet", label: "Sin wallet", tone: "muted" },
  { key: "walletNotDeployed", label: "Wallet sin desplegar", tone: "muted" },
  { key: "deployedNeverUsed", label: "Desplegada, nunca usada", tone: "neutral" },
  { key: "balanceNeverUsed", label: "Con saldo, nunca usada", tone: "warning" },
  { key: "active", label: "Activos", tone: "good" },
];

const UserCell = ({ row }) => {
  if (row.email) {
    return (
      <span className="text-[#19363F]" title={row.privyId}>
        {row.email}
      </span>
    );
  }

  return (
    <span className="font-mono text-[10px] text-[rgba(25,54,63,0.5)]" title={row.privyId}>
      {shortenHash(row.privyId ?? "", { lead: 14, tail: 4 })}
    </span>
  );
};

const USER_COLUMN = {
  accessorKey: "email",
  header: "Usuario",
  cell: (info) => <UserCell row={info.row.original} />,
  footer: () => "Total",
};

/**
 * `safeAddress` is not in admin.md's `/users` response, only in the query it was
 * ported from — so the column exists when the field arrives and is left out when it
 * doesn't, rather than printing a column of dashes.
 */
const SAFE_COLUMN = {
  accessorKey: "safe",
  header: "Safe",
  enableSorting: false,
  cell: (info) => {
    const value = info.getValue();
    if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
    return <AddressLink address={value} />;
  },
};

const REST_COLUMNS = [
  {
    accessorKey: "createdAt",
    header: "Alta",
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
        {formatDateTime(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "tvlUsd",
    header: "Saldo aparcado",
    meta: { align: "right", label: "Saldo" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-amber-700">
        {formatUsd(info.getValue(), { decimals: 2 })}
      </span>
    ),
    footer: ({ table }) => formatUsd(sumColumn(table, "tvlUsd"), { decimals: 2 }),
  },
];

/**
 * How far each user got in onboarding, and who is stuck holding money.
 *
 * The funnel is assembled in `useGetUserActivation` from `/users/stats` and the
 * inactive user list, because `/users/activation` — which exists, and would answer
 * all of this in one request — returns a 500 from its own date handling. See that
 * hook for how the five stages fall out of two endpoints, and what has to hold for
 * them to be right.
 *
 * The table under the funnel is the funded-but-inactive bucket listed out: people
 * whose money sits in a Safe they have never used. That is an outreach list, which
 * is why it gets a table with an export and not a fifth number.
 */
const UserActivationPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetUserActivation();

  const total = data?.total;
  const buckets = data?.buckets;
  const warnings = data?.warnings ?? [];
  const notes = data?.notes ?? [];
  const parked = useMemo(
    () => (Array.isArray(data?.balanceNeverUsed) ? data.balanceNeverUsed : []),
    [data]
  );

  const parkedUsd = parked.reduce((sum, user) => sum + (user.tvlUsd ?? 0), 0);
  const hasSafes = parked.some((user) => user.safe);

  const columns = useMemo(
    () => (hasSafes ? [USER_COLUMN, SAFE_COLUMN, ...REST_COLUMNS] : [USER_COLUMN, ...REST_COLUMNS]),
    [hasSafes]
  );

  return (
    <Panel
      title="Activación de usuarios"
      description="Hasta dónde llega cada usuario en el onboarding, en cinco tramos excluyentes que suman el total. Se clasifica usuario a usuario recorriendo /users, porque /users/activation existe pero responde 500."
      tone={warnings.length > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {warnings.map((warning) => (
          <p
            key={warning}
            className="mb-2.5 font-inter text-[11px] font-medium leading-[1.5] tracking-[-0.44px] text-amber-700"
          >
            {warning}
          </p>
        ))}

        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-stretch">
          <div className="flex flex-col justify-center gap-0.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3.5 py-3 sm:min-w-44">
            <span className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.4)]">
              Usuarios totales
            </span>
            <span className="font-inter text-[22px] font-semibold leading-tight tracking-[-0.88px] text-[#19363F]">
              <AnimatedCount value={total} />
            </span>
            <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              {isCount(buckets?.active) && isCount(total) && total > 0
                ? `${formatNumber((buckets.active / total) * 100, { decimals: 1 })}% ha llegado a usar la app`
                : "—"}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] px-3.5 py-3">
            {STAGES.map((stage) => (
              <MeterBar
                key={stage.key}
                label={stage.label}
                value={buckets?.[stage.key]}
                total={total}
                tone={stage.tone}
              />
            ))}
          </div>
        </div>

        {notes.map((note) => (
          <p
            key={note}
            className="mt-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]"
          >
            {note}
          </p>
        ))}

        <div className="mt-4 border-t-[0.7px] border-[rgba(25,54,63,0.06)] pt-3.5">
          <h4 className="mb-2 flex flex-wrap items-baseline gap-x-2 font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
            Fondos aparcados
            {parked.length > 0 && (
              <span className="font-normal tabular-nums text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                {formatNumber(parked.length)} {parked.length === 1 ? "usuario" : "usuarios"} ·{" "}
                {formatUsd(parkedUsd, { decimals: 2 })}
              </span>
            )}
          </h4>

          {parked.length === 0 ? (
            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
              Nadie tiene saldo en una Safe que no haya usado nunca.
            </p>
          ) : (
            <DataTable
              data={parked}
              columns={columns}
              filename="cerebro-fondos-aparcados"
              searchPlaceholder="Buscar por correo o Safe..."
              initialSorting={[{ id: "tvlUsd", desc: true }]}
              enableSelection={false}
              enableFooter
              bare
              dense
              maxHeight={340}
            />
          )}

          <p className="mt-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            Gente cuyo dinero está en una Safe que nunca han usado — la promo de EURC de mayo dejó
            un grupo. Es una lista de contacto, no una estadística. «Desplegada» es tener gasto
            patrocinado: solo pagamos gas de una Safe que ya existe. «Usada» se aproxima con
            comisiones pagadas o más de una operación patrocinada, porque /users no expone
            actividades ni órdenes de ramp — quien solo hizo operaciones gratuitas cae un tramo más
            abajo del que le toca. El umbral de saldo es $0.50.
          </p>
        </div>
      </QueryState>
    </Panel>
  );
};

export default UserActivationPanel;
