"use client";

import { useMemo } from "react";
import { useGetAllUsers } from "@/hooks/admin/useGetAllUsers";
import DataTable from "@/components/DataTable";
import Spinner from "@/components/Spinner";

const columns = [
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      return (
        <span className="font-mono text-[11px]">
          {val.slice(0, 6)}…{val.slice(-4)}
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue() ?? "—",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: (info) => {
      const role = info.getValue();
      if (!role) return <span className="text-[rgba(25,54,63,0.35)]">—</span>;
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-[rgba(25,54,63,0.06)] font-inter text-[10px] font-medium tracking-[-0.4px] text-[#19363F]">
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registro",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      return new Date(val).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
];

const UsersModule = () => {
  const { data, isLoading, isError } = useGetAllUsers();
  const rows = useMemo(() => data ?? [], [data]);

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
    <>
      <div className="flex flex-col flex-1 gap-[16px] ">
        <DataTable
          data={rows}
          columns={columns}
          filename="usuarios"
          title="Usuarios"
          searchPlaceholder="Buscar por wallet, email..."
        />
      </div>
      {/* //sidebar activity/// */}
      <div className="flex flex-col  max-w-[320px] shrink-0 w-full">s</div>
    </>
  );
};

export default UsersModule;
