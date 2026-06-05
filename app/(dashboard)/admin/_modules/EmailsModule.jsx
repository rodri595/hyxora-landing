"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGetAllEmails } from "@/hooks/admin/useGetAllEmails";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import CreateEmailSidebar from "@/components/CreateEmailSidebar";
import { cn } from "@/utils";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 380;

const STATUS_STYLES = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  bounced: "bg-red-50 text-red-700 border-red-200",
  suppressed: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  queued: "bg-amber-50 text-amber-700 border-amber-200",
};

const EmailsModule = () => {
  const { data: emailsData, isLoading, isFetching } = useGetAllEmails();
  const rows = useMemo(() => emailsData?.emails?.data ?? [], [emailsData]);

  const [isOpen, setIsOpen] = useState(false);

  const desktopWrapRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

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
        });
      }
    },
    { dependencies: [isOpen] },
  );

  useGSAP(
    () => {
      const panel = mobileWrapRef.current;
      const backdrop = backdropRef.current;
      if (!panel || !backdrop) return;
      if (isOpen) {
        gsap.set(backdrop, { pointerEvents: "auto" });
        gsap.to(panel, { x: "0%", duration: 0.35, ease: "power3.out", overwrite: true });
        gsap.to(backdrop, { opacity: 1, duration: 0.25, overwrite: true });
      } else {
        gsap.set(backdrop, { pointerEvents: "none" });
        gsap.to(panel, { x: "100%", duration: 0.26, ease: "power2.in", overwrite: true });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] },
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "to",
        header: "Para",
        cell: (info) => {
          const val = info.getValue();
          const display = Array.isArray(val) ? val.join(", ") : val;
          if (!display) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
              {display}
            </span>
          );
        },
      },
      {
        accessorKey: "subject",
        header: "Asunto",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.75)] max-w-[200px] truncate block">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
              {new Date(val).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "last_event",
        header: "Estado",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          const key = val.toLowerCase();
          const cls =
            STATUS_STYLES[key] ??
            "bg-[rgba(25,54,63,0.06)] text-[#19363F] border-[rgba(25,54,63,0.1)]";
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
    ],
    [],
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-inter font-semibold text-[14px] tracking-[-0.56px] text-[#19363F]">
              Emails
            </h2>
            {isFetching && !isLoading && <Spinner />}
          </div>
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg bg-[#19363F] text-white font-inter font-medium text-[11px] tracking-[-0.44px] hover:bg-[#0f2228] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Nuevo email
          </button>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          filename="emails"
          searchPlaceholder="Buscar por destinatario, asunto..."
        />
      </div>

      {/* Desktop (lg+): inline wrapper — GSAP animates width */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {isOpen && <CreateEmailSidebar onClose={handleClose} />}
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
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(380px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {isOpen && <CreateEmailSidebar onClose={handleClose} />}
      </div>
    </div>
  );
};

export default EmailsModule;
