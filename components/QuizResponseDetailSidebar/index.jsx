"use client";

import { quizQuestions } from "@/constants/quiz";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const fmt = (ts) =>
  new Date(ts).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

// ── QuizResponseDetailSidebar ────────────────────────────────────────────────────

const QuizResponseDetailSidebar = ({ response, onClose, onDelete }) => {
  const panelRef = useRef(null);
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

  const handleDelete = () => {
    onDelete(response.id);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            {response.email}
          </p>
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] truncate">
            Respondido el {fmt(response.submittedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors mt-0.5"
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        <div className="flex flex-col gap-4 p-4">
          {quizQuestions.map((q, qi) => {
            const selectedId = response.answers[q.id];
            const optionIndex = q.options.findIndex((o) => o.id === selectedId);
            const option = q.options[optionIndex];
            const letter = String.fromCharCode(65 + Math.max(optionIndex, 0));

            return (
              <div key={q.id} className="flex flex-col gap-1.5">
                <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                  Pregunta {qi + 1}
                </span>
                <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)] leading-snug">
                  {q.question}
                </p>
                {option ? (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]">
                    <span className="size-4 shrink-0 rounded-full bg-[#19363F] text-white font-inter text-[9px] font-semibold flex items-center justify-center mt-px">
                      {letter}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F] leading-snug">
                        {option.label}
                      </p>
                      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)]">
                        segmento: {option.value}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)]">
                    Sin respuesta
                  </p>
                )}
              </div>
            );
          })}

          {/* Danger zone */}
          <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-3">
            {confirmDelete ? (
              <ConfirmBlock
                message="¿Confirmas que quieres eliminar este cuestionario? El usuario podrá volver a completarlo desde cero."
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
                Eliminar cuestionario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResponseDetailSidebar;
