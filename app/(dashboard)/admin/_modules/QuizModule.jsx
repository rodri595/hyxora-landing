"use client";

import DataTable from "@/components/DataTable";
import QuizQuestionSidebar from "@/components/QuizQuestionSidebar";
import QuizResponseDetailSidebar from "@/components/QuizResponseDetailSidebar";
import Tabs from "@/components/Tabs";
import { quizQuestions as initialQuizQuestions } from "@/constants/quiz";
import { mockQuizResponses } from "@/constants/quizResponses";
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

const PencilIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M11.5 2.5l2 2L5 13l-2.6.6.6-2.6L11.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const QuizModule = () => {
  const [innerTab, setInnerTab] = useState("results");
  const [questions, setQuestions] = useState(() =>
    initialQuizQuestions.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    }))
  );
  const [responses, setResponses] = useState(() => [...mockQuizResponses]);

  // sidebarMode: "response" | "question" | null
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const isOpen = sidebarMode !== null;

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const onSelectResponse = useCallback((response) => {
    setSelectedResponse(response);
    setSidebarMode("response");
  }, []);

  const onOpenCreateQuestion = useCallback(() => {
    setEditingQuestion(null);
    setSidebarMode("question");
  }, []);

  const onEditQuestion = useCallback((question) => {
    setEditingQuestion(question);
    setSidebarMode("question");
  }, []);

  const handleClose = useCallback(() => setSidebarMode(null), []);

  const handleInnerTabChange = useCallback(
    (id) => {
      setInnerTab(id);
      handleClose();
    },
    [handleClose],
  );

  const handleDeleteResponse = useCallback((id) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleSaveQuestion = useCallback((data) => {
    setQuestions((prev) => {
      const exists = prev.some((q) => q.id === data.id);
      return exists ? prev.map((q) => (q.id === data.id ? data : q)) : [...prev, data];
    });
  }, []);

  const handleDeleteQuestion = useCallback((id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

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
            setEditingQuestion(null);
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
            setEditingQuestion(null);
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
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
            {info.getValue()}
          </span>
        ),
      },
      ...questions.map((q, qi) => ({
        id: q.id,
        header: `Q${qi + 1}`,
        accessorFn: (row) => row.answers?.[q.id],
        cell: (info) => {
          const selectedId = info.getValue();
          const optionIndex = q.options.findIndex((o) => o.id === selectedId);
          const option = q.options[optionIndex];
          if (!option) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          const letter = String.fromCharCode(65 + optionIndex);
          return (
            <span className="inline-flex items-center gap-1.5" title={option.label}>
              <span className="size-4 shrink-0 rounded-full bg-[rgba(25,54,63,0.08)] text-[#19363F] font-inter text-[9px] font-semibold flex items-center justify-center">
                {letter}
              </span>
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)] max-w-40 truncate">
                {option.label}
              </span>
            </span>
          );
        },
      })),
      {
        accessorKey: "submittedAt",
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
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden">
        <div className="flex items-center justify-between mb-1 shrink-0">
          <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F]">
            Quiz
          </h2>
          {innerTab === "questions" && (
            <button
              type="button"
              onClick={onOpenCreateQuestion}
              className="flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg bg-[#19363F] text-white font-inter font-medium text-[11px] tracking-[-0.44px] hover:bg-[#0f2228] transition-colors"
            >
              <PlusIcon />
              Nueva pregunta
            </button>
          )}
        </div>

        <Tabs
          tabs={INNER_TABS}
          value={innerTab}
          onChange={handleInnerTabChange}
          className="mb-3"
        />

        {innerTab === "results" ? (
          <DataTable
            data={responses}
            columns={resultColumns}
            filename="quiz-resultados"
            searchPlaceholder="Buscar por email..."
          />
        ) : (
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.15)] scrollbar-thumb-rounded-lg">
            {questions.map((q, qi) => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-3 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white hover:border-[rgba(25,54,63,0.15)] transition-colors"
              >
                <span className="font-inter text-[10px] font-semibold text-[rgba(25,54,63,0.3)] tabular-nums shrink-0 mt-0.5">
                  {qi + 1}.
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <p className="font-inter text-[12px] tracking-[-0.48px] text-[#19363F] leading-snug">
                    {q.question}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((o, oi) => (
                      <span
                        key={o.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-[rgba(25,54,63,0.04)] font-inter text-[10px] tracking-[-0.3px] text-[rgba(25,54,63,0.6)]"
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + oi)}</span>
                        {o.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Editar pregunta"
                  onClick={() => onEditQuestion(q)}
                  className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
                >
                  <PencilIcon />
                </button>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="flex items-center justify-center flex-1">
                <p className="font-inter text-[12px] text-[rgba(25,54,63,0.35)] tracking-[-0.48px]">
                  Sin preguntas — crea la primera.
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
            key={selectedResponse.id}
            response={selectedResponse}
            onClose={handleClose}
            onDelete={handleDeleteResponse}
          />
        )}
        {sidebarMode === "question" && (
          <QuizQuestionSidebar
            key={editingQuestion?.id ?? "create"}
            question={editingQuestion}
            onClose={handleClose}
            onSave={handleSaveQuestion}
            onDelete={handleDeleteQuestion}
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
            key={selectedResponse.id}
            response={selectedResponse}
            onClose={handleClose}
            onDelete={handleDeleteResponse}
          />
        )}
        {sidebarMode === "question" && (
          <QuizQuestionSidebar
            key={editingQuestion?.id ?? "create"}
            question={editingQuestion}
            onClose={handleClose}
            onSave={handleSaveQuestion}
            onDelete={handleDeleteQuestion}
          />
        )}
      </div>
    </div>
  );
};

export default QuizModule;
