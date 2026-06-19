"use client";

import { useRef, useState, useEffect } from "react";
import SelectDropdown from "@/components/SelectDropdown";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/utils";
import { useEditUserInfo } from "@/hooks/admin/useEditUserInfo";
import { useSetRole } from "@/hooks/admin/useSetRole";
import Tabs from "@/components/Tabs";
import Field from "@/components/Field";

gsap.registerPlugin(useGSAP);

const parsePaymentInfo = (dataStr) => {
  try {
    const d = JSON.parse(dataStr ?? "{}");
    if (d?.moonpay?.normalizedPrice)
      return { amount: `${d.moonpay.normalizedPrice} EUR` };
    if (d?.stripe?.paymentLink?.url) return { url: d.stripe.paymentLink.url };
    if (d?.transfer?.reference) return { ref: d.transfer.reference };
    return {};
  } catch (_e) {
    return {};
  }
};

const STATUS_CLASSES = {
  completed: "bg-emerald-50 text-emerald-700",
  generated: "bg-amber-50 text-amber-700",
  pending: "bg-sky-50 text-sky-700",
};

// ── PaymentCard ────────────────────────────────────────────────────────────────

const PaymentCard = ({ payment }) => {
  const info = parsePaymentInfo(payment.data);
  const statusCls =
    STATUS_CLASSES[payment.status] ?? "bg-[rgba(25,54,63,0.06)] text-[#19363F]";

  return (
    <div className="flex flex-col gap-2 p-3 rounded-[10px] border-[0.7px] border-[rgba(25,54,63,0.08)] bg-[rgba(25,54,63,0.01)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[rgba(25,54,63,0.06)] font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.7)]">
            {payment.type}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-sm font-inter text-[10px] font-medium tracking-[-0.4px]",
              statusCls,
            )}
          >
            {payment.status}
          </span>
        </div>
        {info.amount && (
          <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F] tabular-nums">
            {info.amount}
          </span>
        )}
      </div>

      {payment.name && (
        <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.65)]">
          {payment.name}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          {new Date(payment.createdAt).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        {payment.invoiceNumber && (
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.55)]">
            {payment.invoiceNumber}
          </span>
        )}
      </div>

      {payment.tokenId && (
        <div className="flex items-center gap-2 pt-1.5 border-t-[0.7px] border-[rgba(25,54,63,0.07)]">
          <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.5)]">
            NFT #{payment.tokenId}
          </span>
          {payment.txHash && (
            <span className="font-mono text-[9px] text-[rgba(25,54,63,0.35)] truncate">
              {payment.txHash.slice(0, 12)}…
            </span>
          )}
        </div>
      )}

      {info.ref && (
        <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
          Ref: {info.ref}
        </p>
      )}

      {info.url && (
        <a
          href={info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-inter text-[10px] tracking-[-0.4px] text-blue-600 hover:underline truncate block"
        >
          Ver enlace de pago →
        </a>
      )}
    </div>
  );
};

// ── PaymentsPanel ──────────────────────────────────────────────────────────────

const PaymentsPanel = ({ payments }) => {
  const sorted = [...payments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            stroke="rgba(25,54,63,0.2)"
            strokeWidth="1.5"
          />
          <path
            d="M2 10h20"
            stroke="rgba(25,54,63,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.35)]">
          Sin pagos registrados
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
        {sorted.length} pago{sorted.length !== 1 ? "s" : ""}
      </p>
      {sorted.map((payment) => (
        <PaymentCard key={payment._id} payment={payment} />
      ))}
    </div>
  );
};

// ── EditPanel ──────────────────────────────────────────────────────────────────

const EditPanel = ({ user }) => {
  const [phone, setPhone] = useState(user.phoneNumber ?? "");
  const [roleValue, setRoleValue] = useState(user.role ?? "");

  const { mutate: editUserInfo, isPending: savingInfo } = useEditUserInfo();
  const { mutate: changeRole, isPending: savingRole } = useSetRole();

  const isSaving = savingInfo || savingRole;
  const hasChanges =
    phone !== (user.phoneNumber ?? "") || roleValue !== (user.role ?? "");

  const handleSave = () => {
    if (phone !== (user.phoneNumber ?? "")) {
      editUserInfo({ userId: user._id, phoneNumber: phone });
    }
    if (roleValue !== (user.role ?? "") && user.email) {
      changeRole({ email: user.email, role: roleValue });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Read-only */}
      <Field
        label="Email"
        value={user.email || "—"}
        copy={user.email}
        readOnly
      />

      <Field
        label="Wallet"
        value={user.address || "—"}
        copy={user.address}
        readOnly
        mono
      />

      {/* Editable */}
      <Field
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+34 600 000 000"
      />

      <div className="flex flex-col gap-1">
        <span className="font-inter text-[10px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.4)] uppercase">
          Rol
        </span>
        <SelectDropdown
          value={roleValue}
          onChange={setRoleValue}
          options={[
            { value: "User", label: "User" },
            { value: "Admin", label: "Admin" },
          ]}
        />
      </div>

      <div className="pt-1">
        <button
          type="button"
          disabled={!hasChanges || isSaving}
          onClick={handleSave}
          className="w-full h-8 rounded-lg bg-[#19363F] text-white font-inter text-[12px] font-medium tracking-[-0.48px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f2228] transition-colors"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
};

// ── UserDetailSidebar ──────────────────────────────────────────────────────────

const UserDetailSidebar = ({ user, mode: initialMode = "edit", onClose }) => {
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

  const payments = user.payments ?? [];

  return (
    <div
      ref={panelRef}
      className="flex flex-col w-full h-full bg-white rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b-[0.7px] border-[rgba(25,54,63,0.08)] shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-inter font-semibold text-[12px] tracking-[-0.48px] text-[#19363F] truncate">
            {user.email}
          </p>
          <p className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.4)] truncate">
            {user.address
              ? `${user.address.slice(0, 8)}…${user.address.slice(-6)}`
              : "—"}
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
          { id: "payments", label: `Pagos (${payments.length})` },
        ]}
        value={mode}
        onChange={setMode}
        className="px-4"
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(25,54,63,0.1)] scrollbar-thumb-rounded scrollbar-track-transparent">
        {mode === "edit" ? (
          <EditPanel user={user} />
        ) : (
          <PaymentsPanel payments={payments} />
        )}
      </div>
    </div>
  );
};

export default UserDetailSidebar;
