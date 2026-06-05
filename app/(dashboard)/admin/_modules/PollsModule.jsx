"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGetAllPolls } from "@/hooks/poll/useGetAllPolls";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import PollDetailSidebar from "@/components/PollDetailSidebar";
import CreatePollSidebar from "@/components/CreatePollSidebar";
import { cn } from "@/utils";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 420;

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED:
    "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]",
};

const PollsModule = () => {
  const {
    data: pollsData_data,
    isLoading: pollsData_isLoading,
    error: pollsData_error,
  } = useGetAllPolls();

  const rows = useMemo(() => pollsData_data ?? [], [pollsData_data]);

  const [isOpen, setIsOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("detail");
  const [displayedPoll, setDisplayedPoll] = useState(null);

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const onSelectPoll = useCallback((poll) => {
    setDisplayedPoll(poll);
    setSidebarMode("detail");
    setIsOpen(true);
  }, []);

  const onOpenCreate = useCallback(() => {
    setDisplayedPoll(null);
    setSidebarMode("create");
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Keep displayedPoll in sync after invalidation refreshes the list
  useEffect(() => {
    if (sidebarMode !== "detail" || !displayedPoll || !pollsData_data) return;
    const updated = pollsData_data.find((p) => p._id === displayedPoll._id);
    if (updated) setDisplayedPoll(updated);
  }, [pollsData_data, displayedPoll, sidebarMode]);

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
          onComplete: () => setDisplayedPoll(null),
        });
      }
    },
    { dependencies: [isOpen] },
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
          onComplete: () => setDisplayedPoll(null),
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] },
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "number",
        header: "#",
        size: 44,
        cell: (info) => (
          <span className="font-inter text-[11px] font-semibold tabular-nums text-[rgba(25,54,63,0.35)]">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Título",
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F] line-clamp-2 leading-snug">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        size: 80,
        cell: (info) => {
          const val = info.getValue();
          const cls = STATUS_STYLES[val] ?? STATUS_STYLES.CLOSED;
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px] border",
                cls,
              )}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "startsAt",
        header: "Apertura",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
              {new Date(val).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "endsAt",
        header: "Cierre",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
              {new Date(val).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "votesCount",
        header: "Votos",
        size: 60,
        accessorFn: (row) => row.votes?.length ?? 0,
        cell: (info) => {
          const count = info.getValue();
          return (
            <span
              className={cn(
                "font-inter text-[11px] font-semibold tabular-nums",
                count > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.25)]",
              )}
            >
              {count}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        size: 48,
        cell: ({ row }) => (
          <button
            type="button"
            aria-label="Ver encuesta"
            onClick={() => onSelectPoll(row.original)}
            className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="8" cy="8" r="2" fill="currentColor" />
            </svg>
          </button>
        ),
      },
    ],
    [onSelectPoll],
  );

  if (pollsData_isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  if (pollsData_error)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="font-inter text-[12px] text-[rgba(25,54,63,0.5)] tracking-[-0.48px]">
          Error al cargar encuestas.
        </p>
      </div>
    );

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F]">
            Encuestas
          </h2>
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg bg-[#19363F] text-white font-inter font-medium text-[11px] tracking-[-0.44px] hover:bg-[#0f2228] transition-colors"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 1v8M1 5h8"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            Nueva encuesta
          </button>
        </div>
        <DataTable
          data={rows}
          columns={columns}
          filename="encuestas"
          searchPlaceholder="Buscar por título, estado..."
        />
      </div>

      {/* Desktop (lg+): inline wrapper — GSAP animates width */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {sidebarMode === "create" ? (
          <CreatePollSidebar
            nextNumber={rows.length + 1}
            onClose={handleClose}
          />
        ) : (
          displayedPoll && (
            <PollDetailSidebar
              key={displayedPoll._id}
              poll={displayedPoll}
              onClose={handleClose}
            />
          )
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
        {sidebarMode === "create" ? (
          <CreatePollSidebar
            nextNumber={rows.length + 1}
            onClose={handleClose}
          />
        ) : (
          displayedPoll && (
            <PollDetailSidebar
              key={displayedPoll._id}
              poll={displayedPoll}
              onClose={handleClose}
            />
          )
        )}
      </div>
    </div>
  );
};

export default PollsModule;
