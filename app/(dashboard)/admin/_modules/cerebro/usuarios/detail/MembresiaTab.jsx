"use client";

import {
  cerebroMembershipKey,
  cerebroMembershipLabel,
  cerebroMembershipStatuses,
  cerebroPlanLabel,
  cerebroPlans,
} from "@/constants/cerebro";
import { cn } from "@/utils";
import { formatDateTime, formatNumber, timeAgo, toDayString } from "@/utils/format";
import QueryState from "../../../shared/QueryState";
import { firstNumber } from "../../../shared/aggregate";
import { DetailField, EmptyBlock, Footnote, MembershipBadge, SectionHeader } from "./parts";

const INTERVALS = { month: "mensual", year: "anual" };

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toDayString(date);
};

/** Whole days from now to `value` — negative once it has passed. */
const daysUntil = (value) => {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? null : Math.ceil((time - Date.now()) / 86_400_000);
};

/**
 * "en 16 días" / "hoy" / "hace 3 días".
 *
 * @param {number | null} days
 * @return {string | undefined}
 */
export const relativeDays = (days) => {
  if (days === null) return undefined;
  if (days === 0) return "hoy";
  const count = `${formatNumber(Math.abs(days))} día${Math.abs(days) === 1 ? "" : "s"}`;
  return days > 0 ? `en ${count}` : `hace ${count}`;
};

const DOTS = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  bad: "bg-red-500",
  info: "bg-[#2D68FF]",
  neutral: "bg-[rgba(25,54,63,0.3)]",
};

/**
 * One `membership_events` row in words.
 *
 * The four documented fields each mean a different thing to support, so each gets
 * its own sentence rather than a generic "field: old → new": a plan change says
 * which way it went, a renew-date jump is a payment, and a cancel date appearing or
 * disappearing is a request made or withdrawn. An undocumented field still renders,
 * raw, so a new event type is visible the day it ships.
 *
 * @param {import("@/hooks/cerebro/types").UserMembershipEvent} event
 * @return {{ title: string, detail?: string, tone: keyof typeof DOTS }}
 */
const describeEvent = ({ field, oldValue, newValue }) => {
  if (field === "plan") {
    const from = cerebroPlans.indexOf(String(oldValue ?? "").toLowerCase());
    const to = cerebroPlans.indexOf(String(newValue ?? "").toLowerCase());
    const up = from !== -1 && to !== -1 ? to > from : null;
    return {
      title: up === null ? "Cambio de plan" : up ? "Subió de plan" : "Bajó de plan",
      detail: `${cerebroPlanLabel(oldValue)} → ${cerebroPlanLabel(newValue)}`,
      tone: up === false ? "warning" : "good",
    };
  }

  if (field === "membership_status") {
    const key = cerebroMembershipKey(newValue);
    return {
      title: `Estado: ${cerebroMembershipLabel(newValue)}`,
      detail: `antes ${cerebroMembershipLabel(oldValue)}`,
      tone: key === "none" ? "neutral" : (cerebroMembershipStatuses[key]?.tone ?? "warning"),
    };
  }

  if (field === "membership_renew_date") {
    return {
      title: "Renovación pagada (estimado)",
      detail: `renovaba ${formatDay(oldValue) ?? "—"} → renueva ${formatDay(newValue) ?? "—"}`,
      tone: "info",
    };
  }

  if (field === "cancel_effective_date") {
    return newValue
      ? {
          title: "Pidió cancelar",
          detail: `efectiva ${formatDay(newValue) ?? newValue}`,
          tone: "warning",
        }
      : {
          title: "Retiró la cancelación",
          detail: `iba a ser ${formatDay(oldValue) ?? "—"}`,
          tone: "good",
        };
  }

  return {
    title: field ?? "Evento",
    detail: `${oldValue ?? "—"} → ${newValue ?? "—"}`,
    tone: "neutral",
  };
};

const Timeline = ({ events }) => (
  <ol className="ml-1 flex flex-col gap-3 border-l-[0.7px] border-[rgba(25,54,63,0.12)] pl-4">
    {events.map((event, index) => {
      const { title, detail, tone } = describeEvent(event);
      return (
        <li key={`${event.occurredAt}-${event.field}-${index}`} className="relative">
          <span
            className={cn(
              "absolute -left-[20.5px] top-1 size-2 rounded-full ring-2 ring-white",
              DOTS[tone]
            )}
          />
          <div className="flex items-baseline justify-between gap-3">
            <p className="min-w-0 font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F]">
              {title}
            </p>
            <time
              dateTime={event.occurredAt}
              className="shrink-0 font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.68)]"
            >
              {formatDateTime(event.occurredAt)}
            </time>
          </div>
          {detail && (
            <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.75)]">
              {detail}
            </p>
          )}
        </li>
      );
    })}
  </ol>
);

