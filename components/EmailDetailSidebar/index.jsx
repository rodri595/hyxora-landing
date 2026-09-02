"use client";

import { cn } from "@/utils";
import { emailRecipients, toAddressList } from "@/utils/email";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const STATUS_STYLES = {
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  bounced: "bg-red-50 text-red-700 border-red-200",
  suppressed: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-sky-50 text-sky-700 border-sky-200",
  queued: "bg-amber-50 text-amber-700 border-amber-200",
};

const AddressRow = ({ label, addresses }) =>
  addresses.length === 0 ? null : (
    <div className="flex items-start gap-2">
      <span className="w-14 shrink-0 font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase pt-px">
        {label}
      </span>
      <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.6)] break-all">
        {addresses.join(", ")}
      </span>
    </div>
  );

const EmailDetailSidebar = ({ email, onClose }) => {
  const panelRef = useRef(null);
  const [showAll, setShowAll] = useState(false);

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

  const statusKey = email?.last_event?.toLowerCase();
  const statusCls =
    STATUS_STYLES[statusKey] ??
    "bg-[rgba(25,54,63,0.06)] text-[#19363F] border-[rgba(25,54,63,0.1)]";

  // `bcc` is where the real recipients are; `to` is the noreply mailbox.
  const recipients = emailRecipients(email);
  const visible = showAll ? recipients : recipients.slice(0, 5);
  const headerLine =
    recipients.length === 0
      ? "—"
      : recipients.length === 1
        ? recipients[0]
        : `${recipients.length} destinatarios`;

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            {email?.subject ?? email?.title ?? "Sin asunto"}
          </p>
          <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.5)] truncate">
            Para: {headerLine}
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

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b-[0.7px] border-[rgba(25,54,63,0.06)] shrink-0">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px] border",
            statusCls
          )}
        >
          {email?.last_event ?? "—"}
        </span>
        {email?.created_at && (
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
            {new Date(email.created_at).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Recipients — the whole bcc list, since the table only shows the first */}
      <div className="flex flex-col gap-2 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.06)] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Destinatarios ({recipients.length})
          </span>
          {recipients.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[#19363F] hover:underline"
            >
              {showAll ? "Ver menos" : `Ver todos (${recipients.length})`}
            </button>
          )}
        </div>

        {recipients.length === 0 ? (
          <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)]">
            Sin destinatarios
          </p>
        ) : (
          <div data-lenis-prevent className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {visible.map((address) => (
              <span
                key={address}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-[rgba(25,54,63,0.06)] border-[0.7px] border-[rgba(25,54,63,0.1)] font-inter text-[10px] tracking-[-0.4px] text-[#19363F] break-all"
              >
                {address}
              </span>
            ))}
            {!showAll && recipients.length > visible.length && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center px-2 py-0.5 rounded-full border-[0.7px] border-dashed border-[rgba(25,54,63,0.2)] font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.6)] hover:bg-[rgba(25,54,63,0.04)] transition-colors"
              >
                +{recipients.length - visible.length}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1 pt-1">
          <AddressRow label="De" addresses={toAddressList(email?.from)} />
          <AddressRow label="Para" addresses={toAddressList(email?.to)} />
          <AddressRow label="CC" addresses={toAddressList(email?.cc)} />
          <AddressRow label="Responder" addresses={toAddressList(email?.reply_to)} />
        </div>
      </div>

      {/* Body */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent"
      >
        {email?.html ? (
          <iframe
            srcDoc={email.html}
            title="Email preview"
            className="w-full h-full border-none"
            sandbox="allow-same-origin"
          />
        ) : email?.body ? (
          <pre className="p-4 font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.75)] whitespace-pre-wrap break-words">
            {email.body}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="rgba(25,54,63,0.2)"
                strokeWidth="1.5"
              />
              <path
                d="M2 8l10 6 10-6"
                stroke="rgba(25,54,63,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)]">
              Sin contenido disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetailSidebar;
