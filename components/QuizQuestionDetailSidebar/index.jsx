"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

// ── QuizQuestionDetailSidebar ────────────────────────────────────────────────────

/**
 * Read-only detail for a single quiz question. Questions are owned by the
 * backend (`/survey/questions`) and there's no admin write endpoint, so this
 * panel only reads — it breaks down how the answers landed across the options.
 *
 * @param {Object} question    - `{ questionNumber, questionText, options }`
 * @param {number} index       - Position in the list, for the "Pregunta N" label
 * @param {Object[]} responses - Every survey response, used for the tally
 */
const QuizQuestionDetailSidebar = ({ question, index, responses = [], onClose }) => {
  const panelRef = useRef(null);

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

  const answers = responses.map((r) => r.answers?.[String(question.questionNumber)]);
  const answered = answers.filter(Boolean).length;

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F]">
            Pregunta {index + 1}
          </p>
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
            {answered} {answered === 1 ? "respuesta" : "respuestas"}
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
          <p className="font-inter text-[13px] tracking-[-0.52px] text-[#19363F] leading-snug">
            {question.questionText}
          </p>

          <div className="flex flex-col gap-2.5">
            <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
              Opciones ({question.options.length})
            </span>

            {question.options.map((option, oi) => {
              const count = answers.filter((a) => a === option).length;
              const share = answered ? count / answered : 0;

              return (
                <div
                  key={option}
                  className="flex flex-col gap-1.5 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]"
                >
                  <div className="flex items-start gap-2">
                    <span className="size-4 shrink-0 rounded-full bg-[rgba(25,54,63,0.08)] text-[#19363F] font-inter text-[9px] font-semibold flex items-center justify-center mt-px">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <p className="flex-1 min-w-0 font-inter text-[11px] tracking-[-0.44px] text-[#19363F] leading-snug">
                      {option}
                    </p>
                    <span className="font-inter text-[10px] font-medium tabular-nums tracking-[-0.4px] text-[rgba(25,54,63,0.45)] shrink-0">
                      {count} · {Math.round(share * 100)}%
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.06)]">
                    <div
                      className="h-full origin-left rounded-full bg-[#19363F] transition-transform duration-500 ease-out"
                      style={{ transform: `scaleX(${share})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.35)] leading-relaxed">
            Las preguntas se gestionan desde el backend — no se pueden editar desde aquí.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionDetailSidebar;
