"use client";

import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { quizQuestions } from "@/constants/quiz";
import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

// Quick to leave, unhurried to arrive — and no overshoot on anything the user
// didn't physically throw. SHIFT is small on purpose: enough travel to read as
// a direction, not enough to read as a slideshow.
const OUT_DURATION = 0.22;
const IN_DURATION = 0.5;
const SHIFT = 28;

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CheckMark = ({ active }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
    <path
      d="M3.5 8.5l3 3 6-6.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 16,
        strokeDashoffset: active ? 0 : 16,
        transition: "stroke-dashoffset 340ms cubic-bezier(0.22,1,0.36,1) 60ms",
      }}
    />
  </svg>
);

const QuizPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const dirRef = useRef(1);
  const busyRef = useRef(false);

  const question = quizQuestions[step];
  const isLast = step === quizQuestions.length - 1;
  const selected = answers[question.id];

  const { contextSafe } = useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const reduced = reduceMotion();
      gsap.set(panel, { autoAlpha: 0, x: reduced ? 0 : SHIFT * dirRef.current });

      const tl = gsap.timeline();
      tl.to(panel, {
        autoAlpha: 1,
        x: 0,
        duration: reduced ? 0.2 : IN_DURATION,
        ease: "power3.out",
      });
      if (!reduced) {
        tl.from(
          ".quiz-rise",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.045,
          },
          0.06
        );
      }
    },
    { dependencies: [step, isComplete], scope: rootRef }
  );

  // Leaves along the axis it will re-enter on, so back/next stay spatially
  // symmetric. Commits the step change only once the panel is out of sight.
  const navigate = contextSafe((nextStep, complete = false) => {
    if (busyRef.current) return;
    busyRef.current = true;

    const reduced = reduceMotion();
    dirRef.current = complete || nextStep > step ? 1 : -1;

    gsap.killTweensOf(panelRef.current);
    gsap.to(panelRef.current, {
      autoAlpha: 0,
      x: reduced ? 0 : -SHIFT * dirRef.current,
      duration: reduced ? 0.15 : OUT_DURATION,
      ease: "power2.in",
      onComplete: () => {
        busyRef.current = false;
        if (complete) setIsComplete(true);
        else setStep(nextStep);
      },
    });
  });

  const handleSelect = (value) => {
    haptic("selection");
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleBack = () => {
    if (step > 0) navigate(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    if (isLast) {
      haptic("success");
      navigate(null, true);
    } else {
      navigate(step + 1);
    }
  };

  const segmentFill = (index) => {
    if (isComplete || index < step) return 1;
    if (index === step) return selected ? 1 : 0;
    return 0;
  };

  return (
    <Layout isFixedHeader classContainer="flex flex-1 flex-col items-center px-4 pt-[100px] ">
      <div ref={rootRef} className="relative flex w-full max-w-[600px] flex-col gap-10 py-16 ">
        {/* Ambient wash — gives the translucent card something to sit on */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-[420px] w-full max-w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(25,54,63,0.07),transparent)] blur-2xl"
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-inter text-[12px] font-medium tracking-[-0.24px] text-[rgba(25,54,63,0.5)]">
              {isComplete ? "Completado" : `Pregunta ${step + 1} de ${quizQuestions.length}`}
            </span>
            <span className="font-inter text-[12px] font-medium tabular-nums tracking-[-0.24px] text-[rgba(25,54,63,0.35)]">
              {Math.round(
                ((isComplete ? quizQuestions.length : step) / quizQuestions.length) * 100
              )}
              %
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {quizQuestions.map((q, index) => (
              <div
                key={q.id}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-[rgba(25,54,63,0.08)]"
              >
                <div
                  className="h-full origin-left rounded-full bg-[#19363f] transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `scaleX(${segmentFill(index)})` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div ref={panelRef} className="rounded-[28px] p-8 max-md:p-6">
          {isComplete ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <div className="quiz-rise flex size-14 items-center justify-center rounded-full bg-[#19363f] text-white">
                <CheckMark active />
              </div>
              <h2 className="quiz-rise max-w-[420px] font-inter text-[28px] font-medium leading-[34px] tracking-[-0.9px] text-[#19363f]">
                ¡Gracias por completar el cuestionario!
              </h2>
              <p className="quiz-rise max-w-[380px] font-inter text-[15px] leading-[23px] tracking-[-0.2px] text-[rgba(25,54,63,0.6)]">
                Hemos registrado tus respuestas. Te escribiremos con contenido pensado para ti.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              <h2 className="quiz-rise font-inter text-[26px] font-medium leading-[32px] tracking-[-0.85px] text-[#19363f] max-md:text-[22px] max-md:leading-[28px]">
                {question.question}
              </h2>

              <div className="flex flex-col gap-2.5">
                {question.options.map((option, index) => {
                  const isSelected = selected === option.value;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "quiz-rise flex cursor-pointer items-center gap-3.5 rounded-2xl border px-4 py-4 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
                        // Press lands on pointer-down and snaps in faster than
                        // it releases, so the row feels physically depressed.
                        "active:scale-[0.985] active:duration-75 motion-reduce:active:scale-100",
                        isSelected
                          ? "border-[rgba(25,54,63,0.28)] bg-[rgba(25,54,63,0.05)] shadow-[0_0_0_1px_rgba(25,54,63,0.12)]"
                          : "border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.015)] hover:border-[rgba(25,54,63,0.18)] hover:bg-[rgba(25,54,63,0.035)]"
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleSelect(option.value)}
                        className="sr-only"
                      />

                      <span
                        className={cn(
                          "relative flex size-7 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-300 ease-out",
                          isSelected
                            ? "border-[#19363f] bg-[#19363f] text-white"
                            : "border-[rgba(25,54,63,0.16)] bg-white text-[rgba(25,54,63,0.55)]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute font-inter text-[12px] font-medium transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            isSelected ? "scale-50 opacity-0" : "scale-100 opacity-100"
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span
                          className={cn(
                            "absolute flex transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                            isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                          )}
                        >
                          <CheckMark active={isSelected} />
                        </span>
                      </span>

                      <span
                        className={cn(
                          "font-inter text-[15px] leading-[21px] tracking-[-0.2px] transition-colors duration-200",
                          isSelected
                            ? "font-medium text-[#19363f]"
                            : "font-normal text-[rgba(25,54,63,0.75)]"
                        )}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="quiz-rise flex items-center gap-3">
                {step > 0 && (
                  <Button type="button" isSecondary className="flex-1" onClick={handleBack}>
                    Atrás
                  </Button>
                )}
                <Button type="submit" isPrimary className="flex-1" disabled={!selected}>
                  {isLast ? "Enviar" : "Siguiente"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;
