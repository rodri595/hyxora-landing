"use client";

import DataTable from "@/components/DataTable";
import { useGetLiquidation } from "@/hooks/monitoring/useGetLiquidation";
import { formatNumber, formatUsd, shortenHash } from "@/utils/format";
import { useMemo } from "react";
import Panel, { RefreshButton } from "../../shared/Panel";
import QueryState from "../../shared/QueryState";
import { sumColumn } from "../../shared/aggregate";

const columns = [
  {
    accessorKey: "symbol",
    header: "Token",
    cell: (info) => <span className="font-medium text-[#19363F]">{info.getValue()}</span>,
    footer: () => "Total",
  },
  {
    accessorKey: "wallet",
    header: "Tesorería",
    cell: (info) => <span className="text-[rgba(25,54,63,0.65)]">{info.getValue()}</span>,
  },
  {
    accessorKey: "chain",
    header: "Red",
    cell: (info) => <span className="text-[rgba(25,54,63,0.5)]">{info.getValue() ?? "—"}</span>,
  },
  {
    accessorKey: "amount",
    header: "Cantidad",
    meta: { align: "right" },
    cell: (info) => (
      <span className="tabular-nums text-[rgba(25,54,63,0.7)]">
        {formatNumber(info.getValue(), { decimals: 6 })}
      </span>
    ),
  },
  {
    accessorKey: "valueUsd",
    header: "Valor",
    meta: { align: "right" },
    cell: (info) => (
      <span className="font-medium tabular-nums text-[#19363F]">
        {formatUsd(info.getValue(), { decimals: 2 })}
      </span>
    ),
    footer: ({ table }) => formatUsd(sumColumn(table, "valueUsd"), { decimals: 2 }),
  },
];

/**
 * Fee tokens worth swapping to USDC.
 *
 * Fees arrive in whatever token the user transacted in, so the treasuries
 * accumulate price risk we never chose to take. Stablecoins are already the
 * target and native gas tokens are operational float, so both are excluded —
 * what's left is genuinely worth liquidating.
 */
const LiquidationPanel = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetLiquidation();

  const rows = useMemo(
    () =>
      (data?.wallets ?? []).flatMap((wallet) =>
        wallet.items.map((item) => ({ ...item, wallet: wallet.label }))
      ),
    [data]
  );

  const walletErrors = (data?.wallets ?? []).filter((wallet) => wallet.error);
  const actionable = rows.length > 0;

  return (
    <Panel
      title="Liquidación de comisiones"
      description={
        actionable
          ? `${rows.length} posiciones por encima de ${formatUsd(data?.threshold, { decimals: 2 })} listas para cambiar a USDC — ${formatUsd(data?.totalUsd, { decimals: 2 })} en total.`
          : "Comisiones en tokens no estables por encima del umbral, por tesorería, listas para cambiar a USDC."
      }
      tone={actionable ? "warning" : "neutral"}
      action={<RefreshButton onClick={() => refetch()} isLoading={isFetching} />}
    >
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && rows.length === 0}
        emptyLabel={`Nada que liquidar por encima de ${formatUsd(data?.threshold ?? 1, { decimals: 2 })}.`}
      >
        <DataTable
          data={rows}
          columns={columns}
          filename="liquidacion-comisiones"
          searchPlaceholder="Buscar token o red..."
          initialSorting={[{ id: "valueUsd", desc: true }]}
          enableSelection={false}
          enableFooter
          bare
          dense
        />
      </QueryState>

      {walletErrors.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {walletErrors.map((wallet) => (
            <span key={wallet.address} className="font-inter text-[10px] text-red-600">
              {wallet.label} ({shortenHash(wallet.address)}): {wallet.error}
            </span>
          ))}
        </div>
      )}

      <p className="font-inter text-[10px] leading-[1.5] tracking-[-0.4px] text-[rgba(25,54,63,0.4)] mt-2">
        Se excluyen estables (USDC, USDT, EURC…) y tokens de gas nativos (SOL, ETH, BNB, POL, HYPE):
        los primeros ya son el destino del cambio y los segundos son saldo operativo para pagar
        transacciones, no ingresos por comisiones.
      </p>
    </Panel>
  );
};

export default LiquidationPanel;
