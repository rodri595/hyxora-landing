"use client";

import DataTable from "@/components/DataTable";
import { fromMinorUnits } from "@/constants/appApi";
import { useGetMemberships } from "@/hooks/appApi/useGetMemberships";
import { formatMoney } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import StatusBadge from "../../shared/StatusBadge";

const columns = [
  {
    accessorKey: "name",
    header: "Plan",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
  },
  {
    accessorKey: "price",
    header: "Precio",
    meta: { align: "right" },
    cell: (info) => {
      const { price, currency } = info.row.original;
      return (
        <span className="font-medium tabular-nums text-[#19363F]">
          {formatMoney(price, currency, { decimals: 2 })}
        </span>
      );
    },
  },
  {
    accessorKey: "interval",
    header: "Ciclo",
    cell: (info) => (
      <span className="text-[rgba(25,54,63,0.65)]">
        {info.getValue() === "year" ? "Anual" : "Mensual"}
      </span>
    ),
  },
  {
    accessorKey: "stripeProductId",
    header: "Producto de Stripe",
    cell: (info) => {
      const id = info.getValue();
      return id ? (
        <code className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.6)]">{id}</code>
      ) : (
        <span className="text-[rgba(25,54,63,0.3)]">Sin producto</span>
      );
    },
  },
  {
    accessorKey: "hasStripe",
    header: "Cobro",
    cell: (info) => (
      <StatusBadge active={info.getValue()} activeLabel="STRIPE" inactiveLabel="MANUAL" />
    ),
  },
];

/**
 * Plan pricing, from app-api's `/membership`.
 *
 * The plan list has drifted from the ported dashboard's four cards: there are
 * five tiers now, "FOUNDER" is "NFT Founder HYXORA", and "BUSINESS —
 * PRÓXIMAMENTE" is a placeholder that carries a real price. Rendered as a table
 * rather than cards so a sixth tier doesn't break the layout.
 *
 * Prices arrive in minor units (1900 → €19.00) and currency varies per plan —
 * EUR for the paid tiers, USD for Staff — so each row formats with its own.
 */
const PlanesPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMemberships();

  const rows = useMemo(
    () =>
      (data ?? []).map((plan) => ({
        ...plan,
        price: fromMinorUnits(plan.price),
        hasStripe: Boolean(plan.stripeProductId),
      })),
    [data]
  );

  return (
    <Panel
      title="Planes"
      description="Precio, ciclo de cobro y producto de Stripe de cada membresía, según la app."
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel="No hay membresías registradas."
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="planes"
          searchPlaceholder="Buscar plan..."
          initialSorting={[{ id: "price", desc: true }]}
          enableSelection={false}
          bare
          dense
        />

        <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
          Un plan sin producto de Stripe no se cobra por Stripe — es asignación manual, como Staff
          Member. La moneda varía por plan, así que la columna de precio no se suma.
        </p>
      </QueryState>
    </Panel>
  );
};

export default PlanesPanel;
