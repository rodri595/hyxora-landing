"use client";

import CopyButton from "@/components/CopyButton";
import DataTable from "@/components/DataTable";
import { formatMoney, toDayString } from "@/utils/format";
import { useMemo } from "react";
import TxLink from "../../../shared/TxLink";
import { pendingDeposits, toRampRow } from "./normalize";
import { EmptyBlock, Footnote, RampStatusBadge } from "./parts";

/**
 * Fiat, in the currency the bank actually used. Defaults to EUR because every SEPA
 * order is in euros, but the currency is read rather than assumed — the field is
 * there and hardcoding a symbol onto a figure is how a €10 order becomes a $10 one.
 *
 * @param {number | null} amount
 * @param {string | null} currency
 * @return {string}
 */
const formatFiat = (amount, currency) => {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return formatMoney(amount, currency || "EUR", { decimals: amount % 1 === 0 ? 0 : 2 });
};

const formatDay = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : toDayString(date);
};

/**
 * Amount cell, and the reason this table exists.
 *
 * A settled order shows what the bank moved. An unsettled one shows «esperado
 * €3.000» in amber — the user says they sent it, we have not received it. Those two
 * states must not render the same way: collapsing them into one "amount" is what
 * makes a stuck deposit look like a completed one, which is the exact complaint the
 * operator is trying to resolve.
 */
const AmountCell = ({ row }) => {
  if (row.hasSettled) {
    return (
      <span className="whitespace-nowrap font-inter text-[11px] font-medium tabular-nums tracking-[-0.44px] text-[#19363F]">
        {formatFiat(row.settledAmount, row.currency)}
      </span>
    );
  }

  if (row.expectedAmount) {
    return (
      <span className="whitespace-nowrap font-inter text-[11px] tabular-nums tracking-[-0.44px] text-amber-700">
        esperado {formatFiat(row.expectedAmount, row.currency)}
      </span>
    );
  }

  return <span className="text-[rgba(25,54,63,0.3)]">—</span>;
};

const columns = [
  {
    id: "direction",
    accessorKey: "direction",
    header: "Tipo",
    cell: (info) => {
      const direction = info.getValue();
      const label =
        direction === "onramp" ? "Depósito" : direction === "offramp" ? "Retirada" : "—";

      return (
        <span
          className={
            direction === "onramp"
              ? "font-inter text-[11px] font-medium tracking-[-0.44px] text-emerald-700"
              : direction === "offramp"
                ? "font-inter text-[11px] font-medium tracking-[-0.44px] text-red-600"
                : "text-[rgba(25,54,63,0.3)]"
          }
        >
          {label}
        </span>
      );
    },
  },
  {
    id: "orderId",
    accessorKey: "orderId",
    header: "ID de orden",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

      return (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.7)]">
            {value}
          </span>
          {/* The order id doubles as the bank reference the user quotes, so it gets
              copied far more often than it gets read. */}
          <CopyButton text={value} />
        </div>
      );
    },
  },
  {
    id: "amount",
    accessorKey: "settledAmount",
    header: "Importe",
    cell: (info) => <AmountCell row={info.row.original} />,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Estado",
    cell: (info) => <RampStatusBadge status={info.getValue()} />,
  },
  {
    id: "created",
    accessorKey: "createdAt",
    header: "Fecha",
    cell: (info) => {
      const row = info.row.original;
      const stuck = row.status.toLowerCase() === "pending" && row.ageDays !== null;

      return (
        <div className="flex flex-col">
          <span className="whitespace-nowrap tabular-nums text-[rgba(25,54,63,0.6)]">
            {formatDay(info.getValue())}
          </span>
          {stuck && (
            <span className="whitespace-nowrap font-inter text-[10px] tabular-nums tracking-[-0.4px] text-amber-700">
              hace {row.ageDays}d
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "tx",
    accessorKey: "txHash",
    header: "Tx",
    enableSorting: false,
    cell: (info) =>
      info.getValue() ? (
        <TxLink chainId={info.row.original.chainId} txHash={info.getValue()} />
      ) : (
        <span className="text-[rgba(25,54,63,0.3)]">—</span>
      ),
  },
  {
    id: "fee",
    accessorKey: "fee",
    header: "Comisión",
    meta: { align: "right" },
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-[rgba(25,54,63,0.3)]">—</span>;

      return (
        <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
          {formatFiat(value, info.row.original.currency)}
        </span>
      );
    },
  },
];

/**
 * The banner for onramps the bank has not credited.
 *
 * Pulled to the top and not left to be spotted in the table because this is the one
 * thing on the whole drawer that means somebody is waiting on us. It names each
 * order id, since that id *is* the bank reference the transfer should carry, and a
 * mismatch there is the usual cause.
 */
const PendingBanner = ({ orders }) => {
  if (orders.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5">
      <span className="font-inter text-[11px] font-semibold tracking-[-0.44px] text-amber-900">
        ⚠ {orders.length} depósito{orders.length === 1 ? "" : "s"} pendiente
        {orders.length === 1 ? "" : "s"} de confirmación bancaria
      </span>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {orders.map((order) => (
          <span key={order.id} className="font-inter text-[10px] tracking-[-0.4px] text-amber-800">
            <code className="rounded bg-white px-1 py-0.5 font-mono ring-1 ring-amber-200">
              {order.orderId}
            </code>{" "}
            esperado{" "}
            <strong className="font-semibold">
              {formatFiat(order.expectedAmount, order.currency)}
            </strong>
            {order.ageDays !== null && ` · hace ${order.ageDays}d`}
          </span>
        ))}
      </div>

      <span className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-amber-700">
        El usuario inició la transferencia y Hyxora aún no ha recibido los fondos. Comprueba que el
        código de referencia bancaria coincide con el ID de orden.
      </span>
    </div>
  );
};

/**
 * Tab 4 — SEPA on-ramp and off-ramp orders.
 *
 * From the app backend's `/bank/{wallet}/orders`, relayed by `/users/{privyId}`.
 * Deposit and withdraw legs are kept apart upstream in `toRampRow` for the reason
 * the banner above exists.
 *
 * @param {Object} props
 * @param {Object[]} props.orders Raw `rampOrders` from the detail response.
 */
const SepaTab = ({ orders }) => {
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []).map(toRampRow), [orders]);
  const pending = useMemo(() => pendingDeposits(rows), [rows]);

  if (rows.length === 0) {
    return (
      <div className="p-4">
        <EmptyBlock>
          Este usuario no tiene ninguna orden SEPA. Requiere KYC aprobado, así que una cuenta sin
          KYC nunca tendrá filas aquí.
        </EmptyBlock>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <PendingBanner orders={pending} />

      <DataTable
        data={rows}
        columns={columns}
        filename="usuario-ordenes-sepa"
        getRowId={(row) => row.id}
        initialSorting={[{ id: "created", desc: true }]}
        emptyLabel="Sin órdenes SEPA."
        showRowCount={false}
        enableSearch={false}
        bare
        dense
      />

      <Footnote>
        Del banco de Hyxora. «Importe» es lo que el banco movió de verdad; cuando pone «esperado» es
        lo que el usuario dijo que enviaría y todavía no ha llegado, que no es lo mismo que una
        orden de cero. La comisión va en la divisa de la orden.
      </Footnote>
    </div>
  );
};

export default SepaTab;
