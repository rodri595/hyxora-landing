"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import Field from "@/components/Field";
import RateLimitDetailSidebar from "@/components/RateLimitDetailSidebar";
import RateLimitResetModal from "@/components/RateLimitResetModal";
import Spinner from "@/components/Spinner";
import { useGetRateLimits } from "@/hooks/gateway/useGetRateLimits";
import { useResetAllRateLimits } from "@/hooks/gateway/useResetAllRateLimits";
import { useResetRateLimit } from "@/hooks/gateway/useResetRateLimit";
import { useSecondsUntil } from "@/hooks/gateway/useSecondsUntil";
import { cn } from "@/utils";
import { formatSeconds, formatWindow } from "@/utils/rateLimit";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A reference always looks like this. Checked only to decide which selector to
// send when an admin pastes something into the manual box — the gateway is the
// one that decides whether the value is real.
const REFERENCE_PATTERN = /^rl_[0-9a-f]+$/i;

/**
 * Which of the API's three selectors a free-text value should be sent as.
 *
 * The manual box exists for the case the table cannot cover: a user quoting the
 * `rateLimitId` from their error screen after the window rolled over, so there
 * is no row to click. Email is the robust path and reference the
 * privacy-preserving one, so accept either and pick by shape.
 */
const selectorFor = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (REFERENCE_PATTERN.test(trimmed)) return { key: "id", value: trimmed };
  if (trimmed.includes("@")) return { key: "email", value: trimmed };
  return { key: "ip", value: trimmed };
};

// ── ResetCountdown ────────────────────────────────────────────────────────────

/**
 * The "se reinicia en" cell.
 *
 * Its own component so the 1 s tick re-renders one cell instead of the whole
 * table — a ticker in the module would rebuild the column definitions every
 * second and make TanStack recompute the row model with them.
 */
const ResetCountdown = ({ resetAt }) => {
  const remaining = useSecondsUntil(resetAt);
  return (
    <span
      className={cn(
        "font-inter text-[11px] tabular-nums tracking-[-0.44px]",
        remaining === 0 ? "text-[rgba(25,54,63,0.35)]" : "text-[rgba(25,54,63,0.6)]"
      )}
    >
      {formatSeconds(remaining)}
    </span>
  );
};

// ── RefreshControl ────────────────────────────────────────────────────────────

const RefreshGlyph = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <title>Actualizar</title>
    <path
      d="M14 8a6 6 0 1 1-1.76-4.24M14 2v4h-4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Manual refresh, with the glyph turning for as long as the request is in
 * flight.
 *
 * The spin is one continuous linear rotation while fetching and a decelerating
 * tween into the *next whole turn* when it stops — never a hard stop at whatever
 * angle the response happened to land on. A poll that returns in 80 ms therefore
 * still reads as a complete gesture rather than a twitch, which is the whole
 * difference between "it's working" and "did I click that?".
 */
const RefreshControl = ({ onClick, isFetching }) => {
  const glyphRef = useRef(null);
  const spinRef = useRef(null);

  useGSAP(
    () => {
      const glyph = glyphRef.current;
      if (!glyph || prefersReducedMotion()) return;

      if (isFetching) {
        spinRef.current?.kill();
        spinRef.current = gsap.to(glyph, {
          rotation: "+=360",
          duration: 0.85,
          ease: "none",
          repeat: -1,
        });
        return;
      }

      if (!spinRef.current) return;
      spinRef.current.kill();
      spinRef.current = null;
      const current = Number(gsap.getProperty(glyph, "rotation")) || 0;
      gsap.to(glyph, {
        rotation: Math.ceil(current / 360) * 360,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { dependencies: [isFetching] }
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isFetching}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] px-2.5 py-1.5 font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F] transition-[background-color,transform] duration-150 hover:bg-[rgba(25,54,63,0.04)] active:scale-[0.97] disabled:text-[rgba(25,54,63,0.45)]"
    >
      <span ref={glyphRef} className="flex items-center justify-center">
        <RefreshGlyph />
      </span>
      {isFetching ? "Actualizando…" : "Actualizar"}
    </button>
  );
};

