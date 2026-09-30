"use client";

import CopyButton from "@/components/CopyButton";
import { useSecondsUntil } from "@/hooks/gateway/useSecondsUntil";
import { cn } from "@/utils";
import { formatResetClock, formatSeconds, formatWindow } from "@/utils/rateLimit";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// ── Row ────────────────────────────────────────────────────────────────────────

const Row = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <span className="font-inter text-[10px] font-medium uppercase tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
      {label}
    </span>
    <div className="font-inter text-[12px] tracking-[-0.48px] text-[#19363F]">{children}</div>
    {hint && (
      <span className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
        {hint}
      </span>
    )}
  </div>
);

// ── RateLimitDetailSidebar ────────────────────────────────────────────────────

/**
 * Everything the gateway knows about one throttled client, and the way to clear
 * it.
 *
 * The reset itself is not fired here — `onReset` hands it back to the module,
 * which owns the confirmation modal. Clearing someone's counter is the kind of
 * action that should cost a second click, and a dialog anchored to a 320px
 * drawer is not one anybody reads.
 *
 * @param {Object} props
 * @param {import("@/hooks/gateway/types").RateLimitClient} props.client
 * @param {number} [props.limit] Requests per window, from the list response.
 * @param {number} [props.windowMs] Window length, from the list response.
 * @param {() => void} props.onReset
 * @param {() => void} props.onClose
 * @param {boolean} [props.isResetting]
 */
const RateLimitDetailSidebar = ({
  client,
  limit,
  windowMs,
  onReset,
  onClose,
  isResetting = false,
}) => {
  const panelRef = useRef(null);
  const remaining = useSecondsUntil(client?.resetAt);

  // The parent wrapper animates the width — just fade the content in once the
  // panel is partly open.
  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" }
      );
    },
    { scope: panelRef }
  );

  if (!client) return null;

  const isEmailKeyed = client.limitedBy === "email";
  const effectiveLimit = Number.isFinite(client.limit) ? client.limit : limit;
  const isOverLimit = Number.isFinite(effectiveLimit) && client.used >= effectiveLimit;
  const share =
    Number.isFinite(effectiveLimit) && effectiveLimit > 0
      ? Math.min(100, (client.used / effectiveLimit) * 100)
      : 0;
  const clock = formatResetClock(client.resetAt);

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] break-all">
            {client.target}
          </p>
          <span
            className={cn(
              "inline-flex w-fit items-center px-1.5 py-0.5 rounded-[5px] border font-inter text-[9px] font-medium uppercase tracking-[0.4px]",
              isEmailKeyed
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-[rgba(25,54,63,0.05)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]"
            )}
          >
            {isEmailKeyed ? "por usuario" : "por IP"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors mt-0.5"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <title>Cerrar</title>
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        <div className="flex flex-col gap-4 p-4">
          <Row
            label="Consumo"
            hint={`Ventana de ${formatWindow(windowMs)}. Al llegar al tope, la siguiente petición recibe un 429.`}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold tabular-nums">
                {client.used}
                <span className="font-normal text-[rgba(25,54,63,0.45)]">
                  {" / "}
                  {effectiveLimit ?? "—"}
                </span>
              </span>
              <div className="h-1.5 w-full rounded-full bg-[rgba(25,54,63,0.06)] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300",
                    isOverLimit ? "bg-red-500" : "bg-[#19363F]"
                  )}
                  style={{ width: `${share}%` }}
                />
              </div>
            </div>
          </Row>

          <Row
            label="Referencia"
            hint={
              client.id
                ? "Es el código que el usuario ve en su pantalla de error. No dice nada sobre quién es."
                : "Aún sin referencia: está gastando cuota pero todavía no ha recibido ningún 429 en esta ventana."
            }
          >
            {client.id ? (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] tracking-tight text-[rgba(25,54,63,0.75)] break-all">
                  {client.id}
                </span>
                <CopyButton text={client.id} />
              </div>
            ) : (
              <span className="text-[rgba(25,54,63,0.35)]">—</span>
            )}
          </Row>

          <Row
            label="Se reinicia"
            hint={
              clock
                ? `A las ${clock}. Los contadores viven en memoria: al reiniciarse la ventana se borran solos, junto con la referencia.`
                : undefined
            }
          >
            <span className="tabular-nums">{formatSeconds(remaining)}</span>
          </Row>

          <div className="h-px bg-[rgba(25,54,63,0.07)]" />

          {/* Which selector the reset will use, and why. It is the difference
              between a reset that survives a stale id and one that 404s. */}
          <p className="font-inter text-[11px] leading-[1.6] tracking-[-0.44px] text-[rgba(25,54,63,0.5)]">
            {isEmailKeyed ? (
              <>
                Se enviará el <strong className="font-medium text-[#19363F]">email</strong>, que es
                la propia clave del contador: funciona aunque el usuario no tenga sesión abierta y
                aunque su referencia ya haya caducado.
              </>
            ) : (
              <>
                Se enviará la <strong className="font-medium text-[#19363F]">IP</strong>. El tráfico
                anónimo se agrupa por IP, así que esto puede liberar a más de una persona detrás del
                mismo NAT.
              </>
            )}
          </p>

          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors"
          >
            {isResetting ? "Quitando…" : "Quitar el límite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateLimitDetailSidebar;
