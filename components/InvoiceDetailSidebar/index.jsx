"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/utils";
import { useSetInvoiceNumber } from "@/hooks/admin/useSetInvoiceNumber";
import Spinner from "@/components/Spinner";
import ErrorComp from "@/components/Error";
import Tabs from "@/components/Tabs";
import Field from "@/components/Field";

gsap.registerPlugin(useGSAP);

// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_CLASSES = {
  completed: "bg-emerald-50 text-emerald-700",
  generated: "bg-amber-50 text-amber-700",
  pending: "bg-sky-50 text-sky-700",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Compact uppercase label, matching the admin sidebar's dense layout. Passed to
// the shared <Field> via `classLabel` so we reuse one field component app-wide.
const LABEL_CLS =
  "text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase";

// ── EditPanel ──────────────────────────────────────────────────────────────────

const EditPanel = ({ payment }) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    payment?.invoiceNumber ?? "",
  );
  const [saved, setSaved] = useState(false);
  const savedTimeout = useRef(null);

  const { mutate: setInvoice, isPending, error, reset } = useSetInvoiceNumber();

  const hasChanges = invoiceNumber !== (payment?.invoiceNumber ?? "");

  useEffect(() => () => clearTimeout(savedTimeout.current), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasChanges || isPending) return;
    reset();
    setSaved(false);
    clearTimeout(savedTimeout.current);
    setInvoice(
      { paymentId: payment?.paymentId, invoiceNumber },
      {
        // Invalidation happens in the hook; we keep local state intact so the
        // sidebar stays open while the table refetches in the background.
        onSuccess: () => {
          setSaved(true);
          savedTimeout.current = setTimeout(() => setSaved(false), 3000);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {/* Read-only */}
      <Field
        label="Payment ID"
        classLabel={LABEL_CLS}
        value={payment?._id || "—"}
        copy={payment?._id}
        readOnly
        mono
      />
      <Field
        label="ID de Factura (Externo)"
        classLabel={LABEL_CLS}
        value={payment?.paymentId || "—"}
        copy={payment?.paymentId}
        readOnly
        mono
      />

      {/* Editable internal invoice number */}
      <Field
        label="Número de Factura Interno"
        classLabel={LABEL_CLS}
        value={invoiceNumber}
        onChange={(e) => {
          setInvoiceNumber(e.target.value);
          setSaved(false);
        }}
        placeholder="Ej: FAC-2026-001"
        hint="Número de factura interno para seguimiento y contabilidad."
      />

      {error && (
        <ErrorComp
          error={true}
          message={
            error?.response?.data?.message ||
            error?.message ||
            "Error al guardar el número de factura"
          }
        />
      )}

      {saved && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border-[0.7px] border-emerald-200">
          <svg width="12" height="12" viewBox="0 0 12 10" fill="none">
            <title>Guardado</title>
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-inter text-[11px] tracking-[-0.44px] text-emerald-700">
            Factura guardada
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={!hasChanges || isPending}
        className="w-full h-8 flex items-center justify-center rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors"
      >
        {isPending ? <Spinner className="size-4" /> : "Guardar factura"}
      </button>
    </form>
  );
};

// ── DetailPanel ──────────────────────────────────────────────────────────────────

const DetailPanel = ({ payment }) => {
  {
    console.log(payment);
  }
  const statusCls =
    STATUS_CLASSES[payment?.status] ??
    "bg-[rgba(25,54,63,0.06)] text-[#19363F]";

  return (
    <div className="flex flex-col gap-4 p-4">
      <Field
        label="Payment ID"
        classLabel={LABEL_CLS}
        value={payment?._id || "—"}
        copy={payment?._id}
        readOnly
        mono
      />
      <Field
        label="ID de Factura (Externo)"
        classLabel={LABEL_CLS}
        value={payment?.paymentId || "—"}
        copy={payment?.paymentId}
        readOnly
        mono
      />
      <Field
        label="Número de Factura Interno"
        classLabel={LABEL_CLS}
        value={payment?.invoiceNumber || "—"}
        readOnly
        mono
      />
      <Field
        label="Cliente"
        classLabel={LABEL_CLS}
        value={payment?.name || "—"}
        readOnly
      />

      <Field
        label="Email"
        classLabel={LABEL_CLS}
        value={payment?.user?.email || "—"}
        copy={payment?.user?.email}
        readOnly
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Método de Pago"
          classLabel={LABEL_CLS}
          classInput="capitalize"
          value={payment?.type || payment?.method || "—"}
          readOnly
        />
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
            Estado
          </span>
          <div className="flex h-8 px-2.5 items-center rounded-lg bg-[rgba(25,54,63,0.03)] border-[0.7px] border-[rgba(25,54,63,0.06)]">
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-sm font-inter text-[10px] font-medium tracking-[-0.4px] capitalize",
                statusCls,
              )}
            >
              {payment?.status || "—"}
            </span>
          </div>
        </div>
      </div>

      {payment?.tokenId && (
        <Field
          label="Token ID (FOUNDER Nº)"
          classLabel={LABEL_CLS}
          classInput="font-semibold text-[#19363F]"
          value={`#${payment.tokenId}`}
          readOnly
        />
      )}

      {payment?.wallet && (
        <Field
          label="Wallet Address"
          classLabel={LABEL_CLS}
          value={payment.wallet}
          copy={payment.wallet}
          readOnly
          mono
        />
      )}

      {payment?.txHash && (
        <Field
          label="Transaction Hash"
          classLabel={LABEL_CLS}
          value={payment.txHash}
          copy={payment.txHash}
          readOnly
          mono
        />
      )}

      <Field
        label="Fecha de Pago"
        classLabel={LABEL_CLS}
        value={formatDate(payment?.createdAt)}
        readOnly
      />
      <Field
        label="Última Actualización"
        classLabel={LABEL_CLS}
        value={formatDate(payment?.updatedAt)}
        readOnly
      />
    </div>
  );
};

// ── InvoiceDetailSidebar ──────────────────────────────────────────────────────────

const InvoiceDetailSidebar = ({
  payment,
  mode: initialMode = "edit",
  onClose,
}) => {
  const panelRef = useRef(null);
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Parent wrapper handles the width expansion — just fade the content in once
  // the panel is partially open (delay lets the wrapper open first).
  useGSAP(
    () => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, delay: 0.14, ease: "power2.out" },
      );
    },
    { scope: panelRef },
  );

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            {payment?.invoiceNumber || payment?.name || "Factura"}
          </p>
          <p className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.4)] truncate">
            {payment?.tokenId ? `NFT #${payment.tokenId}` : payment?._id}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="size-6 shrink-0 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.06)] hover:text-[#19363F] transition-colors mt-0.5"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8.5 1.5l-7 7M1.5 1.5l7 7"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "edit", label: "Editar" },
          { id: "preview", label: "Detalle" },
        ]}
        value={mode}
        onChange={setMode}
        className="px-4"
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        {mode === "edit" ? (
          <EditPanel payment={payment} />
        ) : (
          <DetailPanel payment={payment} />
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailSidebar;