// ── RefetchSweep ──────────────────────────────────────────────────────────────

/**
 * The hairline that travels across while a fetch is open.
 *
 * Indeterminate, because the request has no measurable progress and a bar that
 * pretends otherwise is a lie. It eases at both ends (`power1.inOut`) instead of
 * sliding at a constant speed — a linear sweep reads mechanical, an eased one
 * reads like something is being carried across.
 */
const RefetchSweep = ({ active }) => {
  const trackRef = useRef(null);
  const barRef = useRef(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const bar = barRef.current;
      if (!track || !bar) return;

      if (prefersReducedMotion()) {
        gsap.set(track, { autoAlpha: active ? 1 : 0 });
        return;
      }

      gsap.to(track, {
        autoAlpha: active ? 1 : 0,
        duration: active ? 0.16 : 0.32,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (!active) {
        gsap.killTweensOf(bar);
        return;
      }

      // xPercent is relative to the bar's own width (30% of the track), so 340
      // is the first offset that clears the right edge completely.
      gsap.fromTo(
        bar,
        { xPercent: -120 },
        { xPercent: 340, duration: 1.1, ease: "power1.inOut", repeat: -1 }
      );
    },
    { dependencies: [active] }
  );

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      style={{ opacity: 0, visibility: "hidden" }}
      className="h-[2px] w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]"
    >
      <div ref={barRef} className="h-full w-[30%] rounded-full bg-[#19363F]/45" />
    </div>
  );
};

// ── PolicyBar ─────────────────────────────────────────────────────────────────

const PolicyBar = ({ limit, windowMs, count }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <p className="font-inter text-[11px] leading-[1.6] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
      {Number.isFinite(limit) && Number.isFinite(windowMs) ? (
        <>
          <strong className="font-medium text-[#19363F]">{limit}</strong> peticiones cada{" "}
          <strong className="font-medium text-[#19363F]">{formatWindow(windowMs)}</strong>. Un
          usuario con sesión gasta su propia cuota (contada por email); el tráfico anónimo se agrupa
          por IP.
        </>
      ) : (
        "El gateway limita las peticiones por ventana. Un usuario con sesión gasta su propia cuota; el tráfico anónimo se agrupa por IP."
      )}
    </p>
    <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
      {count ?? 0} con cuota en uso · se actualiza solo cada 15 s
    </span>
  </div>
);

// ── RateLimitsModule ──────────────────────────────────────────────────────────

/**
 * Who the gateway is currently throttling, and how to unthrottle one of them.
 *
 * The support path this is built for: a user hits a 429, their error screen
 * shows an opaque `rl_…` reference, they send it in. An admin finds the row (or
 * pastes the reference into the manual box when the window has already rolled
 * and the row is gone), checks what it belongs to in the drawer, and clears it.
 *
 * Two things shape the layout. The list is a snapshot of in-memory counters that
 * expire every window, so it polls rather than caching and the header says what
 * the policy is rather than assuming 100/60s. And the manual box sits **outside**
 * the query's loading/error branch on purpose: a reference that no longer
 * resolves is exactly when the list is least useful and the reset most needed,
 * so a failing `/rate-limits` must not take the reset form down with it.
 */
