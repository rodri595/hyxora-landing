"use client";

import DataTable from "@/components/DataTable";
import { cerebroPlanLabel } from "@/constants/cerebro";
import { useGetMembershipsCancellations } from "@/hooks/cerebro/useGetMembershipsCancellations";
import { useGetUserMembership } from "@/hooks/cerebro/useGetUserMembership";
import { cn } from "@/utils";
import { formatNumber, shortenHash, toDayString } from "@/utils/format";
import { useCallback, useMemo, useState } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import CompositionBar from "../../shared/CompositionBar";
import { PanelNote } from "../../shared/Explanations";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";
import { firstNumber } from "../../shared/aggregate";
import FilterSelect from "../costos/FilterSelect";
import MembresiaTab, { relativeDays } from "../usuarios/detail/MembresiaTab";
import { CANCELLATION_DAYS, CANCELLATION_LIMIT, CANCELLATION_WINDOWS } from "./constants";

const PAGE_SIZE = 25;

/**
 * Where a row sits on the backend's cancellation timeline: asked → effective date →
 * 30 days withdraw-only → finalised. Ordered so the table leads with the people who
 * can still be kept.
 */
const PHASES = {
  pending: { label: "Cancelará", order: 0, tone: "border-amber-200 bg-amber-50 text-amber-700" },
  grace: { label: "Solo retiros", order: 1, tone: "border-red-200 bg-red-50 text-red-700" },
  finalized: {
    label: "Finalizada",
    order: 2,
    tone: "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.04)] text-[rgba(25,54,63,0.75)]",
  },
};

const phaseOf = (row) =>
  row.cancellationFinalizedAt ? "finalized" : row.withdrawOnlyUntil ? "grace" : "pending";

const time = (value) => {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

/** Soonest effective date first while pending, soonest end of grace next, newest finalised last. */
const pipelineOrder = (a, b) =>
  PHASES[a.phase].order - PHASES[b.phase].order ||
  (a.phase === "finalized"
    ? time(b.cancellationFinalizedAt) - time(a.cancellationFinalizedAt)
    : a.phase === "grace"
      ? time(a.withdrawOnlyUntil) - time(b.withdrawOnlyUntil)
      : time(a.cancelEffectiveDate) - time(b.cancelEffectiveDate));

const formatDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toDayString(date);
};

const DayCell = ({ value, hint }) =>
  value ? (
    <span className="flex flex-col">
      <span className="tabular-nums text-[rgba(25,54,63,0.85)]">{formatDay(value)}</span>
      {hint && <span className="text-[10px] text-[rgba(25,54,63,0.68)]">{hint}</span>}
    </span>
  ) : (
    <span className="text-[rgba(25,54,63,0.5)]">—</span>
  );

const readableReason = (reason) => String(reason ?? "—").replaceAll("_", " ");

