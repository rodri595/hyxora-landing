"use client";

import DataTable from "@/components/DataTable";
import { appApiFeeActionLabels, bpsToPercent, fromMinorUnits } from "@/constants/appApi";
import { useGetFeeSchema } from "@/hooks/appApi/useGetFeeSchema";
import { cn } from "@/utils";
import { formatPercent, formatUsd } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";

/**
 * One cell of the matrix.
 *
 * The three states are deliberately distinct: a combination with no fee row at
 * all renders "—", a row at `feeBps: 0` renders "0%" (the operation is free, and
 * that is a decision someone made), and an inactive row renders greyed with its
 * value still visible so a disabled fee can be reviewed rather than hidden.
 */
const FeeCell = ({ cell }) => {
  if (!cell) return <span className="text-[rgba(25,54,63,0.25)]">—</span>;

  const { percent, min, max, isActive } = cell;
  const bounds = [
    min ? `mín ${formatUsd(min, { decimals: 2 })}` : null,
    max ? `máx ${formatUsd(max, { decimals: 2 })}` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-medium tabular-nums",
          isActive ? "text-[#19363F]" : "text-[rgba(25,54,63,0.35)] line-through"
        )}
      >
        {formatPercent(percent)}
      </span>
      {bounds.length > 0 && (
        <span className="font-inter text-[9px] tracking-[-0.36px] text-[rgba(25,54,63,0.45)]">
          {bounds.join(" · ")}
        </span>
      )}
    </div>
  );
};

/**
 * Fee schema pivoted to plan × operation, from app-api's `/admin/fees`.
 *
 * The API returns one flat row per combination; the pivot happens here. Columns
 * are derived from the plans actually present rather than hard-coded, because
 * only the plans that charge something appear — Staff Member and BUSINESS have
 * no fee rows at all, so pinning four columns would leave two permanently empty.
 *
 * Amounts arrive in minor units (`minAmount: 50` → $0.50) and the rate in basis
 * points (`feeBps: 20` → 0.20%).
 */
const FeeMatrixPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetFeeSchema();

  const { rows, plans } = useMemo(() => {
    const fees = data ?? [];

    // Preserve first-seen plan order — it tracks the tier order the API returns.
    const planNames = [];
    for (const fee of fees) {
      const name = fee?.membership?.name;
      if (name && !planNames.includes(name)) planNames.push(name);
    }

    const byAction = new Map();
    for (const fee of fees) {
      const planName = fee?.membership?.name;
      if (!planName) continue;

      if (!byAction.has(fee.action)) {
        byAction.set(fee.action, {
          action: fee.action,
          operation: appApiFeeActionLabels[fee.action] ?? fee.action,
        });
      }

      byAction.get(fee.action)[planName] = {
        percent: bpsToPercent(fee.feeBps),
        min: fromMinorUnits(fee.minAmount),
        max: fromMinorUnits(fee.maxAmount),
        isActive: fee.isActive !== false,
      };
    }

    return { rows: [...byAction.values()], plans: planNames };
  }, [data]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "operation",
        header: "Operación",
        cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
      },
      ...plans.map((plan) => ({
        id: plan,
        accessorFn: (row) => row[plan]?.percent ?? null,
        header: plan,
        meta: { align: "right" },
        cell: (info) => <FeeCell cell={info.row.original[plan]} />,
      })),
    ],
    [plans]
  );

  const definedCells = useMemo(
    () => rows.reduce((total, row) => total + plans.filter((p) => row[p]).length, 0),
    [rows, plans]
  );

  return (
    <Panel
      title="Matriz de comisiones"
      description={
        rows.length > 0
          ? `Qué comisión aplica cada plan a cada operación — ${definedCells} comisiones sobre ${plans.length} planes y ${rows.length} operaciones.`
          : "Qué comisión aplica cada plan a cada operación."
      }
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay comisiones configuradas."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="matriz-comisiones"
          searchPlaceholder="Buscar operación..."
          enableSelection={false}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          «—» significa que ese plan no tiene comisión definida para esa operación, que no es lo
          mismo que 0%: una transferencia interna a 0% es gratuita a propósito. Las comisiones
          desactivadas salen tachadas en gris. Los planes sin ninguna comisión (Staff Member,
          BUSINESS) no aparecen como columna.
        </p>
      </QueryState>
    </Panel>
  );
};

export default FeeMatrixPanel;
