"use client";

import { cn } from "@/utils";
import axios from "axios";
import { useEffect } from "react";

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

const ResponseBody = ({ body }) => (
  <pre
    data-lenis-prevent
    className="max-h-[132px] overflow-auto whitespace-pre-wrap break-all rounded-[8px] border border-[#24292D] bg-black/40 p-2 font-mono text-[9px] text-[#B6BFC7] leading-[1.55]"
  >
    {typeof body === "string" ? body : JSON.stringify(body, null, 2)}
  </pre>
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
            {action.path}
          </span>
        </div>
      </div>

      {action.note && <p className="text-[10px] text-[#7A838C] leading-[1.5]">{action.note}</p>}

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          reset();
          mutate();
        }}
        className="squircle w-full rounded-[10px] border border-[#24292D] bg-white/5 py-2 font-bold text-[11px] text-white transition-[background-color,transform] duration-100 hover:bg-white/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "Ejecutando…" : "Ejecutar"}
      </button>

      {isPending && (
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-[#24292D]">
          <div className="h-full w-1/3 animate-pulse bg-[#F5A524]" />
        </div>
      )}

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
          <p className="text-[10px] text-[#F31260] leading-[1.5]">{failure.message}</p>
          {failure.body != null && <ResponseBody body={failure.body} />}
        </div>
      )}
    </div>
  );
};

export default DevAction;
