"use client";

import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Spinner from "@/components/Spinner";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

const SUPPORT_EMAIL = "future@hyxora.com";

// Above this the wait stops being something you sit through, so the button
// unlocks and says what it costs instead of staying dead for twenty hours. Our
// stored deadline is only ever our reading of the ban — if it is too long, or
// the gateway lifted it early, this is the way back in.
const LONG_WAIT_SECONDS = 3600;

// One entry per failure `useSessionSync` can report. Anything not in here —
// "anonymous", "pending", a status added later — falls through to the spinner,
// which is the safe default: a state we have no copy for is not an error yet.
const FAILURES = {
  unavailable: {
    icon: "refresh",
    title: "No pudimos conectar con el servidor",
    body: "Tu sesión sigue abierta, pero el servidor de Hyxora no respondió. Suele resolverse en unos segundos.",
  },
  "rate-limited": {
    icon: "clock",
    iconSize: 20,
    title: "Acceso bloqueado temporalmente",
    body: "El servidor ha bloqueado los intentos de acceso tras varios fallos seguidos. Es temporal y se levanta solo: no hay nada que arreglar en tu cuenta.",
  },
  rejected: {
    icon: "lock",
    title: "No pudimos validar tu cuenta",
    body: "Iniciaste sesión correctamente, pero el servidor de Hyxora no aceptó el acceso. Cerrar sesión y volver a entrar suele bastar.",
  },
};

/**
 * Counts a rate-limit window down to zero.
 *
 * Ticks against a fixed deadline instead of decrementing, because a background
 * tab throttles timers to about once a minute: a counter that subtracted 1 per
 * tick would still read "45s" long after the window had reopened.
 */
const useCountdown = (seconds) => {
  const [remaining, setRemaining] = useState(() => seconds ?? 0);

  useEffect(() => {
    if (!seconds) {
      setRemaining(0);
      return;
    }

    const deadline = Date.now() + seconds * 1000;
    let intervalId = null;

    const tick = () => {
      const value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(value);
      if (value === 0 && intervalId) clearInterval(intervalId);
    };

    tick();
    intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  return remaining;
};

const plural = (value, singular, pluralForm) => `${value} ${value === 1 ? singular : pluralForm}`;

// Coarsens as it grows: a ban measured in hours does not need its seconds shown,
// and "1200 minutos" is a number nobody converts in their head.
const formatWait = (seconds) => {
  if (seconds < 60) return `${seconds} s`;
  if (seconds < 3600) return plural(Math.ceil(seconds / 60), "minuto", "minutos");
  if (seconds < 86400) return plural(Math.ceil(seconds / 3600), "hora", "horas");
  return plural(Math.ceil(seconds / 86400), "día", "días");
};

// Past an hour a countdown stops being useful — nobody watches it — so the wait
// is also given as the clock time it ends at. Returns the whole phrase, not just
// a date: a 20-hour ban lands tomorrow, and "a las 14:32" alone would be a lie.
const formatDeadline = (seconds) => {
  const at = new Date(Date.now() + seconds * 1000);
  const time = at.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (at.toDateString() === new Date().toDateString()) return `a las ${time}`;
  return `el ${at.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} a las ${time}`;
};

const Screen = ({ children }) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f8f8] px-6 py-10">
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
      {children}
    </div>
  </div>
);

/**
 * What the dashboard renders while it has no Hyxora session, and instead of the
 * dashboard when it cannot get one.
 *
 * Blocking here rather than at each panel is the whole point: with no session
 * every gated query is `enabled: false`, so letting the dashboard mount gives
 * twenty spinners that never resolve, no error anywhere and nothing in the
 * network tab to explain it. One screen that names the failure replaces all of
 * them. It deliberately does not offer "entrar de todos modos" — that leads
 * straight back to the spinners it exists to prevent — so the way out is a
 * retry, going home, or logging out.
 */
