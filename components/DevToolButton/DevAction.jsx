"use client";

import CopyButton from "@/components/CopyButton";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import axios from "axios";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Turns an axios failure into something readable in a 232px panel. Generic on
 * purpose — an action adds its own `hints` for statuses that mean something
 * particular to it.
 */
export const describeError = (error, hints = {}) => {
  if (!error) return null;
  if (!axios.isAxiosError(error)) {
    return { status: null, message: error.message || String(error), body: null };
  }
  const status = error.response?.status ?? null;
  const body = error.response?.data;
  const generic = {
    401: "Sesión no autorizada para esta ruta",
    403: "Sesión sin permiso de admin",
    404: "Ruta no encontrada",
    405: "Método no permitido — puede que no sea GET",
    500: "Error del servidor",
  };
  return {
    status,
    message: body?.message || body?.error || hints[status] || generic[status] || error.message,
    body: body ?? null,
  };
};

const Row = ({ label, value, tone }) => (
  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
    <span className="text-[#7A838C]">{label}</span>
    <span
      className={cn(
        "truncate",
        tone === "success" && "text-[#17C964]",
        tone === "error" && "text-[#F31260]",
        !tone && "text-white"
      )}
    >
      {value}
    </span>
  </div>
);

/**
 * The readout, plus the two things you actually do with it: select part of it,
 * or take all of it.
 *
 * `select-text` is not decoration. The floating wrapper is `select-none` so
 * dragging the button never paints a selection across the page, and that
 * inherits down to here — without re-enabling it the response is a picture of
 * JSON: you can read an id in an error but you cannot lift it out.
 */
const ResponseBody = ({ body }) => {
  const text = typeof body === "string" ? body : JSON.stringify(body, null, 2);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>Respuesta</FieldLabel>
        <CopyButton text={text} variant="dark" title="Copiar respuesta" className="-mt-1 size-4" />
      </div>
      <pre
        data-lenis-prevent
        className="max-h-[132px] cursor-text select-text overflow-auto whitespace-pre-wrap break-all rounded-[8px] border border-[#24292D] bg-black/40 p-2 font-mono text-[9px] text-[#B6BFC7] leading-[1.55]"
      >
        {text}
      </pre>
    </div>
  );
};

/**
 * The hairline that travels while an action is running.
 *
 * A sweep rather than the pulsing third it replaced: a pulse says "something is
 * happening somewhere", a bar crossing the panel says "this action, still going".
 * That difference matters most for the rate-limit probe, which can be running
 * three hundred requests behind a button that otherwise looks stuck. Eased at
 * both ends so it reads as carried rather than dragged.
 */
const PendingSweep = () => {
  const barRef = useRef(null);

  useGSAP(() => {
    if (!barRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      barRef.current,
      { xPercent: -120 },
      { xPercent: 340, duration: 1.1, ease: "power1.inOut", repeat: -1 }
    );
  }, []);

  return (
    <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#24292D]">
      <div ref={barRef} className="h-full w-[30%] rounded-full bg-[#F5A524]" />
    </div>
  );
};

// ── Controls ──────────────────────────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <span className="block pb-1 font-semibold text-[9px] text-[#5A626A] uppercase tracking-[0.06em]">
    {children}
  </span>
);

/**
 * Muted line that swaps when the selection above it changes.
 *
 * Crossfades with a 3px rise rather than snapping. In a 232px panel a caption
 * that changes in place is easy to miss entirely — the movement is what says
 * "this text belongs to what you just picked".
 */
const SwappingNote = ({ children }) => {
  const ref = useRef(null);
  const text = typeof children === "string" ? children : null;

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 3 },
        { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", overwrite: "auto" }
      );
    },
    { dependencies: [text] }
  );

  return (
    <p ref={ref} className="text-[9px] text-[#5A626A] leading-[1.5]">
      {children}
    </p>
  );
};

/**
 * Two-or-three-way switch with a pill that slides between the options.
 *
 * The pill is one element animated across, not a background toggled per button:
 * a moving object reads as the *same* selection changing place, which is the
 * point of a segmented control over a set of radios.
 */
