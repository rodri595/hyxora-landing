"use client";

import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

// Enough to stop someone pasting a wordlist into the box, low enough that a
// typo or two costs nothing.
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

const UnlockPanel = ({ onUnlock, onDismiss, style, className }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useGSAP(
    () => {
      gsap.from(panelRef.current, {
        autoAlpha: 0,
        scale: 0.94,
        y: 8,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.34,
        ease: "power3.out",
      });
    },
    { scope: panelRef }
  );

  // Only ticking while a cooldown is actually running, so the panel is not
  // re-rendering once a second for the whole time it sits open.
  useEffect(() => {
    if (lockedUntil <= now) return undefined;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [lockedUntil, now]);

  const cooling = lockedUntil > now;
  const secondsLeft = cooling ? Math.ceil((lockedUntil - now) / 1000) : 0;

  const submit = async (event) => {
    event.preventDefault();
    if (checking || cooling || !value.trim()) return;

    setChecking(true);
    const accepted = await onUnlock(value);
    setChecking(false);
    if (accepted) return;

    const next = attempts + 1;
    setAttempts(next);
    setValue("");
    // A wrong key shakes the card — the fastest way to read "no" without
    // waiting to parse the text underneath.
    gsap.fromTo(panelRef.current, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });

    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + COOLDOWN_MS);
      setNow(Date.now());
      setAttempts(0);
      setError("Demasiados intentos");
      return;
    }
    const left = MAX_ATTEMPTS - next;
    setError(`Clave incorrecta · ${left} intento${left === 1 ? "" : "s"}`);
  };

  return (
    <div
      ref={panelRef}
      data-lenis-prevent
      style={style}
      className={cn(
        "squircle fixed w-[232px] rounded-[40px] border border-[#24292D] bg-[#0D0D0D]/95 p-3 shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="size-[5px] shrink-0 rounded-full bg-[#F5A524]" />
        <span className="min-w-0 flex-1 truncate font-semibold text-[11px] text-white tracking-[-0.01em]">
          Herramientas internas
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 px-1 text-[#7A838C] text-[13px] leading-none transition-colors hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <p className="mb-2.5 text-[10px] text-[#7A838C] leading-[1.5]">
        Introduce la clave para habilitar el panel en este navegador.
      </p>

      <form onSubmit={submit}>
        <input
          ref={inputRef}
          type="password"
          value={value}
          disabled={cooling || checking}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={cooling ? `Espera ${secondsLeft}s` : "clave"}
          className={cn(
            "squircle w-full rounded-[10px] border bg-black/40 px-2.5 py-2 font-mono text-[11px] text-white outline-none transition-colors placeholder:text-[#3F464D] disabled:opacity-50",
            error ? "border-[#F31260]" : "border-[#24292D] focus:border-[#3F464D]"
          )}
        />

        {error && <p className="mt-2 text-[10px] text-[#F31260] leading-[1.5]">{error}</p>}

        <button
          type="submit"
          disabled={cooling || checking || !value.trim()}
          className="squircle mt-2.5 w-full rounded-[10px] border border-[#24292D] bg-white/5 py-2 font-bold text-[11px] text-white transition-[background-color,transform] duration-100 hover:bg-white/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {checking ? "Comprobando…" : "Desbloquear"}
        </button>
      </form>
    </div>
  );
};

export default UnlockPanel;
