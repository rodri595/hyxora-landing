import { cerebroChains, cerebroOperationLabels, cerebroPlanLabel } from "@/constants/cerebro";
import * as XLSX from "xlsx";

const sheet = (workbook, name, rows) => {
  if (!rows?.length) return;
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), name);
};

/**
 * Builds the "Descargar Excel" workbook from what the tab already has in memory —
 * no extra requests, and by construction it can't disagree with what's on screen.
 *
 * Numbers go in raw, not pre-formatted: a spreadsheet is for summing and charting,
 * and "$0.0430" as text can do neither.
 *
 * @param {Object} input
 * @param {{ from: string, to: string, plan?: string, op?: string, chain?: string, user?: string }} input.filters
 * @param {object} [input.totals] `/pnl/operations` totals
 * @param {object[]} [input.operations] `/pnl/operations` rows
 * @param {object[]} [input.daily] `/pnl/daily` series
 * @param {object[]} [input.membership] `/pnl/membership` report
 * @param {object} [input.overview] `/overview`
 */
export const downloadResumenWorkbook = ({
  filters,
  totals,
  operations,
  daily,
  membership,
  overview,
}) => {
  const workbook = XLSX.utils.book_new();

  sheet(workbook, "Resumen", [
    { Campo: "Desde", Valor: filters.from },
    { Campo: "Hasta", Valor: filters.to },
    { Campo: "Plan", Valor: filters.plan ? cerebroPlanLabel(filters.plan) : "Todos" },
    {
      Campo: "Funcionalidad",
      Valor: filters.op ? (cerebroOperationLabels[filters.op] ?? filters.op) : "Todas",
    },
    {
      Campo: "Red",
      Valor: filters.chain ? (cerebroChains[filters.chain] ?? filters.chain) : "Todas",
    },
    { Campo: "Usuario", Valor: filters.user ?? "Todos" },
    { Campo: "Ingresos del período (USD)", Valor: totals?.feesUsd ?? null },
    { Campo: "Gastos del período (USD)", Valor: totals?.costUsd ?? null },
    { Campo: "Margen del período (USD)", Valor: totals?.marginUsd ?? null },
    { Campo: "Txs patrocinadas", Valor: totals?.opsCount ?? null },
    { Campo: "Usuarios activos", Valor: totals?.usersCount ?? null },
    // Current-state figures, which the filters don't touch — labelled so nobody
    // reads them as belonging to the window above.
    { Campo: "TVL a hoy (USD)", Valor: overview?.medianTvl?.totalUsd ?? null },
    { Campo: "Usuarios a hoy", Valor: overview?.totalUsers ?? null },
  ]);

  sheet(
    workbook,
    "Diario",
    (daily ?? []).map((point) => ({
      Fecha: point.date,
      "Ingresos (USD)": point.feesUsd ?? 0,
      "Gastos (USD)": point.costUsd ?? 0,
      "Margen (USD)": point.marginUsd ?? 0,
    }))
  );

  sheet(
    workbook,
    "Funcionalidad",
    (operations ?? []).map((row) => ({
      Funcionalidad: cerebroOperationLabels[row.operation] ?? row.operation,
      Clave: row.operation,
      Txs: row.opsCount ?? 0,
      Usuarios: row.usersCount ?? 0,
      "Ingresos (USD)": row.feesUsd ?? 0,
      "Gastos (USD)": row.costUsd ?? 0,
      "Margen (USD)": row.marginUsd ?? 0,
    }))
  );

  sheet(
    workbook,
    "Membresia",
    (membership ?? []).map((row) => ({
      Plan: cerebroPlanLabel(row.plan),
      Usuarios: row.usersCount ?? 0,
      "Ingresos (USD)": row.feesUsd ?? 0,
      "Gastos (USD)": row.costUsd ?? 0,
      "Margen (USD)": row.marginUsd ?? 0,
    }))
  );

  sheet(
    workbook,
    "Posiciones por plan",
    (membership ?? []).flatMap((row) =>
      (row.topHoldings ?? []).map((holding) => ({
        Plan: cerebroPlanLabel(row.plan),
        Activo: holding.symbol,
        "Valor (USD)": holding.totalUsd ?? 0,
      }))
    )
  );

  XLSX.writeFile(workbook, `cerebro-resumen-${filters.from}_${filters.to}.xlsx`);
};
