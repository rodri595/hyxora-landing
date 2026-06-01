"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import UserDetailSidebar from "@/components/UserDetailSidebar";
import { cn } from "@/utils";

gsap.registerPlugin(useGSAP);

const SIDEBAR_WIDTH = 320;

const UsersModule = () => {
  const { data, isLoading, isError } = useGetAllUsers();
  const rows = useMemo(() => data ?? [], [data]);

  // `isOpen` drives animations. `displayedUser` persists through the close
  // animation so content doesn't vanish mid-collapse.
  const [isOpen, setIsOpen] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(null);
  const [sidebarMode, setSidebarMode] = useState("edit");

  // Desktop (lg+): inline wrapper whose width GSAP animates so DataTable shrinks smoothly.
  const desktopWrapRef = useRef(null);
  // Mobile/tablet (<lg): fixed overlay panel + backdrop.
  const mobileWrapRef = useRef(null);
  const backdropRef = useRef(null);

  const onSelectUser = useCallback((user, mode) => {
    setDisplayedUser(user);
    setSidebarMode(mode);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

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
          onComplete: () => setDisplayedUser(null),
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
          onComplete: () => setDisplayedUser(null),
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
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">
            {info.getValue() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Teléfono",
        cell: (info) => (
          <span className="font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {info.getValue() ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "address",
        header: "Wallet",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
          return (
            <span className="font-mono text-[10px] text-[rgba(25,54,63,0.65)] tracking-tight">
              {val.slice(0, 6)}…{val.slice(-4)}
            </span>
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
              {new Date(val).toLocaleDateString("es-ES", {
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
      <div className="flex flex-col flex-1 w-0">
        <DataTable
          data={rows}
          columns={columns}
          filename="usuarios"
          title="Usuarios"
          searchPlaceholder="Buscar por email, wallet..."
        />
      </div>

      {/* ── Desktop (lg+): inline wrapper — GSAP animates its width ── */}
      <div
        ref={desktopWrapRef}
        style={{ width: 0, marginLeft: 0 }}
        className="hidden lg:block shrink-0 overflow-hidden"
      >
        {displayedUser && (
          <UserDetailSidebar
            key={displayedUser._id}
            user={displayedUser}
            mode={sidebarMode}
            onClose={handleClose}
          />
        )}
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
        {displayedUser && (
          <UserDetailSidebar
            key={displayedUser._id}
            user={displayedUser}
            mode={sidebarMode}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default UsersModule;