/**
 * One user's membership: where it stands, and every transition that got it there.
 *
 * Rendered in two places, both of which only ask for it on demand: the drawer's
 * «Membresía» tab, and an expanded row of «Pipeline de cancelación» on the
 * Membresías tab — the second so the actionable list can be worked without leaving
 * it. Presentational on purpose: the drawer owns its query so the shared refresh
 * button covers it, and the pipeline row owns one per expanded user.
 *
 * Cancellation dates and the billing interval come from migration #670, and the
 * per-user endpoint has no flag saying whether it has been applied. A member with no
 * interval is the tell, so that is when the footnote says those fields may be
 * missing rather than absent.
 *
 * @param {Object} props
 * @param {import("@tanstack/react-query").UseQueryResult<import("@/hooks/cerebro/types").UserMembership>} props.query
 */
const MembresiaTab = ({ query }) => {
  const { data, isLoading, error } = query;
  const user = data?.user ?? {};
  const events = Array.isArray(data?.events) ? data.events : [];

  const hasMembership = cerebroMembershipKey(user.membershipStatus) !== "none";
  const renewIn = daysUntil(user.membershipRenewDate);
  const daysToCancel = firstNumber(user.daysToCancel) ?? daysUntil(user.cancelEffectiveDate);
  const memberDays = daysUntil(user.membershipStartDate);
  const renewals = events.filter((event) => event.field === "membership_renew_date").length;
  const reasons = Array.isArray(user.surveyReasons) ? user.surveyReasons : [];

  return (
    <QueryState isLoading={isLoading} error={error}>
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Estado de la membresía"
            aside={
              user.detailsSyncedAt && (
                <span
                  className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.68)]"
                  title={`Detalle sincronizado ${formatDateTime(user.detailsSyncedAt)}`}
                >
                  Sincronizado {timeAgo(user.detailsSyncedAt)}
                </span>
              )
            }
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailField label="Plan" value={cerebroPlanLabel(user.plan)} />
            <DetailField label="Estado">
              <MembershipBadge status={user.membershipStatus} />
            </DetailField>
            <DetailField label="Cobro" value={user.membershipPaymentType} />
            <DetailField
              label="Periodicidad"
              value={INTERVALS[user.membershipInterval] ?? user.membershipInterval}
            />
            <DetailField
              label="Miembro desde"
              value={formatDay(user.membershipStartDate)}
              hint={
                memberDays !== null && memberDays <= 0
                  ? `${formatNumber(-memberDays)} días`
                  : undefined
              }
            />
            <DetailField
              label="Renovación"
              value={formatDay(user.membershipRenewDate)}
              hint={
                renewIn !== null && renewIn < 0 ? (
                  <span className="text-amber-700">vencida {relativeDays(renewIn)}</span>
                ) : (
                  relativeDays(renewIn)
                )
              }
            />
            {user.founderStatus && <DetailField label="Founder" value={user.founderStatus} />}
          </div>
        </section>

        {(user.cancelRequestedAt ||
          user.cancelEffectiveDate ||
          user.withdrawOnlyUntil ||
          user.cancellationFinalizedAt) && (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Cancelación"
              subtitle="Pide cancelar → disfruta lo pagado hasta la fecha efectiva → 30 días solo de retiro → baja finalizada."
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <DetailField label="Pedida" value={formatDay(user.cancelRequestedAt)} />
              <DetailField
                label="Efectiva"
                value={formatDay(user.cancelEffectiveDate)}
                hint={relativeDays(daysToCancel)}
              />
              <DetailField
                label="Solo retiros hasta"
                value={formatDay(user.withdrawOnlyUntil)}
                hint={relativeDays(daysUntil(user.withdrawOnlyUntil))}
              />
              <DetailField label="Finalizada" value={formatDay(user.cancellationFinalizedAt)} />
              {reasons.length > 0 && (
                <DetailField
                  label="Motivos (encuesta)"
                  value={reasons.join(", ")}
                  className="col-span-2 sm:col-span-4"
                />
              )}
            </div>
          </section>
        )}

        {hasMembership && !user.membershipInterval && (
          <Footnote>
            Periodicidad y fechas de cancelación salen de la migración #670. Mientras no esté
            aplicada llegan vacías aunque el usuario haya pedido la baja, así que un «—» aquí no
            confirma que no la haya pedido.
          </Footnote>
        )}

        <section className="flex flex-col gap-3">
          <SectionHeader
            title="Historial"
            subtitle="Cambios de plan, de estado y cada renovación cobrada, del más reciente al más antiguo."
            aside={
              renewals > 0 && (
                <span className="font-inter text-[10px] tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.68)]">
                  {formatNumber(renewals)} renovaci{renewals === 1 ? "ón pagada" : "ones pagadas"}{" "}
                  (estimado)
                </span>
              )
            }
          />
          {events.length === 0 ? (
            <EmptyBlock>
              Sin cambios registrados desde el 10/06/2026, cuando empezó el historial.
            </EmptyBlock>
          ) : (
            <Timeline events={events} />
          )}
          <Footnote>
            No hay un registro de facturas de Stripe: cada «Renovación pagada» es un salto de la
            fecha de renovación que empuja el webhook de pago, así que es una estimación del cobro,
            no la factura.
          </Footnote>
        </section>
      </div>
    </QueryState>
  );
};

export default MembresiaTab;
