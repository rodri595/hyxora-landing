"use client";

import DataTable from "@/components/DataTable";
import ErrorComp from "@/components/Error";
import QuizQuestionDetailSidebar from "@/components/QuizQuestionDetailSidebar";
import QuizResponseDetailSidebar from "@/components/QuizResponseDetailSidebar";
import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useGetAllSurveyResponses } from "@/hooks/admin/useGetAllSurveyResponses";
import { useGetSurveyQuestions } from "@/hooks/survey/useGetSurveyQuestions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 420;

const INNER_TABS = [
  { id: "results", label: "Resultados" },
  { id: "questions", label: "Preguntas" },
];

const ViewIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);

const QuizModule = () => {
  const [innerTab, setInnerTab] = useState("results");
  // Questions are read-only here — the backend owns them and exposes no admin
  // write endpoint, so both tabs just render what the API returns.
  const {
    data: questions = [],
    isLoading: isLoadingQuestions,
    isError: hasQuestionsError,
  } = useGetSurveyQuestions();
  const {
    data: responses = [],
    isLoading: isLoadingResponses,
    isError: hasResponsesError,
  } = useGetAllSurveyResponses();

  // sidebarMode: "response" | "question" | null
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const isOpen = sidebarMode !== null;

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const onSelectResponse = useCallback((response) => {
    setSelectedResponse(response);
    setSidebarMode("response");
  }, []);

  const onSelectQuestion = useCallback((question, index) => {
    setSelectedQuestion({ question, index });
    setSidebarMode("question");
  }, []);

  const handleClose = useCallback(() => setSidebarMode(null), []);

  const handleInnerTabChange = useCallback(
    (id) => {
      setInnerTab(id);
      handleClose();
    },
    [handleClose]
  );

  // Desktop (lg+): inline wrapper — GSAP animates its width
  useGSAP(
    () => {
      const el = desktopWrapRef.current;
      if (!el) return;
      if (isOpen) {
        gsap.to(el, {
          width: SIDEBAR_WIDTH,
          marginLeft: 16,
          duration: 0.38,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(el, {
          width: 0,
          marginLeft: 0,
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            setSelectedResponse(null);
            setSelectedQuestion(null);
          },
        });
      }
    },
    { dependencies: [isOpen] }
  );

  // Mobile/tablet (<lg): overlay slide + backdrop fade
  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, {
          x: "0%",
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(panel, {
          x: "100%",
          duration: 0.26,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            setSelectedResponse(null);
            setSelectedQuestion(null);
          },
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] }
  );

  const resultColumns = useMemo(
    () => [
      {
        id: "email",
        header: "Email",
        accessorFn: (row) => row.user?.email,
        cell: ({ row, getValue }) => (
          <span className="flex flex-col">
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
              {getValue()}
            </span>
            {row.original.user?.name && (
              <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
                {row.original.user.name}
              </span>
            )}
          </span>
        ),
      },
      ...questions.map((q, qi) => ({
        id: `q${q.questionNumber}`,
        header: `Q${qi + 1}`,
        accessorFn: (row) => row.answers?.[String(q.questionNumber)],
        cell: (info) => {
          const option = info.getValue();
          const optionIndex = q.options.indexOf(option);
          if (!option) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          const letter = String.fromCharCode(65 + Math.max(optionIndex, 0));
          return (
            <span className="inline-flex items-center gap-1.5" title={option}>
              <span className="size-4 shrink-0 rounded-full bg-[rgba(25,54,63,0.08)] text-[#19363F] font-inter text-[9px] font-semibold flex items-center justify-center">
                {letter}
              </span>
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] max-w-40 truncate">
                {option}
              </span>
            </span>
          );
        },
      })),
      {
        id: "emails",
        header: "Emails",
        accessorFn: (row) => row.emailProgress?.sent ?? 0,
        cell: ({ row, getValue }) => {
          const total = row.original.emailProgress?.total ?? 0;
          return (
            <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
              {getValue()}/{total}
            </span>
          );
        },
      },
      {
        accessorKey: "completedAt",
        header: "Fecha",
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {new Date(info.getValue()).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        size: 48,
        cell: ({ row }) => (
          <button
            type="button"
            aria-label="Ver respuesta"
            onClick={() => onSelectResponse(row.original)}
            className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
          >
            <ViewIcon />
          </button>
        ),
      },
    ],
    [questions, onSelectResponse]
  );

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 overflow-hidden py-2.5 sm:rounded-xl sm:border-[0.7px] sm:border-[rgba(25,54,63,0.08)] sm:px-4 sm:py-3 sm:shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
        <div className="flex items-center justify-between mb-1 shrink-0">
          <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F]">
            Quiz
          </h2>
        </div>

        <Tabs tabs={INNER_TABS} value={innerTab} onChange={handleInnerTabChange} className="mb-3" />

        {isLoadingQuestions || (innerTab === "results" && isLoadingResponses) ? (
          <Spinner className="my-16" />
        ) : hasQuestionsError || (innerTab === "results" && hasResponsesError) ? (
          <ErrorComp
            error
            className="my-16"
            message="No hemos podido cargar el cuestionario. Vuelve a intentarlo en unos minutos."
          />
        ) : innerTab === "results" ? (
          <DataTable
            data={responses}
            columns={resultColumns}
            filename="quiz-resultados"
            searchPlaceholder="Buscar por email..."
          />
        ) : (
          <div
            className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overscroll-contain"
            data-lenis-prevent
          >
            {questions.map((q, qi) => (
              <div
                key={q.questionNumber}
                className="flex items-start gap-3 p-3 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white hover:border-[rgba(25,54,63,0.15)] transition-colors"
              >
                <span className="font-inter text-[10px] font-semibold text-[rgba(25,54,63,0.3)] tabular-nums shrink-0 mt-0.5">
                  {qi + 1}.
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <p className="font-inter text-[12px] tracking-[-0.48px] text-[#19363F] leading-snug">
                    {q.questionText}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((o, oi) => (
                      <span
                        key={o}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[rgba(25,54,63,0.04)] font-inter text-[10px] tracking-[-0.3px] text-[rgba(25,54,63,0.6)]"
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + oi)}</span>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Ver pregunta"
                  onClick={() => onSelectQuestion(q, qi)}
                  className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
                >
                  <ViewIcon />
                </button>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="flex items-center justify-center flex-1">
                <p className="font-inter text-[12px] text-[rgba(25,54,63,0.35)] tracking-[-0.48px]">
                  Sin preguntas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop (lg+): inline wrapper — GSAP animates width */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {sidebarMode === "response" && selectedResponse && (
          <QuizResponseDetailSidebar
            key={selectedResponse.user?.email}
            questions={questions}
            response={selectedResponse}
            onClose={handleClose}
          />
        )}
        {sidebarMode === "question" && selectedQuestion && (
          <QuizQuestionDetailSidebar
            key={selectedQuestion.question.questionNumber}
            question={selectedQuestion.question}
            index={selectedQuestion.index}
            responses={responses}
            onClose={handleClose}
          />
        )}
      </div>

      {/* Mobile/tablet (<lg): backdrop */}
      <div
        ref={backdropRef}
        className="lg:hidden fixed inset-0 z-40 bg-black/30"
        style={{ opacity: 0, pointerEvents: "none" }}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar panel"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
      />

      {/* Mobile/tablet (<lg): overlay panel */}
      <div
        ref={mobileWrapRef}
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(420px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {sidebarMode === "response" && selectedResponse && (
          <QuizResponseDetailSidebar
            key={selectedResponse.user?.email}
            questions={questions}
            response={selectedResponse}
            onClose={handleClose}
          />
        )}
        {sidebarMode === "question" && selectedQuestion && (
          <QuizQuestionDetailSidebar
            key={selectedQuestion.question.questionNumber}
            question={selectedQuestion.question}
            index={selectedQuestion.index}
            responses={responses}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default QuizModule;