const RateLimitsModule = () => {
  const { data, isLoading, isFetching, error, refetch } = useGetRateLimits();
  const resetOne = useResetRateLimit();
  const resetAll = useResetAllRateLimits();

  const clients = useMemo(() => data?.clients ?? [], [data]);
  const [manualValue, setManualValue] = useState("");

  // `isOpen` drives the animation; `displayedClient` survives the close so the
  // drawer doesn't empty mid-collapse.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedClient, setDisplayedClient] = useState(null);

  // The pending confirmation: null when the modal is closed.
  const [request, setRequest] = useState(null);

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const clearDisplayed = useCallback(() => setDisplayedClient(null), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const onSelectClient = useCallback((client) => {
    setDisplayedClient(client);
    setIsOpen(true);
  }, []);

  // The open row, re-read from the latest poll. `displayedClient` is only the
  // identity of what was clicked — reading the numbers off it would freeze the
  // drawer at whatever the counter said when it was opened, while the same row
  // in the table behind it kept climbing. Falls back to the clicked snapshot so
  // the drawer still has content during its close animation.
  const liveClient = useMemo(() => {
    if (!displayedClient) return null;
    return (
      clients.find(
        (client) =>
          client.limitedBy === displayedClient.limitedBy && client.target === displayedClient.target
      ) ?? displayedClient
    );
  }, [clients, displayedClient]);

  // A window that expires — or a counter we just cleared — drops its row from
  // the next poll, and a drawer describing a limit that no longer exists is
  // worse than no drawer: its countdown sits at "ya reabierta" and its reset
  // button offers to clear something that is already gone. Close it.
  //
  // Gated on `data` rather than on `clients`: an error response leaves `clients`
  // empty, and a failed poll is not evidence that the row went away.
  useEffect(() => {
    if (!isOpen || !displayedClient || !data) return;
    const stillListed = clients.some(
      (client) =>
        client.limitedBy === displayedClient.limitedBy && client.target === displayedClient.target
    );
    if (!stillListed) setIsOpen(false);
  }, [isOpen, displayedClient, data, clients]);

  // ── Confirmation flow ───────────────────────────────────────────────────────

  const openConfirm = useCallback(
    (next) => {
      resetOne.reset();
      resetAll.reset();
      setRequest(next);
    },
    [resetOne, resetAll]
  );

  // A row carries both a target and an id, and the API 400s on two selectors.
  // Send the target: it is the counter's own key, so it works even if the id has
  // already expired between the poll and the click.
  const confirmForClient = useCallback(
    (client) =>
      openConfirm({
        scope: "one",
        selectorKey: client.limitedBy === "email" ? "email" : "ip",
        selectorValue: client.target,
      }),
    [openConfirm]
  );

  const handleConfirm = useCallback(() => {
    if (!request) return;
    if (request.scope === "all") {
      resetAll.mutate();
      return;
    }
    resetOne.mutate({ [request.selectorKey]: request.selectorValue });
  }, [request, resetOne, resetAll]);

  const closeConfirm = useCallback(() => {
    // Clear the manual box only once its reset actually landed, so a 404 on a
    // stale reference leaves the value there to be corrected rather than retyped.
    if (request?.scope === "one" && request.origin === "manual" && resetOne.isSuccess) {
      setManualValue("");
    }
    // A cleared counter is a row that is about to vanish from the refetch, and
    // its drawer is showing numbers that no longer exist. Close it rather than
    // leave a snapshot of a limit somebody just removed.
    if (resetOne.isSuccess || resetAll.isSuccess) setIsOpen(false);
    setRequest(null);
    resetOne.reset();
    resetAll.reset();
  }, [request, resetOne, resetAll]);

  const manualSelector = selectorFor(manualValue);

  const handleManualSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (!manualSelector) return;
      openConfirm({
        scope: "one",
        selectorKey: manualSelector.key,
        selectorValue: manualSelector.value,
        origin: "manual",
      });
    },
    [manualSelector, openConfirm]
  );

  // ── Settle on new numbers ───────────────────────────────────────────────────

  // Keyed on what the rows actually say, not on `dataUpdatedAt`: the poll marks
  // the data fresh every 15 s whether or not anything moved, and a table that
  // fades once a minute for no reason is a table you learn to ignore. The
  // movement is deliberately small — a 4px lift and a partial fade, not a
  // rebuild — so it registers peripherally without pulling the eye off a number
  // being read.
  const fingerprint = useMemo(
    () => clients.map((client) => `${client.limitedBy}:${client.target}:${client.used}`).join("|"),
    [clients]
  );
  const tableWrapRef = useRef(null);

  useGSAP(
    () => {
      const el = tableWrapRef.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { opacity: 0.55, y: 4 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", overwrite: "auto" }
      );
    },
    { dependencies: [fingerprint] }
  );

  // ── Sidebar animation — desktop (lg+): the wrapper's width ──────────────────

  useGSAP(
    () => {
      const el = desktopWrapRef.current;
      if (!el) return;
      if (isOpen) {
        gsap.to(el, {
          width: SIDEBAR_WIDTH,
          marginLeft: 16,
          duration: 0.38,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(el, {
          width: 0,
          marginLeft: 0,
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: clearDisplayed,
        });
      }
    },
    { dependencies: [isOpen] }
  );

  // ── Sidebar animation — mobile/tablet (<lg): overlay + backdrop ─────────────

  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, { x: "0%", duration: 0.35, ease: "power3.out", overwrite: true });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(panel, {
          x: "100%",
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: clearDisplayed,
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        accessorKey: "target",
        header: "Usuario / IP",
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F] truncate">
                {value}
              </span>
              <CopyButton text={value} />
            </div>
          );
        },
      },
      {
        accessorKey: "limitedBy",
        header: "Contado por",
        size: 96,
        cell: (info) => {
          const value = info.getValue();
          const isEmail = value === "email";
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] border font-inter text-[10px] font-medium tracking-[-0.3px]",
                isEmail
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]"
              )}
            >
              {isEmail ? "Usuario" : "IP"}
            </span>
          );
        },
      },
      {
        accessorKey: "used",
        header: "Consumo",
        size: 96,
        meta: { align: "right" },
        cell: (info) => {
          const used = info.getValue();
          const limit = info.row.original.limit ?? data?.limit;
          // At or over the limit is the row that is actually being throttled —
          // everything else is just someone using the API.
          const isOver = Number.isFinite(limit) && used >= limit;
          return (
            <span
              className={cn(
                "font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px]",
                isOver ? "text-red-600" : "text-[#19363F]"
              )}
            >
              {used}
              <span className="font-normal text-[rgba(25,54,63,0.35)]">
                {" / "}
                {limit ?? "—"}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "id",
        header: "Referencia",
        size: 176,
        cell: (info) => {
          const value = info.getValue();
          // Null means this client is spending quota but has not been handed a
          // reference yet — it has not tripped the limit this window.
          if (!value)
            return (
              <span
                className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.3)]"
                title="Todavía sin 429 en esta ventana"
              >
                —
              </span>
            );
          return (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.65)] truncate">
                {value}
              </span>
              <CopyButton text={value} />
            </div>
          );
        },
      },
      {
        accessorKey: "resetAt",
        header: "Se reinicia",
        size: 104,
        cell: (info) => <ResetCountdown resetAt={info.getValue()} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        size: 44,
        cell: ({ row }) => (
          <button
            type="button"
            aria-label={`Ver detalle de ${row.original.target}`}
            onClick={() => onSelectClient(row.original)}
            className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <title>Ver detalle</title>
              <path
                d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        ),
      },
    ],
    [onSelectClient, data?.limit]
  );

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 overflow-hidden py-2.5 sm:rounded-xl sm:border-[0.7px] sm:border-[rgba(25,54,63,0.08)] sm:px-4 sm:py-3 sm:shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
        <div className="flex flex-col gap-3 shrink-0 mb-3">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <PolicyBar limit={data?.limit} windowMs={data?.windowMs} count={data?.count} />
              <RefreshControl onClick={() => refetch()} isFetching={isFetching} />
            </div>
            {/* Under the header rather than over the table: it belongs to the
                act of refreshing, and a bar that sat on the table's edge would
                read as the table loading its first rows. */}
            <RefetchSweep active={isFetching} />
          </div>

          {/* Manual reset. Elastic, never a fixed width — a header control at a
              fixed size beside a button is wider than a phone. */}
          <form
            onSubmit={handleManualSubmit}
            className="flex flex-col gap-2 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)] px-3 py-2.5 sm:flex-row sm:items-center"
          >
            <label
              htmlFor="rate-limit-manual"
              className="font-inter text-[11px] font-medium tracking-[-0.44px] text-[rgba(25,54,63,0.55)] sm:shrink-0"
            >
              Resetear por referencia o email
            </label>
            <Field
              id="rate-limit-manual"
              className="min-w-0 flex-1"
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
              placeholder="rl_4fb9880074adb4f7  ·  usuario@ejemplo.com"
              autoComplete="off"
              validated={Boolean(manualValue)}
              icon="close-small"
              iconFill="rgba(25,54,63,0.4)"
              iconHandler={() => setManualValue("")}
              iconClassName="size-[16px] cursor-pointer hover:opacity-60 transition-opacity"
            />
            <button
              type="submit"
              disabled={!manualSelector}
              className="h-8 px-3 shrink-0 rounded-lg bg-[#19363F] text-white font-inter text-[11px] font-medium tracking-[-0.44px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors"
            >
              Quitar límite
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 flex-1 px-4 text-center">
            <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.6)]">
              {error?.response?.status ? `${error.response.status} — ` : ""}
              {error.message}
            </p>
            <p className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-[rgba(25,54,63,0.4)] max-w-[420px]">
              {error?.response?.status === 403
                ? "Tu sesión es válida pero tu ID de Privy no está en ADMIN_ALLOWLIST_PRIVY_IDS del gateway."
                : "El listado no cargó. El formulario de arriba sigue funcionando: resetea por email o por referencia."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 h-8 px-3 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.12)] font-inter text-[11px] font-medium tracking-[-0.44px] text-[#19363F] hover:bg-[rgba(25,54,63,0.04)] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div ref={tableWrapRef} className="flex flex-1 min-h-0 flex-col">
            <DataTable
              data={clients}
              columns={columns}
              filename="rate-limits"
              title="Clientes con cuota en uso"
              searchPlaceholder="Buscar por email, IP o referencia..."
              initialSorting={[{ id: "used", desc: true }]}
              emptyLabel="Nadie está consumiendo cuota ahora mismo."
              // `id` is null for anyone who has not been throttled yet, so it
              // cannot key a row. The counter's own key can.
              getRowId={(row) => `${row.limitedBy}:${row.target}`}
              toolbarExtra={
                <button
                  type="button"
                  onClick={() => openConfirm({ scope: "all" })}
                  disabled={!clients.length}
                  className="h-[30px] px-2.5 shrink-0 rounded-lg border-[0.7px] border-red-200 bg-red-50 font-inter text-[11px] font-medium tracking-[-0.44px] text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Resetear todo
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* ── Desktop (lg+): inline wrapper — GSAP animates its width ── */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {liveClient && (
          <RateLimitDetailSidebar
            key={`${liveClient.limitedBy}:${liveClient.target}`}
            client={liveClient}
            limit={data?.limit}
            windowMs={data?.windowMs}
            isResetting={resetOne.isPending}
            onReset={() => confirmForClient(liveClient)}
            onClose={handleClose}
          />
        )}
      </div>

      {/* ── Mobile/tablet (<lg): backdrop ── */}
      <div
        ref={backdropRef}
        className="lg:hidden fixed inset-0 z-40 bg-black/30"
        style={{ opacity: 0, pointerEvents: "none" }}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
        onClick={handleClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") handleClose();
        }}
      />

      {/* ── Mobile/tablet (<lg): overlay panel — GSAP animates translateX ── */}
      <div
        ref={mobileWrapRef}
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(320px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {liveClient && (
          <RateLimitDetailSidebar
            key={`${liveClient.limitedBy}:${liveClient.target}`}
            client={liveClient}
            limit={data?.limit}
            windowMs={data?.windowMs}
            isResetting={resetOne.isPending}
            onReset={() => confirmForClient(liveClient)}
            onClose={handleClose}
          />
        )}
      </div>

      <RateLimitResetModal
        open={Boolean(request)}
        onClose={closeConfirm}
        request={request}
        onConfirm={handleConfirm}
        isPending={resetOne.isPending || resetAll.isPending}
        error={resetOne.error ?? resetAll.error}
        result={resetOne.data ?? resetAll.data}
      />
    </div>
  );
};

export default RateLimitsModule;
