"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

const fmt = (ts) =>
  new Date(ts).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── QuizResponseDetailSidebar ────────────────────────────────────────────────────

const QuizResponseDetailSidebar = ({ questions = [], response, onClose }) => {
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

  const { sent = 0, total = 0 } = response.emailProgress ?? {};

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            {response.user?.email}
          </p>
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] truncate">
            {response.user?.name ? `${response.user.name} — ` : ""}
            Respondido el {fmt(response.completedAt)}
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
          {questions.map((q, qi) => {
            // Answers come back keyed by question number, holding the exact
            // option text — there is no option id to resolve against.
            const option = response.answers?.[String(q.questionNumber)];
            const optionIndex = q.options.indexOf(option);
            const letter = String.fromCharCode(65 + Math.max(optionIndex, 0));

            return (
              <div key={q.questionNumber} className="flex flex-col gap-1.5">
                <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                  Pregunta {qi + 1}
                </span>
                <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)] leading-snug">
                  {q.questionText}
                </p>
                {option ? (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)]">
                    <span className="size-4 shrink-0 rounded-full bg-[#19363F] text-white font-inter text-[9px] font-semibold flex items-center justify-center mt-px">
                      {letter}
                    </span>
                    <p className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F] leading-snug min-w-0">
                      {option}
                    </p>
                  </div>
                ) : (
                  <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)]">
                    Sin respuesta
                  </p>
                )}
              </div>
            );
          })}

          {/* Email campaign progress — sent by the backend cron, read-only here */}
          <div className="flex flex-col gap-2 border-t-[0.7px] border-[rgba(25,54,63,0.08)] pt-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
                Emails enviados
              </span>
              <span className="font-inter text-[11px] font-medium tabular-nums tracking-[-0.44px] text-[#19363F]">
                {sent}/{total}
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(25,54,63,0.08)]">
              <div
                className="h-full origin-left rounded-full bg-[#19363F] transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${total ? sent / total : 0})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResponseDetailSidebar;
