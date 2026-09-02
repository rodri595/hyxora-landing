"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";

const SELECTOR_LABEL = {
  email: "Email",
  ip: "IP",
  id: "Referencia",
};

/**
 * Confirmation for clearing a rate-limit counter.
 *
 * The whole reason this exists as a step: the reset is instant, silent and
 * server-side. Nothing about the table changes visibly enough to catch a
 * misclick, and on `reset-all` the misclick hands the quota back to whoever was
 * actually abusing the API. So the dialog names exactly what is about to be
 * sent — the selector key and its value — rather than a generic "¿Seguro?".
 *
 * It also stays open on success, because `hitsCleared` is the only place the
 * outcome is reported and `0` needs explaining: it means the reset worked and
 * the counter had already rolled over on its own.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ scope: "one" | "all", selectorKey?: "email" | "ip" | "id", selectorValue?: string }} [props.request]
 * @param {() => void} props.onConfirm
 * @param {boolean} [props.isPending]
 * @param {Error | null} [props.error]
 * @param {import("@/hooks/gateway/types").RateLimitResetResult | import("@/hooks/gateway/types").RateLimitResetAllResult | null} [props.result]
 */
const RateLimitResetModal = ({
  open,
  onClose,
  request,
  onConfirm,
  isPending = false,
  error = null,
  result = null,
}) => {
  const isAll = request?.scope === "all";
  const isDone = Boolean(result);

  return (
    <Modal open={open} onClose={onClose} classWrapper="max-w-[440px] overflow-hidden">
      <div className="flex flex-col gap-4 w-full rounded-2xl bg-[#FCFDFD] px-5 pt-5 pb-5">
        <div className="flex flex-col gap-1.5 pr-10">
          <p className="font-inter font-medium text-[20px] leading-tight tracking-[-0.8px] text-[#0D1117]">
            {isDone
              ? "Límite eliminado"
              : isAll
                ? "Quitar el límite a todo el mundo"
                : "Quitar el límite"}
          </p>
          <p className="font-inter text-[13px] leading-5 tracking-[-0.26px] text-[#5E7279]">
            {isDone
              ? "El contador se ha borrado en el gateway. El usuario puede volver a intentarlo ya."
              : isAll
                ? "Se borran todos los contadores y todas las referencias activas, no solo el de una persona. Quien estuviera abusando de la API recupera su cuota igual que quien te ha escrito."
                : "El contador se borra al instante y el usuario recupera su cuota completa sin esperar a que se cierre la ventana."}
          </p>
        </div>

        {/* Exactly what is about to be sent — one selector, named. */}
        {!isDone && !isAll && request?.selectorValue && (
          <div className="flex flex-col gap-1 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.1)] bg-white px-3.5 py-3">
            <span className="font-inter text-[10px] font-medium uppercase tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
              {SELECTOR_LABEL[request.selectorKey] ?? "Selector"}
            </span>
            <span className="font-mono text-[12px] tracking-tight text-[#19363F] break-all">
              {request.selectorValue}
            </span>
          </div>
        )}

        {isDone && (
          <div className="flex flex-col gap-1.5 rounded-xl border-[0.7px] border-emerald-200 bg-emerald-50/60 px-3.5 py-3">
            {isAll ? (
              <span className="font-inter text-[12px] tracking-[-0.48px] text-emerald-800">
                {result.clientsCleared} contador
                {result.clientsCleared === 1 ? "" : "es"} borrado
                {result.clientsCleared === 1 ? "" : "s"}.
              </span>
            ) : (
              <>
                <span className="font-inter text-[12px] tracking-[-0.48px] text-emerald-800 break-all">
                  {result.target ?? request?.selectorValue}
                </span>
                <span className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-emerald-700/80">
                  {result.hitsCleared > 0
                    ? `${result.hitsCleared} peticiones borradas del contador.`
                    : "No había contador activo: la ventana ya se había reiniciado por su cuenta. También correcto."}
                </span>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-1 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
            <span className="font-inter text-[12px] font-medium tracking-[-0.48px] text-red-700">
              {error?.response?.status ? `${error.response.status} — ` : ""}
              {error.message}
            </span>
            {error?.response?.status === 404 && request?.selectorKey === "id" && (
              <span className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-red-600/80">
                Esa referencia ya no existe — caduca al cerrarse la ventana y se pierde si el
                gateway se reinicia. Pide el email al usuario y resetea por email.
              </span>
            )}
            {error?.response?.status === 404 && request?.selectorKey === "email" && (
              <span className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-red-600/80">
                No había contador activo y ese email no corresponde a ningún usuario de Privy.
                Revisa si está bien escrito.
              </span>
            )}
            {error?.response?.status === 403 && (
              <span className="font-inter text-[11px] leading-[1.5] tracking-[-0.44px] text-red-600/80">
                Tu sesión es válida pero tu ID de Privy no está en ADMIN_ALLOWLIST_PRIVY_IDS.
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isDone ? (
            <Button isPrimary onClick={onClose} className="w-full sm:w-auto">
              Cerrar
            </Button>
          ) : (
            <>
              <Button isSecondary onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                isPrimary
                onClick={onConfirm}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? "Quitando…" : isAll ? "Quitar a todos" : "Quitar el límite"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RateLimitResetModal;
