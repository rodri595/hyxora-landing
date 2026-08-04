"use client";

import Field from "@/components/Field";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const MIN_OPTIONS = 3;
const MAX_OPTIONS = 4;

const LABEL_CLS = "text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

// ── ConfirmBlock ───────────────────────────────────────────────────────────────

const ConfirmBlock = ({ message, confirmLabel, onCancel, onConfirm }) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg border-[0.7px] border-red-200 bg-red-50">
    <div className="flex items-start gap-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 mt-px"
        aria-hidden="true"
      >
        <path d="M8 2L14.5 13H1.5L8 2Z" stroke="#dc2626" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 6.5V9.5M8 11v.5" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <p className="font-inter text-[11px] tracking-[-0.44px] text-red-700 leading-relaxed">
        {message}
      </p>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-7 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] bg-white text-[rgba(25,54,63,0.6)] font-inter text-[11px] font-medium tracking-[-0.44px] hover:bg-[rgba(25,54,63,0.04)] transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 h-7 rounded-lg bg-red-600 text-white font-inter text-[11px] font-medium tracking-[-0.44px] hover:bg-red-700 transition-colors"
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);

// ── QuizQuestionSidebar ──────────────────────────────────────────────────────────

const QuizQuestionSidebar = ({ question, onClose, onSave, onDelete }) => {
  const panelRef = useRef(null);
  const isEdit = Boolean(question);

  const [questionText, setQuestionText] = useState(question?.question ?? "");
  const [options, setOptions] = useState(
    question?.options?.map((o) => ({ ...o })) ?? [
      { id: "opt-0", label: "", value: "" },
      { id: "opt-1", label: "", value: "" },
      { id: "opt-2", label: "", value: "" },
    ]
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const addOption = () =>
    setOptions((prev) =>
      prev.length >= MAX_OPTIONS
        ? prev
        : [...prev, { id: `opt-${Date.now()}`, label: "", value: "" }]
    );

  const removeOption = (id) =>
    setOptions((prev) => (prev.length <= MIN_OPTIONS ? prev : prev.filter((o) => o.id !== id)));

  const updateOption = (id, field, val) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: val } : o)));

  const canSave =
    questionText.trim() &&
    options.length >= MIN_OPTIONS &&
    options.every((o) => o.label.trim() && o.value.trim());

  const handleSave = () => {
    onSave({
      id: question?.id ?? `q-${Date.now()}`,
      question: questionText.trim(),
      options: options.map((o) => ({
        id: o.id,
        label: o.label.trim(),
        value: o.value.trim(),
      })),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(question.id);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F]">
          {isEdit ? "Editar pregunta" : "Nueva pregunta"}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        <div className="flex flex-col gap-4 p-4">
          <Field
            label="Pregunta"
            classLabel={LABEL_CLS}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="¿Cuál es tu objetivo?"
          />

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className={LABEL_CLS}>
                Opciones ({options.length}/{MAX_OPTIONS})
              </span>
            </div>

            {options.map((opt, i) => (
              <div
                key={opt.id}
                className="flex flex-col gap-1.5 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-inter text-[10px] font-semibold text-[rgba(25,54,63,0.3)] tabular-nums w-4 shrink-0 text-right">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <Field
                    className="flex-1"
                    classInput="h-7 px-2.5 text-[11px] bg-white"
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, "label", e.target.value)}
                    placeholder={`Respuesta ${i + 1}`}
                  />
                  {options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeOption(opt.id)}
                      className="size-5 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.35)] hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path
                          d="M8.5 1.5l-7 7M1.5 1.5l7 7"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <Field
                  className="pl-5.5"
                  classInput="h-7 px-2.5 text-[11px] bg-white font-mono"
                  value={opt.value}
                  onChange={(e) => updateOption(opt.id, "value", e.target.value)}
                  placeholder="segmento_valor"
                />
              </div>
            ))}

            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1.5 h-7 px-2 rounded-lg border-[0.7px] border-dashed border-[rgba(25,54,63,0.2)] text-[rgba(25,54,63,0.45)] hover:border-[rgba(25,54,63,0.4)] hover:text-[#19363F] transition-colors font-inter text-[11px] tracking-[-0.44px]"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path
                    d="M5 1v8M1 5h8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Añadir respuesta
              </button>
            )}

            <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)] leading-relaxed">
              El "valor" es la etiqueta de segmento usada para las campañas de email — evita
              cambiarlo si ya hay respuestas guardadas con esa opción.
            </p>
          </div>

          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors"
          >
            {isEdit ? "Guardar cambios" : "Crear pregunta"}
          </button>

          {isEdit && (
            <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-3">
              {confirmDelete ? (
                <ConfirmBlock
                  message="¿Confirmas que quieres eliminar esta pregunta? Esta acción es permanente."
                  confirmLabel="Sí, eliminar"
                  onCancel={() => setConfirmDelete(false)}
                  onConfirm={handleDelete}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className={cn(
                    "w-full h-8 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.15)] text-[rgba(25,54,63,0.5)]",
                    "font-inter text-[12px] font-medium tracking-[-0.48px] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                  )}
                >
                  Eliminar pregunta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionSidebar;
