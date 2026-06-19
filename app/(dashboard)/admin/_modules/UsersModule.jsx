"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import { useGetAllPayments } from "@/hooks/admin/useGetAllPayments";
import { useGetAllPolls } from "@/hooks/poll/useGetAllPolls";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import UserDetailSidebar from "@/components/UserDetailSidebar";
import InvoiceDetailSidebar from "@/components/InvoiceDetailSidebar";
import { cn, copyToClipboard } from "@/utils";
import Tabs from "@/components/Tabs";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 flex items-center justify-center size-5 rounded-md transition-colors hover:bg-[rgba(25,54,63,0.08)]"
      style={{ background: "rgba(25,54,63,0.05)" }}
      title="Copiar"
    >
      {copied ? (
        <svg width="10" height="10" viewBox="0 0 12 10" fill="none">
          <title>Copiado</title>
          <path
            d="M1 5L4.5 8.5L11 1"
            stroke="#16a34a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <title>Copiar</title>
          <rect
            x="5"
            y="5"
            width="9"
            height="9"
            rx="1.5"
            stroke="rgba(25,54,63,0.40)"
            strokeWidth="1.5"
          />
          <path
            d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
            stroke="rgba(25,54,63,0.40)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

const TABS = [
  { id: "all", label: "Todos los usuarios" },
  { id: "nft-buyers", label: "Compradores NFT" },
];

const UsersModule = () => {
  const { data, isLoading, isError } = useGetAllUsers();
  const { data: allPayments, isLoading: isLoadingPayments } =
    useGetAllPayments();
  const { data: allPolls } = useGetAllPolls();
  const rows = useMemo(() => data ?? [], [data]);
  const [activeTab, setActiveTab] = useState("all");

  // Build per-user vote counts from all polls
  const userVotesMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(allPolls)) return map;
    for (const poll of allPolls) {
      if (!Array.isArray(poll?.votes)) continue;
      for (const vote of poll.votes) {
        if (vote?.user) map[vote.user] = (map[vote.user] || 0) + 1;
      }
    }
    return map;
  }, [allPolls]);

  // Build flat buyers list from completed payments
  const buyers = useMemo(() => {
    if (!Array.isArray(allPayments) || !allPayments.length) return [];

    const buyersData = [];
    const matchedPaymentIds = new Set();

    // Users with matched completed payments
    for (const user of rows) {
      const userPayments = allPayments.filter(
        (p) =>
          p?.status === "completed" &&
          (p?.wallet?.toLowerCase() === user?.address?.toLowerCase() ||
            p?.email?.toLowerCase() === user?.email?.toLowerCase()),
      );
      for (const payment of userPayments) {
        matchedPaymentIds.add(payment._id);
        buyersData.push({
          ...user,
          payment,
          tokenId: payment?.tokenId || "N/A",
          nombre: payment?.name || user?.name || "N/A",
          email: user?.email || payment?.email || "N/A",
          fecha: payment?.createdAt,
          facturaId: payment?.invoiceNumber || "N/A",
          metodo: payment?.type || payment?.method || "N/A",
          monto: payment?.amount || payment?.total || payment?.price || 0,
          respuestas: userVotesMap[user?._id] || 0,
          isUnsynced: false,
        });
      }
    }

    // Orphaned payments (no matching user account)
    for (const payment of allPayments) {
      if (payment?.status !== "completed" || matchedPaymentIds.has(payment._id))
        continue;
      let parsedData = null;
      try {
        if (payment?.data) parsedData = JSON.parse(payment.data);
      } catch (_) {}
      buyersData.push({
        _id: `unsynced-${payment._id}`,
        payment,
        tokenId: payment?.tokenId || "N/A",
        nombre: payment?.name || parsedData?.transfer?.reference || "N/A",
        email: payment?.email || "N/A",
        fecha: payment?.createdAt,
        facturaId: payment?.invoiceNumber || "N/A",
        metodo: payment?.method || "N/A",
        monto: payment?.amount || payment?.total || payment?.price || 0,
        wallet: payment?.wallet,
        respuestas: 0,
        isUnsynced: true,
      });
    }

    // Count purchases per email
    const emailCount = {};
    for (const b of buyersData) {
      const em = b?.email?.toLowerCase();
      if (em && em !== "n/a") emailCount[em] = (emailCount[em] || 0) + 1;
    }
    for (const b of buyersData) {
      const em = b?.email?.toLowerCase();
      b.cantidadCompras = em && em !== "n/a" ? emailCount[em] : 1;
    }

    // Default tokenId sort (oldest first)
    buyersData.sort((a, b) => {
      const aId = a?.payment?.tokenId ?? "0";
      const bId = b?.payment?.tokenId ?? "0";
      return aId.localeCompare(bId, undefined, { numeric: true });
    });

    return buyersData;
  }, [rows, allPayments, userVotesMap]);

  // `isOpen` drives animations. `displayedUser`/`displayedPayment` persist
  // through the close animation so content doesn't vanish mid-collapse.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(null);
  const [displayedPayment, setDisplayedPayment] = useState(null);
  const [sidebarType, setSidebarType] = useState("user");
  const [sidebarMode, setSidebarMode] = useState("edit");

  const clearDisplayed = useCallback(() => {
    setDisplayedUser(null);
    setDisplayedPayment(null);
  }, []);

  // Desktop (lg+): inline wrapper whose width GSAP animates so DataTable shrinks smoothly.
  const desktopWrapRef = useRef(null);
  // Mobile/tablet (<lg): fixed overlay panel + backdrop.
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const onSelectUser = useCallback((user, mode) => {
    setDisplayedPayment(null);
    setSidebarType("user");
    setDisplayedUser(user);
    setSidebarMode(mode);
    setIsOpen(true);
  }, []);

  const onSelectInvoice = useCallback((payment, mode) => {
    setDisplayedUser(null);
    setSidebarType("invoice");
    setDisplayedPayment(payment);
    setSidebarMode(mode);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleTabChange = useCallback(
    (id) => {
      if (id === activeTab) return;
      setIsOpen(false);
      setActiveTab(id);
    },
    [activeTab],
  );

  const buyersColumns = useMemo(
    () => [
      {
        // id: "founderNumber",
        accessorKey: "tokenId",
        header: "#",
        size: 44,
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="font-inter text-[11px] font-semibold tabular-nums text-[rgba(25,54,63,0.35)]">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: (info) => {
          const val = info.getValue();
          const isUnsynced = info.row.original.isUnsynced;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
                {val}
              </span>
              {isUnsynced && (
                <span className="inline-flex items-center px-1 py-px rounded-[4px] bg-amber-50 text-amber-600 font-inter text-[9px] font-medium tracking-wide border border-amber-200">
                  sin cuenta
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => {
          const val = info.getValue();
          if (!val || val === "N/A")
            return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
                {val}
              </span>
              <CopyButton text={val} />
            </div>
          );
        },
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
              {new Date(val).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "facturaId",
        header: "Factura",
        cell: (info) => {
          const val = info.getValue();
          if (!val || val === "N/A")
            return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.65)]">
                {val}
              </span>
              <CopyButton text={val} />
            </div>
          );
        },
      },
      {
        accessorKey: "metodo",
        header: "Método",
        cell: (info) => {
          const val = info.getValue();
          if (!val || val === "N/A")
            return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          const label = val.toLowerCase();
          const isStripe = label.includes("stripe");
          const isMoonpay = label.includes("moonpay");
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px]",
                isStripe
                  ? "bg-violet-50 text-violet-700 border border-violet-200"
                  : isMoonpay
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-[rgba(25,54,63,0.06)] text-[#19363F]",
              )}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "cantidadCompras",
        header: "# Pagos",
        size: 72,
        cell: (info) => {
          const count = info.getValue();
          return (
            <span className="font-inter text-[11px] font-semibold tabular-nums text-[#19363F]">
              {count}
            </span>
          );
        },
      },
      {
        accessorKey: "respuestas",
        header: "# Encuestas",
        size: 88,
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
        size: 72,
        cell: ({ row }) => {
          const payment = row.original.payment;
          if (!payment) return null;
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Editar factura"
                onClick={() => onSelectInvoice(payment, "edit")}
                className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Ver detalle de factura"
                onClick={() => onSelectInvoice(payment, "preview")}
                className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectInvoice],
  );

  // ── Desktop animation (lg+): slide wrapper width ──────────────────────────
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
          onComplete: clearDisplayed,
        });
      }
    },
    { dependencies: [isOpen] },
  );

  // ── Mobile/tablet animation (<lg): overlay slide + backdrop fade ──────────
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
          onComplete: clearDisplayed,
        });
        gsap.to(backdrop, { opacity: 0, duration: 0.22, overwrite: true });
      }
    },
    { dependencies: [isOpen] },
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
                {val}
              </span>
              <CopyButton text={val} />
            </div>
          );
        },
      },
      {
        accessorKey: "phoneNumber",
        header: "Teléfono",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
                {val}
              </span>
              <CopyButton text={val} />
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: "SmartWallet",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[rgba(25,54,63,0.65)] tracking-tight">
                {val.slice(0, 6)}…{val.slice(-4)}
              </span>
              <CopyButton text={val} />
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: (info) => {
          const role = info.getValue();
          if (!role)
            return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.4px]",
                role === "Admin"
                  ? "bg-[#19363F] text-white"
                  : "bg-[rgba(25,54,63,0.06)] text-[#19363F]",
              )}
            >
              {role}
            </span>
          );
        },
      },
      {
        id: "paymentsCount",
        header: "Pagos",
        accessorFn: (row) => row.payments?.length ?? 0,
        cell: (info) => {
          const count = info.getValue();
          return (
            <span
              className={cn(
                "font-inter text-[11px] font-semibold tracking-[-0.44px] tabular-nums",
                count > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.25)]",
              )}
            >
              {count}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registro",
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
        id: "actions",
        header: "",
        enableSorting: false,
        size: 72,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Editar usuario"
                onClick={() => onSelectUser(user, "edit")}
                className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Ver historial de pagos"
                onClick={() => onSelectUser(user, "payments")}
                className="size-6 flex items-center justify-center rounded-md text-[rgba(25,54,63,0.4)] hover:bg-[rgba(25,54,63,0.08)] hover:text-[#19363F] transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M8 5v3.5l2 2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectUser],
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="font-inter text-[12px] text-[rgba(25,54,63,0.5)] tracking-[-0.48px]">
          Error al cargar usuarios.
        </p>
      </div>
    );

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden ">
        <Tabs
          tabs={TABS}
          value={activeTab}
          onChange={handleTabChange}
          className="mb-3"
        />

        {activeTab === "all" && (
          <DataTable
            data={rows}
            columns={columns}
            filename="usuarios"
            title="Usuarios"
            searchPlaceholder="Buscar por email, wallet..."
          />
        )}

        {activeTab === "nft-buyers" &&
          (isLoadingPayments ? (
            <div className="flex items-center justify-center flex-1">
              <Spinner />
            </div>
          ) : (
            <DataTable
              data={buyers}
              columns={buyersColumns}
              filename="compradores-nft"
              title="Compradores NFT"
              searchPlaceholder="Buscar por nombre, email, factura..."
            />
          ))}
      </div>

      {/* ── Desktop (lg+): inline wrapper — GSAP animates its width ── */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {sidebarType === "invoice" && displayedPayment ? (
          <InvoiceDetailSidebar
            key={displayedPayment._id}
            payment={displayedPayment}
            mode={sidebarMode}
            onClose={handleClose}
          />
        ) : displayedUser ? (
          <UserDetailSidebar
            key={displayedUser._id}
            user={displayedUser}
            mode={sidebarMode}
            onClose={handleClose}
          />
        ) : null}
      </div>

      {/* ── Mobile/tablet (<lg): backdrop ── */}
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

      {/* ── Mobile/tablet (<lg): overlay panel — GSAP animates translateX ── */}
      <div
        ref={mobileWrapRef}
        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(320px,100vw)] p-2"
        style={{ transform: "translateX(100%)" }}
      >
        {sidebarType === "invoice" && displayedPayment ? (
          <InvoiceDetailSidebar
            key={displayedPayment._id}
            payment={displayedPayment}
            mode={sidebarMode}
            onClose={handleClose}
          />
        ) : displayedUser ? (
          <UserDetailSidebar
            key={displayedUser._id}
            user={displayedUser}
            mode={sidebarMode}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default UsersModule;
