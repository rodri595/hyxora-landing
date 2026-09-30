"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";
import Tabs from "@/components/Tabs";
import { useGetAllSimTransactions } from "@/hooks/simulator/useGetAllSimTransactions";
import { useGetAllSimUsers } from "@/hooks/simulator/useGetAllSimUsers";
import { useUpdateSimUser } from "@/hooks/simulator/useUpdateSimUser";
import { cn } from "@/utils";
import { useCallback, useMemo, useState } from "react";

// ── Views ────────────────────────────────────────────────────────────────────

const VIEWS = [
  { id: "transactions", label: "Transacciones" },
  { id: "users", label: "Usuarios" },
];

// ── Badge styles (shared visual language with the other admin modules) ─────────

const SIM_STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.1)]",
};
const SIM_STATUS_LABEL = { active: "Activo", suspended: "Sin acceso" };

const TX_TYPE_STYLES = {
  buy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sell: "bg-red-50 text-red-700 border-red-200",
};
const TX_TYPE_LABEL = { buy: "Compra", sell: "Venta" };

// ── Formatters ────────────────────────────────────────────────────────────────

// Sim money is stored as integer cents.
const formatCents = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);

// priceUsd is a plain USD amount (not cents).
const formatUsd = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));

const formatUnits = (value) =>
  Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 8 });

const truncateMiddle = (value) => (value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "—");

// ── Shared bits ────────────────────────────────────────────────────────────────

const Badge = ({ className, children }) => (
  <span
    className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.3px] border",
      className
    )}
  >
    {children}
  </span>
);

const Dash = () => <span className="text-[rgba(25,54,63,0.3)]">—</span>;

// Email when present, otherwise a truncated wallet/DID with a copy button.
const IdentityCell = ({ email, fallback }) => {
  if (email) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="font-inter text-[11px] tracking-[-0.44px] text-[#19363F]">{email}</span>
        <CopyButton text={email} />
      </div>
    );
  }
  if (!fallback) return <Dash />;
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] text-[rgba(25,54,63,0.65)] tracking-tight">
        {truncateMiddle(fallback)}
      </span>
      <CopyButton text={fallback} />
    </div>
  );
};

// ── Module ───────────────────────────────────────────────────────────────────

const SimulatorModule = () => {
  const [view, setView] = useState("transactions");
  const [pendingId, setPendingId] = useState(null);

  const { data: txData, isLoading: txLoading } = useGetAllSimTransactions();
  const { data: simUsers, isLoading: usersLoading } = useGetAllSimUsers();
  const { mutate: updateSimUser } = useUpdateSimUser();

  const transactions = useMemo(() => txData?.transactions ?? [], [txData]);
  const users = useMemo(() => (Array.isArray(simUsers) ? simUsers : []), [simUsers]);

  const handleToggleStatus = useCallback(
    (simUser) => {
      const next = simUser.status === "active" ? "suspended" : "active";
      setPendingId(simUser.id);
      updateSimUser({ id: simUser.id, status: next }, { onSettled: () => setPendingId(null) });
    },
    [updateSimUser]
  );

  // ── Transactions columns ──
  const txColumns = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Fecha",
        size: 132,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <Dash />;
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
        id: "usuario",
        header: "Usuario",
        accessorFn: (row) => row.userEmail || row.userWallet || row.userId || "",
        cell: ({ row }) => (
          <IdentityCell
            email={row.original.userEmail}
            fallback={row.original.userWallet || row.original.userId}
          />
        ),
      },
      {
        accessorKey: "type",
        header: "Tipo",
        size: 84,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <Dash />;
          const cls =
            TX_TYPE_STYLES[val] ??
            "bg-[rgba(25,54,63,0.06)] text-[#19363F] border-[rgba(25,54,63,0.1)]";
          return <Badge className={cls}>{TX_TYPE_LABEL[val] ?? val}</Badge>;
        },
      },
      {
        accessorKey: "symbol",
        header: "Símbolo",
        size: 90,
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <Dash />;
          return (
            <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-[#19363F]">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "amountCents",
        header: "Monto",
        size: 96,
        cell: (info) => (
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F]">
            {formatCents(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "units",
        header: "Unidades",
        size: 96,
        cell: (info) => (
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.7)]">
            {formatUnits(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "priceUsd",
        header: "Precio",
        size: 96,
        cell: (info) => (
          <span className="font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.6)]">
            {formatUsd(info.getValue())}
          </span>
        ),
      },
    ],
    []
  );

  // ── Users columns ──
  const userColumns = useMemo(
    () => [
      {
        id: "usuario",
        header: "Usuario",
        accessorFn: (row) => row.email || row.wallet || row.id || "",
        cell: ({ row }) => (
          <IdentityCell
            email={row.original.email}
            fallback={row.original.wallet || row.original.id}
          />
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        size: 80,
        cell: (info) => {
          const role = info.getValue();
          if (!role) return <Dash />;
          return (
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-[5px] font-inter text-[10px] font-medium tracking-[-0.4px]",
                role === "admin"
                  ? "bg-[#19363F] text-white"
                  : "bg-[rgba(25,54,63,0.06)] text-[#19363F]"
              )}
            >
              {role === "admin" ? "Admin" : "User"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        size: 96,
        cell: (info) => {
          const val = info.getValue();
          const cls = SIM_STATUS_STYLES[val] ?? SIM_STATUS_STYLES.suspended;
          return <Badge className={cls}>{SIM_STATUS_LABEL[val] ?? val}</Badge>;
        },
      },
      {
        accessorKey: "cashBalanceCents",
        header: "Balance",
        size: 100,
        cell: (info) => (
          <span className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F]">
            {formatCents(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: "txCount",
        header: "Txs",
        size: 64,
        cell: (info) => {
          const count = info.getValue() ?? 0;
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
        size: 104,
        cell: ({ row }) => {
          const simUser = row.original;
          const isActive = simUser.status === "active";
          const isPending = pendingId === simUser.id;
          return (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggleStatus(simUser)}
              className={cn(
                "inline-flex items-center h-6 px-2 rounded-md border-[0.7px] font-inter text-[10px] font-medium tracking-[-0.3px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                isActive
                  ? "border-[rgba(25,54,63,0.12)] text-[rgba(25,54,63,0.6)] hover:bg-[rgba(25,54,63,0.04)] hover:text-[#19363F]"
                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              )}
            >
              {isPending ? "..." : isActive ? "Desactivar" : "Activar"}
            </button>
          );
        },
      },
    ],
    [handleToggleStatus, pendingId]
  );

  const isTransactions = view === "transactions";
  const isLoading = isTransactions ? txLoading : usersLoading;

  return (
    <div className="flex flex-row flex-1 min-h-0 overflow-hidden h-full">
      <div className="flex flex-col flex-1 w-0 min-h-0 rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)] px-4 py-3 overflow-hidden">
        <Tabs tabs={VIEWS} value={view} onChange={setView} className="mb-3" />

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : isTransactions ? (
          <DataTable
            data={transactions}
            columns={txColumns}
            filename="simulador-transacciones"
            title="Transacciones"
            searchPlaceholder="Buscar por usuario, símbolo, tipo..."
          />
        ) : (
          <DataTable
            data={users}
            columns={userColumns}
            filename="simulador-usuarios"
            title="Usuarios del simulador"
            searchPlaceholder="Buscar por email, wallet, rol..."
          />
        )}
      </div>
    </div>
  );
};

export default SimulatorModule;