const columns = [
  {
    id: "user",
    header: "Usuario",
    accessorFn: (row) => row.email || (row.username ? `@${row.username}` : row.privyId),
    cell: (info) => (
      <span
        className="block max-w-[220px] truncate font-medium text-[#19363F]"
        title={info.row.original.privyId}
      >
        {info.row.original.email ||
          (info.row.original.username
            ? `@${info.row.original.username}`
            : shortenHash(info.row.original.privyId, { lead: 12, tail: 6 }))}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: (info) => cerebroPlanLabel(info.getValue()),
  },
  {
    id: "phase",
    header: "Fase",
    accessorFn: (row) => PHASES[row.phase].order,
    cell: (info) => {
      const phase = PHASES[info.row.original.phase];
      return (
        <span
          className={cn(
            "inline-flex whitespace-nowrap rounded-full border px-1.5 py-0.5 font-inter text-[10px] font-medium uppercase tracking-[0.4px]",
            phase.tone
          )}
        >
          {phase.label}
        </span>
      );
    },
  },
  {
    id: "billing",
    header: "Cobro",
    accessorFn: (row) => [row.paymentType, row.interval].filter(Boolean).join(" · "),
    cell: (info) => info.getValue() || <span className="text-[rgba(25,54,63,0.5)]">—</span>,
  },
  {
    accessorKey: "cancelRequestedAt",
    header: "Pedida",
    cell: (info) => <DayCell value={info.getValue()} />,
  },
  {
    accessorKey: "cancelEffectiveDate",
    header: "Efectiva",
    cell: (info) => (
      <DayCell
        value={info.getValue()}
        hint={
          info.row.original.phase === "pending"
            ? relativeDays(info.row.original.daysToCancel)
            : undefined
        }
      />
    ),
  },
  {
    accessorKey: "withdrawOnlyUntil",
    header: "Solo retiros hasta",
    cell: (info) => <DayCell value={info.getValue()} />,
  },
  {
    accessorKey: "cancellationFinalizedAt",
    header: "Finalizada",
    cell: (info) => <DayCell value={info.getValue()} />,
  },
  {
    id: "reasons",
    header: "Motivos",
    accessorFn: (row) =>
      Array.isArray(row.surveyReasons) ? row.surveyReasons.map(readableReason).join(", ") : "",
    cell: (info) => info.getValue() || <span className="text-[rgba(25,54,63,0.5)]">—</span>,
  },
];

/** One expanded row: asks for that user's timeline only once somebody opens it. */
const CancellationDetail = ({ privyId }) => {
  const query = useGetUserMembership(privyId);
  return <MembresiaTab query={query} />;
};

/**
 * The cancellation pipeline as a list of people — the one panel on this tab meant to
 * be worked, not read.
 *
 * Everyone who asked to cancel and is still inside the period they paid for comes
 * first, soonest effective date at the top: those are the ones a retention email can
 * still reach. Then the 30-day withdraw-only grace, then the cancellations finalised
 * inside the window, with their survey answers.
 *
 * Opening a row loads that user's full membership history from
 * `/users/{privyId}/membership` — the same view the user drawer shows — so the list
 * can be worked without leaving it, and a row nobody opens costs nothing.
 *
 * Until migration #670 the endpoint has no cancellation dates at all and answers
 * `lifecycleAvailable: false` with no rows. That says so instead of rendering an
 * empty table, which would read as «nobody is cancelling».
 */
const CancellationsPanel = () => {
  const [days, setDays] = useState(CANCELLATION_DAYS);
  const { data, error, isLoading, isFetching, refetch } = useGetMembershipsCancellations({ days });

  const rows = useMemo(
    () =>
      (data?.rows ?? [])
        .map((row) => ({
          ...row,
          phase: phaseOf(row),
          daysToCancel: firstNumber(row.daysToCancel),
        }))
        .sort(pipelineOrder),
    [data]
  );

  const reasons = useMemo(
    () =>
      (data?.reasons ?? []).map((entry) => ({
        label: readableReason(entry.reason),
        value: firstNumber(entry.users) ?? 0,
      })),
    [data]
  );

  const renderSubRow = useCallback((row) => <CancellationDetail privyId={row.privyId} />, []);

  const counts = data?.counts ?? {};
  const unavailable = data && data.lifecycleAvailable === false;
  const capped = rows.length >= CANCELLATION_LIMIT;

  return (
    <Panel
      title="Pipeline de cancelación"
      meta={`finalizadas en ${days} días`}
      description="Quién ha pedido cancelar y sigue en su periodo pagado, quién está en los 30 días de solo retiro, y quién terminó de darse de baja en la ventana. Abre una fila para ver todo su historial de membresía."
      action={
        <div className="flex items-center gap-2">
          <FilterSelect
            value={days}
            onChange={setDays}
            options={CANCELLATION_WINDOWS}
            label="Ventana de cancelaciones finalizadas"
          />
          <RefreshButton onClick={() => refetch()} isLoading={isFetching} />
        </div>
      }
    >
      <QueryState isLoading={isLoading} error={error}>
        {unavailable ? (
          <p className="rounded-lg border-[0.7px] border-amber-200 bg-amber-50/60 px-2.5 py-2 font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700">
            Pendiente de la migración #670: hasta que se aplique en la base de datos de Cerebro no
            hay fechas de cancelación y la lista llega vacía. No significa que nadie esté cancelando
            — el recuento de «cancelará» en «Estado de las membresías» sí está disponible.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <StatCard
                value={<AnimatedCount value={firstNumber(counts.pendingCancellation) ?? 0} />}
                label="Cancelarán"
                tone={firstNumber(counts.pendingCancellation) > 0 ? "warning" : "muted"}
                hint="Aún en su periodo pagado"
              />
              <StatCard
                value={<AnimatedCount value={firstNumber(counts.inWithdrawGrace) ?? 0} />}
                label="En gracia solo-retiro"
                tone={firstNumber(counts.inWithdrawGrace) > 0 ? "warning" : "muted"}
                hint="30 días para sacar fondos"
              />
              <StatCard
                value={<AnimatedCount value={firstNumber(counts.finalizedInWindow) ?? 0} />}
                label="Finalizadas"
                tone="muted"
                hint={`en los últimos ${days} días`}
              />
            </div>

            {reasons.length > 0 && (
              <div>
                <h4 className="font-inter text-[10px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.68)] mb-2">
                  Motivos de baja (encuesta)
                </h4>
                <CompositionBar
                  items={reasons}
                  formatValue={(value) => formatNumber(value)}
                  ariaLabel="Reparto de los motivos de baja de la encuesta"
                  footnote="Solo cancelaciones finalizadas en la ventana que respondieron la encuesta; un usuario puede marcar varios motivos."
                />
              </div>
            )}

            <DataTable
              data={rows}
              columns={columns}
              filename="cerebro-pipeline-cancelacion"
              searchPlaceholder="Buscar por correo, usuario o plan..."
              getRowId={(row) => row.privyId}
              renderSubRow={renderSubRow}
              enablePagination={rows.length > PAGE_SIZE}
              pageSize={PAGE_SIZE}
              emptyLabel="Nadie en el pipeline de cancelación."
              bare
              dense
            />

            {capped && (
              <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700">
                Tope de {formatNumber(CANCELLATION_LIMIT)} filas alcanzado:
                /memberships/cancellations no devuelve más. Acorta la ventana para ver las
                finalizadas que se quedan fuera.
              </p>
            )}

            <PanelNote>
              El orden es el del pipeline, no el de una columna: primero quien aún puede quedarse,
              con la fecha efectiva más cercana arriba. Ordenar por una columna lo sustituye.
            </PanelNote>
          </div>
        )}
      </QueryState>
    </Panel>
  );
};

export default CancellationsPanel;