const Segmented = ({ options, value, onChange }) => {
  const pillRef = useRef(null);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useGSAP(
    () => {
      if (!pillRef.current) return;
      gsap.to(pillRef.current, {
        xPercent: index * 100,
        duration: prefersReducedMotion() ? 0 : 0.34,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { dependencies: [index] }
  );

  return (
    <div className="squircle relative flex overflow-hidden rounded-[9px] bg-white/[0.04] p-[2px]">
      <div
        ref={pillRef}
        aria-hidden="true"
        style={{ width: `calc((100% - 4px) / ${options.length})` }}
        className="absolute inset-y-[2px] left-[2px] rounded-[7px] bg-white/[0.10]"
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-1 flex-1 rounded-[7px] py-[5px] text-[10px] transition-colors duration-150",
            option.value === value ? "font-semibold text-white" : "text-[#7A838C] hover:text-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

/** Vertical pick-list, styled like the panel's own action rows. */
const RadioList = ({ options, value, onChange }) => (
  <div className="squircle overflow-hidden rounded-[10px] bg-white/[0.03]">
    {options.map((option, index) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex w-full items-center gap-2 px-2 py-[7px] text-left transition-[background-color,transform] duration-100 hover:bg-white/[0.05] active:scale-[0.98]",
            index > 0 && "border-[#1B2024] border-t",
            selected && "bg-white/[0.06]"
          )}
        >
          <span
            className={cn(
              "flex size-[11px] shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
              selected ? "border-[#17C964]" : "border-[#3F464D]"
            )}
          >
            <span
              className={cn(
                "size-[5px] rounded-full bg-[#17C964] transition-transform duration-150",
                selected ? "scale-100" : "scale-0"
              )}
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[10px] text-white leading-[1.3]">
              {option.label}
            </span>
            {option.detail && (
              <span className="block truncate font-mono text-[9px] text-[#5A626A] leading-[1.3]">
                {option.detail}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

const NumberControl = ({ control, value, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      inputMode="numeric"
      min={control.min}
      max={control.max}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      // Clamped on blur, not on keystroke: clamping while typing turns "30"
      // into "3" the moment the minimum is 1 and you have only typed one digit.
      onBlur={(event) => {
        const parsed = Number(event.target.value);
        if (!Number.isFinite(parsed)) return onChange(String(control.default));
        onChange(String(Math.min(Math.max(parsed, control.min), control.max)));
      }}
      className="w-full rounded-[8px] border border-[#24292D] bg-black/30 px-2 py-1.5 font-mono text-[11px] text-white outline-0 transition-colors focus:border-[#3F464D]"
    />
    <span className="shrink-0 text-[9px] text-[#5A626A]">máx. {control.max}</span>
  </div>
);

const Control = ({ control, value, onChange }) => (
  <div>
    <FieldLabel>{control.label}</FieldLabel>
    {control.type === "number" ? (
      <NumberControl control={control} value={value} onChange={onChange} />
    ) : control.type === "segmented" ? (
      <Segmented options={control.options} value={value} onChange={onChange} />
    ) : (
      <RadioList options={control.options} value={value} onChange={onChange} />
    )}
    {/* `note` returns a plain string — the registry stays JSX-free, and the
        crossfade is applied here so every control gets the same one. */}
    {control.note && (
      <div className="pt-1">
        <SwappingNote>{control.note(value)}</SwappingNote>
      </div>
    )}
  </div>
);

/**
 * The detail pane for one action: what it calls, a run button, and that hook's
 * own loading, response and error state.
 *
 * Every action stays mounted and hides when it isn't the selected one, so its
 * result is still there when you navigate back to it and the list can keep
 * showing a live dot per row. `active` only controls visibility.
 */
const DevAction = ({ action, active, onToneChange }) => {
  const { mutate, isPending, isSuccess, isError, data, error, reset } = action.useAction();

  // Parameters an action declares in the registry. `controls` is optional, so
  // every existing action keeps its bare "Ejecutar" button and is called with no
  // argument at all — the hooks that ignore their input never see one.
  const controls = action.controls ?? [];
  const [values, setValues] = useState(() =>
    Object.fromEntries(controls.map((control) => [control.id, control.default]))
  );
  const setValue = (id, value) => setValues((current) => ({ ...current, [id]: value }));

  // `path` and `note` may be functions of the current values, so the header
  // shows the URL that is actually about to be called rather than a placeholder.
  const path = useMemo(
    () => (typeof action.path === "function" ? action.path(values) : action.path),
    [action.path, values]
  );
  const note = typeof action.note === "function" ? action.note(values) : action.note;

  const tone = isPending ? "pending" : isError ? "error" : isSuccess ? "success" : "idle";

  // Bubbled up for the list's row dots and for the collapsed button.
  useEffect(() => {
    onToneChange(action.id, tone);
  }, [action.id, tone, onToneChange]);

  const failure = isError ? describeError(error, action.hints) : null;

  return (
    <div hidden={!active} className="space-y-2.5">
      <div className="rounded-[8px] border border-[#24292D] bg-black/20 px-2 py-1.5">
        <div className="flex items-baseline gap-1.5">
          <span className="shrink-0 font-bold font-mono text-[#7A838C] text-[9px]">
            {action.method}
          </span>
          <span className="min-w-0 break-all font-mono text-[10px] text-[#B6BFC7] leading-[1.4]">
            {path}
          </span>
        </div>
      </div>

      {note && <p className="text-[10px] text-[#7A838C] leading-[1.5]">{note}</p>}

      {controls.length > 0 && (
        <div className="space-y-2">
          {controls.map((control) => (
            <Control
              key={control.id}
              control={control}
              value={values[control.id]}
              onChange={(next) => setValue(control.id, next)}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          reset();
          mutate(controls.length > 0 ? values : undefined);
        }}
        className="squircle w-full rounded-[10px] border border-[#24292D] bg-white/5 py-2 font-bold text-[11px] text-white transition-[background-color,transform] duration-100 hover:bg-white/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Ejecutando…" : (action.runLabel ?? "Ejecutar")}
      </button>

      {isPending && <PendingSweep />}

      {isSuccess && (
        <div className="space-y-1.5">
          {data.status != null && <Row label="HTTP" value={data.status} tone="success" />}
          <Row label="Tiempo" value={`${data.durationMs} ms`} />
          {data.body != null && <ResponseBody body={data.body} />}
        </div>
      )}

      {failure && (
        <div className="space-y-1.5">
          <Row label="HTTP" value={failure.status ?? "sin respuesta"} tone="error" />
          <p className="select-text text-[10px] text-[#F31260] leading-[1.5]">{failure.message}</p>
          {failure.body != null && <ResponseBody body={failure.body} />}
        </div>
      )}
    </div>
  );
};

export default DevAction;