const SessionGate = ({ status, error, onRetry, isRetrying, onLogout }) => {
  const { user } = usePrivy();
  const failure = FAILURES[status];
  const waitSeconds = useCountdown(status === "rate-limited" ? (error?.retryAfterSeconds ?? 0) : 0);

  if (!failure) {
    return (
      <Screen>
        <Spinner />
        <p className="font-inter text-[14px] font-medium tracking-[-0.56px] text-[rgba(25,54,63,0.7)]">
          Conectando con Hyxora…
        </p>
      </Screen>
    );
  }

  const isWaiting = waitSeconds > 0;
  const isLongWait = waitSeconds >= LONG_WAIT_SECONDS;
  const isRejected = status === "rejected";

  // Everything support needs to find the session without a round of questions.
  const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "No puedo acceder al panel de Hyxora"
  )}&body=${encodeURIComponent(
    [
      "Hola, no consigo entrar al panel.",
      "",
      `Error: ${failure.title}`,
      `Código: ${error?.status ?? "sin respuesta del servidor"}`,
      error?.message ? `Detalle: ${error.message}` : null,
      `Cuenta: ${user?.id ?? "desconocida"}`,
      `Fecha: ${new Date().toISOString()}`,
    ]
      .filter(Boolean)
      .join("\n")
  )}`;

  return (
    <Screen>
      <span className="flex size-11 items-center justify-center rounded-full bg-white shadow-[0px_0px_10px_0px_inset_rgba(25,54,63,0.08)]">
        <Icon
          name={failure.icon}
          size={failure.iconSize}
          className="size-[20px] fill-[rgba(25,54,63,0.55)]"
        />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-inter text-[18px] font-medium leading-6 tracking-[-0.72px] text-[#19363f]">
          {failure.title}
        </h1>
        <p className="font-inter text-[14px] leading-5 tracking-[-0.56px] text-[rgba(25,54,63,0.6)]">
          {failure.body}
        </p>
        {status === "rate-limited" && (
          <p className="font-inter text-[14px] leading-5 tracking-[-0.56px] text-[rgba(25,54,63,0.6)]">
            {!isWaiting
              ? "Ya puedes volver a intentarlo."
              : isLongWait
                ? `El bloqueo se levanta en ${formatWait(waitSeconds)}, ${formatDeadline(waitSeconds)}. Puedes intentarlo antes, pero cada intento fallido puede reiniciar la espera.`
                : `Podrás reintentar en ${formatWait(waitSeconds)}.`}
          </p>
        )}
      </div>

      {/* The server's own words, when it sent any. Small and muted: it is for
          whoever reads it out to support, not the headline. */}
      {(error?.message || error?.status) && (
        <p className="max-w-full break-words font-inter text-[11px] leading-4 tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
          {error.message ?? "El servidor no devolvió un mensaje."}
          {error.status ? ` (${error.status})` : ""}
        </p>
      )}

      <div className="mt-1 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:justify-center">
        <Button
          isPrimary={!isLongWait}
          isSecondary={isLongWait}
          icon="refresh"
          onClick={onRetry}
          disabled={isRetrying || (isWaiting && !isLongWait)}
          className="w-full sm:w-auto"
        >
          {isRetrying
            ? "Reintentando…"
            : isWaiting
              ? isLongWait
                ? "Intentar de todos modos"
                : `Espera ${formatWait(waitSeconds)}`
              : "Reintentar"}
        </Button>

        {/* Exactly one primary on screen: on a long ban the retry is demoted to
            "de todos modos" and leaving becomes the action being recommended. */}
        {isRejected ? (
          <Button isSecondary icon="logout" onClick={onLogout} className="w-full sm:w-auto">
            Cerrar sesión
          </Button>
        ) : (
          <Button
            isPrimary={isLongWait}
            isSecondary={!isLongWait}
            as="link"
            href="/"
            className="w-full sm:w-auto"
          >
            Volver al inicio
          </Button>
        )}
      </div>

      <a
        href={supportHref}
        className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.45)] underline underline-offset-2 transition-colors hover:text-[#19363f]"
      >
        Escribir a soporte
      </a>
    </Screen>
  );
};

export default SessionGate;
