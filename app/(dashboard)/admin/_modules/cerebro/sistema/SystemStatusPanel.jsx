"use client";

import DataTable from "@/components/DataTable";
import { cerebroChainLabel, cerebroColdCursorChainIds } from "@/constants/cerebro";
import { useGetSystemHealth } from "@/hooks/cerebro/useGetSystemHealth";
import { cn } from "@/utils";
import { formatNumber, hoursSince, timeAgo } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

/**
 * Hours a cursor may sit still before it counts as stuck, per indexer kind —
 * ported from `staleThresholdMin()` in `hyxora-admin-main/src/components/
 * SystemHealthCard.tsx`.
 *
 * The three financial indexers run every 15min–4h but are only flagged after a
 * full day, matching the product rule «stale = older than 24h»; a few hours of lag
 * is «al día», not stale. Everything else is a daily cron and gets 48h so one
 * missed day doesn't raise an alarm. A single flat threshold is what the panel had
 * before, and it both cried wolf at the daily syncs and stayed quiet about a
 * treasury cursor that had been stuck since the morning.
 */
const STALE_HOURS_BY_KIND = {
  treasury: 24,
  "userops-etherscan": 24,
  "userops-safe": 24,
};
const DEFAULT_STALE_HOURS = 48;

const staleThresholdHours = (kind) => STALE_HOURS_BY_KIND[kind] ?? DEFAULT_STALE_HOURS;

/**
 * The cursor list, wherever `/system/health` puts it.
 *
 * `admin.md` documents `{ system: { indexers: [...] } }`, and reading only that is
 * what left this table at «0 filas» against the live API. Same disagreement the doc
 * already has on `/holdings` (documented `chainId`, sends `chain`) and on
 * `/fees/diagnostics`, so this reads every plausible spelling rather than trusting
 * one — see `ingresos/FeeTaggingPanel`'s `toTagRow()`.
 */
const readCursorList = (data) => {
  const candidates = [
    data?.system?.indexers,
    data?.system?.cursors,
    data?.system?.indexerState,
    data?.indexers,
    data?.cursors,
    data?.indexerState,
    data?.indexer_state,
  ];
  return candidates.find(Array.isArray) ?? [];
};

/**
 * One indexer cursor, normalised. The row-level feeds Cerebro passes straight
 * through from the indexer tables are snake_cased (`/costs/recent` says so out
 * loud), so accept both casings of every field.
 *
 * `chainId` is `0` on the cross-chain indexers — fx-rates, hyxora-activity,
 * hyxora-ramp, sync-users, snapshot — which belong to no single network. The old
 * dashboard labels those «Cross-chain»; here they read «Multicadena». Solana's
 * legs arrive under the `SOLANA_CHAIN_ID` sentinel and resolve through
 * `cerebroChainLabel()` like any other id.
 */
const toCursorRow = (row = {}) => {
  const rawChainId = row.chainId ?? row.chain_id ?? row.chain ?? null;
  const kind = row.kind ?? row.type ?? row.indexer ?? "—";
  const updatedAt = row.updatedAt ?? row.updated_at ?? row.lastUpdated ?? row.last_updated ?? null;
  const lastBlock = row.lastBlock ?? row.last_block ?? null;

  const isCrossChain =
    rawChainId === null ||
    rawChainId === undefined ||
    rawChainId === "" ||
    Number(rawChainId) === 0;

  return {
    kind,
    updatedAt,
    lastBlock,
    chainName: isCrossChain ? "Multicadena" : cerebroChainLabel({ chainId: rawChainId }),
    // Frozen by design — Hyxora stopped routing through these, so the cursor is
    // correct at "never advancing again" and must not paint the panel red.
    isCold: !isCrossChain && cerebroColdCursorChainIds.has(Number(rawChainId)),
    hoursStale: hoursSince(updatedAt) ?? 0,
  };
};

const WarningIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M8 1.5 15 14H1L8 1.5z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
  </svg>
);

const SystemStatusPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetSystemHealth();

  const rows = useMemo(() => readCursorList(data).map(toCursorRow), [data]);

  const staleCount = rows.filter(
    (row) => !row.isCold && row.hoursStale > staleThresholdHours(row.kind)
  ).length;

  const columns = useMemo(
    () => [
      {
        accessorKey: "chainName",
        header: "Cadena",
        cell: ({ row }) => (
          <span
            className={cn(row.original.isCold ? "text-[rgba(25,54,63,0.4)]" : "text-[#19363F]")}
          >
            {row.original.chainName}
            {row.original.isCold && (
              <span className="ml-1.5 text-[10px] text-[rgba(25,54,63,0.35)]">(inactiva)</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "kind",
        header: "Tipo",
        cell: (info) => (
          <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.6)]">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "lastBlock",
        header: "Último bloque",
        meta: { align: "right" },
        cell: (info) => (
          <span className="tabular-nums text-[rgba(25,54,63,0.6)]">
            {info.getValue() === null ? "—" : formatNumber(info.getValue())}
          </span>
        ),
      },
      {
        // Sorts on hours-stale so "hace 3d" orders correctly against "hace 15h".
        accessorKey: "hoursStale",
        header: "Actualizado",
        meta: { align: "right", label: "Actualizado" },
        cell: ({ row }) => {
          const isStale =
            !row.original.isCold &&
            row.original.hoursStale > staleThresholdHours(row.original.kind);
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 tabular-nums",
                isStale ? "text-red-600 font-medium" : "text-[rgba(25,54,63,0.5)]"
              )}
            >
              {timeAgo(row.original.updatedAt)}
              {isStale && <WarningIcon />}
            </span>
          );
        },
      },
    ],
    []
  );

  // The backend cache arrives either as the documented boolean or as the object the
  // old dashboard renders (`{ ok, totalKeys, ... }`). Prefer the key count when it
  // is there — "0 claves" is a far more useful answer than "OK".
  const backendCache = data?.system?.backendCache ?? data?.backendCache ?? null;
  const backendCacheOk =
    backendCache && typeof backendCache === "object"
      ? backendCache.ok !== false
      : (data?.system?.backendCacheOk ?? data?.backendCacheOk ?? null);
  const backendCacheKeys =
    backendCache && typeof backendCache === "object" ? backendCache.totalKeys : undefined;

  const backendCacheLabel = (() => {
    if (backendCacheOk === null || backendCacheOk === undefined) return "—";
    if (!backendCacheOk) return "Con errores";
    if (typeof backendCacheKeys === "number") return `${formatNumber(backendCacheKeys)} claves`;
    return "OK";
  })();

  const latest = data?.data ?? data?.latest ?? {};

  // A 200 with no cursor list is indistinguishable from "no indexers configured"
  // unless the panel says what it did get, and this is the tab where that belongs.
  const responseKeys =
    data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data) : [];
  const emptyLabel =
    responseKeys.length > 0
      ? `El endpoint respondió sin cursores de indexador. Claves recibidas: ${responseKeys.join(", ")}.`
      : "El endpoint no devolvió cursores de indexador.";

  return (
    <Panel
      title="Estado del sistema"
      description="Cursores de los indexers y estado de la caché del backend. Un cursor parado significa que las cifras de las demás pestañas se quedan cortas hasta que se recupere. Las cadenas inactivas se muestran en gris: sus cursores están congelados a propósito."
      tone={staleCount > 0 ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState isLoading={isLoading} error={error}>
        {staleCount > 0 && (
          <p className="font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600 mb-2.5">
            {staleCount} {staleCount === 1 ? "cursor parado" : "cursores parados"} — las cifras de
            otras pestañas pueden contar de menos mientras persista.
          </p>
        )}

        <DataTable
          data={rows}
          columns={columns}
          filename="cerebro-indexers"
          searchPlaceholder="Buscar cadena o tipo..."
          initialSorting={[{ id: "hoursStale", desc: true }]}
          enableSelection={false}
          bare
          dense
          maxHeight={340}
          emptyLabel={emptyLabel}
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 pt-3 border-t-[0.7px] border-[rgba(25,54,63,0.06)]">
          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Caché del backend
            </span>
            <span
              className={cn(
                "font-inter text-[10px] font-medium tabular-nums tracking-[-0.4px]",
                backendCacheOk === null || backendCacheOk === undefined
                  ? "text-[rgba(25,54,63,0.35)]"
                  : backendCacheOk
                    ? "text-emerald-700"
                    : "text-red-600"
              )}
            >
              {backendCacheLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Última fee de tesorería
            </span>
            <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.65)]">
              {timeAgo(latest.latestTreasuryFee ?? latest.latest_treasury_fee)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
              Última operación de usuario
            </span>
            <span className="font-inter text-[10px] tabular-nums text-[rgba(25,54,63,0.65)]">
              {timeAgo(latest.latestUserOp ?? latest.latest_user_op)}
            </span>
          </div>
        </div>
      </QueryState>
    </Panel>
  );
};

export default SystemStatusPanel;
