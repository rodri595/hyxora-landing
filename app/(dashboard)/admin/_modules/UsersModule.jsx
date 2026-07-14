"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import InvoiceDetailSidebar from "@/components/InvoiceDetailSidebar";
import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import UserDetailSidebar from "@/components/UserDetailSidebar";
import { useGetAllPayments } from "@/hooks/admin/useGetAllPayments";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import { useGetAllPolls } from "@/hooks/poll/useGetAllPolls";
import { useGetAllSimUsers } from "@/hooks/simulator/useGetAllSimUsers";
import { useGetSimAccount } from "@/hooks/simulator/useGetSimAccount";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useMemo, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

const TABS = [
  { id: "all", label: "Todos los usuarios" },
  { id: "nft-buyers", label: "Compradores NFT" },
];

// Simulator status badge — "active" (whitelisted) vs "suspended" (no access).
const SIM_STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]",
};
const SIM_STATUS_LABEL = { active: "Activo", suspended: "Sin acceso" };

// Sim money is stored as integer cents.
const formatCents = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);

const UsersModule = () => {
  const { data, isLoading, isError } = useGetAllUsers();
  const { data: allPayments, isLoading: isLoadingPayments } = useGetAllPayments();
  const { data: allPolls } = useGetAllPolls();
  const { data: simUsersData } = useGetAllSimUsers();
  const { data: simAccount } = useGetSimAccount();
  // Sim columns/tabs are only shown to viewers who are admins on the simulator backend.
  const isSimAdmin = simAccount?.user?.role === "admin";
  const rows = useMemo(() => data ?? [], [data]);
  const [activeTab, setActiveTab] = useState("all");

  // Main-backend users and sim users share no id — email is the join key, with
  // the wallet address as a fallback. Key the lookup by both (lowercased).
  const simByKey = useMemo(() => {
    const map = {};
    if (!Array.isArray(simUsersData)) return map;
    for (const su of simUsersData) {
      const em = su?.email?.toLowerCase?.();
      const w = su?.wallet?.toLowerCase?.();
      if (em) map[em] = su;
      if (w && !map[w]) map[w] = su;
    }
    return map;
  }, [simUsersData]);

  const getSimForUser = useCallback(
    (user) => {
      if (!user) return null;
      const em = user?.email?.toLowerCase?.();
      const w = user?.address?.toLowerCase?.();
      return (em && simByKey[em]) || (w && simByKey[w]) || null;
    },
    [simByKey]
  );

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
            p?.email?.toLowerCase() === user?.email?.toLowerCase())
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
      if (payment?.status !== "completed" || matchedPaymentIds.has(payment._id)) continue;
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
    [activeTab]
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
          if (!val || val === "N/A") return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
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
          if (!val || val === "N/A") return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
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
          if (!val || val === "N/A") return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
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
                    : "bg-[rgba(25,54,63,0.06)] text-[#19363F]"
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
                count > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.25)]"
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
    [onSelectInvoice]
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
    { dependencies: [isOpen] }
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
    { dependencies: [isOpen] }
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
          if (!role) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.4px]",
                role === "Admin"
                  ? "bg-[#19363F] text-white"
                  : "bg-[rgba(25,54,63,0.06)] text-[#19363F]"
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
                count > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.25)]"
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
      ...(isSimAdmin
        ? [
            {
              id: "simStatus",
              header: "Sim estado",
              size: 96,
              accessorFn: (row) => {
                const sim = getSimForUser(row);
                return sim ? (SIM_STATUS_LABEL[sim.status] ?? sim.status) : "—";
              },
              cell: (info) => {
                const label = info.getValue();
                if (label === "—") return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
                const sim = getSimForUser(info.row.original);
                const cls = SIM_STATUS_STYLES[sim?.status] ?? SIM_STATUS_STYLES.suspended;
                return (
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px] border",
                      cls
                    )}
                  >
                    {label}
                  </span>
                );
              },
            },
            {
              id: "simBalance",
              header: "Sim balance",
              size: 100,
              accessorFn: (row) => {
                const sim = getSimForUser(row);
                return sim ? (sim.cashBalanceCents ?? 0) : null;
              },
              cell: (info) => {
                const val = info.getValue();
                if (val === null || val === undefined)
                  return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
                return (
                  <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F]">
                    {formatCents(val)}
                  </span>
                );
              },
            },
            {
              id: "simTxs",
              header: "Sim txs",
              size: 72,
              accessorFn: (row) => {
                const sim = getSimForUser(row);
                return sim ? (sim.txCount ?? 0) : null;
              },
              cell: (info) => {
                const val = info.getValue();
                if (val === null || val === undefined)
                  return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
                return (
                  <span
                    className={cn(
                      "font-inter text-[11px] font-semibold tabular-nums",
                      val > 0 ? "text-[#19363F]" : "text-[rgba(25,54,63,0.25)]"
                    )}
                  >
                    {val}
                  </span>
                );
              },
            },
          ]
        : []),
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
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
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
    [onSelectUser, getSimForUser, isSimAdmin]
  );

  const displayedSimUser = getSimForUser(displayedUser);

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
        <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} className="mb-3" />

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
            simUser={displayedSimUser}
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
            simUser={displayedSimUser}
            mode={sidebarMode}
            onClose={handleClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default UsersModule;
