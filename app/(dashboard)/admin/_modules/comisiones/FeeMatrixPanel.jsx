"use client";

import DataTable from "@/components/DataTable";
import { useGetFeeSchema } from "@/hooks/admin/useGetFeeSchema";
import { formatPercent, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../shared/Panel";
import QueryState from "../shared/QueryState";
import StatusBadge from "../shared/StatusBadge";
import { buildFeeMatrix, normalizeFees, normalizePlans } from "./normalize";

/** One plan's fee for one operation: rate on top, bounds underneath. */
const FeeCell = ({ fee }) => {
  if (!fee) {
    return <span className="font-inter text-[10px] italic text-[rgba(25,54,63,0.3)]">no row</span>;
  }

  return (
    <div className="flex items-start justify-between gap-2 min-w-[150px]">
      <div className="flex flex-col gap-0.5">
        <span className="font-inter text-[12px] font-medium tabular-nums text-[#19363F]">
          {formatPercent(fee.percent)}
        </span>
        <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)]">
          min {formatUsd(fee.minUsd)} · max {fee.maxUsd === null ? "∞" : formatUsd(fee.maxUsd)}
        </span>
      </div>
      <StatusBadge active={fee.active} />
    </div>
  );
};

const FeeMatrixPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeeSchema();

  const { fees, matrix } = useMemo(() => {
    const parsedFees = normalizeFees(data);
    // Plans are parsed only to fix column order — the matrix carries the names.
    const parsedPlans = normalizePlans(data);
    return {
      fees: parsedFees,
      matrix: buildFeeMatrix(parsedFees, parsedPlans),
    };
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "label",
        header: "Operación",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
      },
      // One column per plan. Sorting a plan column sorts by its rate, which is
      // the useful question ("where do we charge most?").
      ...matrix.planNames.map((planName) => ({
        id: planName,
        header: planName,
        accessorFn: (row) => row[planName]?.percent ?? null,
        meta: { label: planName },
        cell: ({ row }) => <FeeCell fee={row.original[planName]} />,
      })),
    ],
    [matrix.planNames]
  );

  return (
    <Panel
      title="Matriz de comisiones"
      description="Comisión aplicada por cada plan a cada operación. Las filas sin datos («no row») son combinaciones que el backend no define — no son 0%, simplemente no existen."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && matrix.rows.length === 0}
        emptyLabel="El endpoint no devolvió comisiones."
      >
        <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mb-2">
          {fees.length} comisiones · {matrix.planNames.length} planes · {matrix.rows.length} ops
        </p>

        <DataTable
          data={matrix.rows}
          columns={columns}
          filename="hyxora-matriz-comisiones"
          searchPlaceholder="Buscar operación..."
          enableSelection={false}
          enableColumnToggle
          enableExport={false}
          bare
          dense
          emptyLabel="Sin comisiones."
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2.5">
          Los porcentajes se muestran tal cual los devuelve el backend. Export deshabilitado en esta
          tabla: las celdas son objetos, así que un CSV plano no diría nada — usa el JSON de
          «Planes» si necesitas los datos crudos.
        </p>
      </QueryState>
    </Panel>
  );
};

export default FeeMatrixPanel;
