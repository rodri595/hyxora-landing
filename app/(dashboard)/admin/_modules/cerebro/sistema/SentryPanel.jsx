"use client";

import DataTable from "@/components/DataTable";
import { useGetSentryReport } from "@/hooks/cerebro/useGetSentryReport";
import { cn } from "@/utils";
import { formatNumber, timeAgo } from "@/utils/format";
import { useMemo } from "react";
import { AnimatedCount } from "../../shared/AnimatedValue";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatCard from "../../shared/StatCard";

/**
 * Sentry's own severity vocabulary. `fatal` and `error` are the two that mean
 * something is broken for a user right now; the rest are noise until they are not.
 */
const LEVEL_TONES = {
  fatal: "bg-red-50 text-red-700 border-red-200",
  error: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-[rgba(25,54,63,0.05)] text-[rgba(25,54,63,0.5)] border-[rgba(25,54,63,0.08)]",
  debug: "bg-[rgba(25,54,63,0.05)] text-[rgba(25,54,63,0.4)] border-[rgba(25,54,63,0.08)]",
};

const LevelBadge = ({ level }) => (
  <span
    className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded-full border font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
      LEVEL_TONES[level] ?? LEVEL_TONES.info
    )}
  >
    {level ?? "—"}
  </span>
);

const columns = [
  {
    accessorKey: "level",
    header: "Nivel",
    cell: (info) => <LevelBadge level={info.getValue()} />,
  },
  {
    accessorKey: "title",
    header: "Error",
    cell: (info) => {
      const { culprit, shortId, isNew } = info.row.original;
      return (
        <div className="flex flex-col gap-0.5 min-w-0 max-w-[420px]">
          <span className="truncate font-medium text-[#19363F]" title={info.getValue()}>
            {info.getValue()}
          </span>
          <span
            className="truncate font-mono text-[10px] text-[rgba(25,54,63,0.4)]"
            title={culprit}
          >
            {shortId ? `${shortId} · ` : ""}
            {culprit || "sin culprit"}
            {isNew && <span className="text-amber-700"> · nuevo</span>}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "events24h",
    header: "24 h",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue() ?? 0;
      return (
        <span
          className={cn(
            "font-medium tabular-nums",
            value > 0 ? "text-red-600" : "text-[rgba(25,54,63,0.3)]"
          )}
        >
          {formatNumber(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "count",
    header: "Total",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.6)]">
        {formatNumber(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "userCount",
    header: "Usuarios",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.6)]">
        {formatNumber(info.getValue())}
      </span>
    ),
  },
  {
    accessorKey: "lastSeen",
    header: "Última vez",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.5)]">
        {info.getValue() ? timeAgo(info.getValue()) : "—"}
      </span>
    ),
  },
  {
    id: "permalink",
    header: "",
    enableSorting: false,
    cell: (info) => {
      const url = info.row.original.permalink;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-inter text-[10px] font-medium text-[rgba(25,54,63,0.5)] hover:text-[#19363F] transition-colors whitespace-nowrap"
        >
          Abrir ↗
        </a>
      );
    },
  },
];

/**
 * Explains a 200 that carries no report.
 *
 * `/system/sentry` reports its own failures in the body rather than in the status
 * code, so a missing token and a Sentry outage both arrive as a successful request
 * with an empty issue list. Rendering that as «sin errores» would be the most
 * misleading thing this panel could do.
 */
const SentryUnavailable = ({ data }) => (
  <div className="flex flex-col gap-1 rounded-lg border-[0.7px] border-dashed border-amber-200 bg-amber-50/50 px-3 py-2.5">
    <span className="font-inter text-[11px] font-medium tracking-[-0.44px] text-amber-800">
      {data?.configured === false
        ? "Sentry no está configurado en el backend."
        : "Sentry no respondió."}
    </span>
    <span className="font-inter text-[10px] leading-[1.6] tracking-[-0.4px] text-amber-700/80">
      {data?.configured === false
        ? "Falta el token de Sentry en admin.hyxora.com, así que no hay informe que pedir. Esto no es «no hay errores»: es que no se ha mirado."
        : (data?.error ?? "La API de Sentry devolvió un error. No hay informe que mostrar.")}
    </span>
  </div>
);

/**
 * Errores de la app (Sentry).
 *
 * Was a `PendingEndpoint` for a reason that has now gone away: reading issues back
 * needs a Sentry auth token, and a token cannot live in the browser — the
 * `@sentry/react` the landing already depends on is the reporting SDK and cannot
 * query. Somebody had to resolve it server-side, and the backend took it, so this
 * reads Cerebro rather than another `/api/monitoring/*` route of ours.
 *
 * Two states worth keeping apart, because the endpoint answers 200 to both: no token
 * upstream (`configured: false`) and Sentry itself refusing (`ok: false`). Neither is
 * «sin errores», and this panel never says that unless Sentry actually said it.
 */
const SentryPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSentryReport();

  const issues = useMemo(() => data?.issues ?? [], [data]);
  const available = Boolean(data?.configured && data?.ok);
  const noisy = (data?.events24h ?? 0) > 0;

  return (
    <Panel
      title="Errores de la app (Sentry)"
      meta={data?.project ? `${data.org ? `${data.org}/` : ""}${data.project}` : undefined}
      description="Issues sin resolver reportados por la app (React Native / web). El backend no reporta a Sentry, así que aquí no aparecen sus fallos."
      tone={available && noisy ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {available ? (
          <>
            <div className="flex flex-wrap gap-2">
              <StatCard
                value={<AnimatedCount value={data?.unresolvedCount} />}
                label="Sin resolver"
                tone={data?.unresolvedCount > 0 ? "warning" : "good"}
                hint={data?.atLimit ? "Tope de la API — hay más" : "Issues abiertos"}
              />
              <StatCard
                value={<AnimatedCount value={data?.events24h} />}
                label="Eventos (24 h)"
                tone={noisy ? "warning" : "good"}
                hint="Veces que han saltado"
              />
              <StatCard
                value={<AnimatedCount value={data?.newIssues24h} />}
                label="Nuevos (24 h)"
                tone={data?.newIssues24h > 0 ? "warning" : "muted"}
                hint="Errores que no existían ayer"
              />
              <StatCard
                value={<AnimatedCount value={data?.usersAffected} />}
                label="Usuarios afectados"
                tone={data?.usersAffected > 0 ? "warning" : "muted"}
                hint="Personas que se toparon con alguno"
              />
            </div>

            <div className="mt-3">
              <DataTable
                data={issues}
                columns={columns}
                filename="cerebro-sentry"
                searchPlaceholder="Buscar por mensaje o culprit..."
                emptyLabel="Sentry no devolvió ningún issue sin resolver."
                initialSorting={[{ id: "events24h", desc: true }]}
                enablePagination={issues.length > 25}
                pageSize={25}
                bare
                dense
                maxHeight={460}
              />
            </div>

            {data?.atLimit && (
              <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700 mt-2">
                El recuento de sin resolver llegó al tope que devuelve la API de Sentry, así que hay
                más de {formatNumber(data.unresolvedCount)} — trátalo como un mínimo.
              </p>
            )}
          </>
        ) : (
          <SentryUnavailable data={data} />
        )}
      </QueryState>
    </Panel>
  );
};

export default SentryPanel;
