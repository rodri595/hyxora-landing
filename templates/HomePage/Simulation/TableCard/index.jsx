"use client";

import { cn } from "@/utils";
import NumberFlow from "@number-flow/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useDeferredValue, useMemo } from "react";
import Card from "../Card";
import { MIN_BARS } from "../data";
import { useSimulationHover } from "../hover-context";
import { useSimulation } from "../simulation-context";

const fmt = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const columnHelper = createColumnHelper();

const buildColumns = (periodLabel, amountLabel) => [
  columnHelper.accessor("month", { id: "month", header: periodLabel }),
  columnHelper.accessor("amount", {
    id: "amount",
    header: amountLabel,
    cell: (info) => fmt(info.getValue()),
  }),
  columnHelper.accessor("total", {
    id: "total",
    header: "Total",
    cell: (info) => fmt(info.getValue()),
  }),
];

const GRID = "grid grid-cols-[28px_1fr_64px] items-center px-[11px]";

const MiniTable = ({ data, columns, barGradient, accentClass }) => {
  const { hoveredMonth, setHoveredMonth } = useSimulationHover();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    // Caps at the header + 12 rows; longer horizons scroll inside.
    <div
      className="max-h-[209px] overflow-y-auto"
      onMouseLeave={() => setHoveredMonth(null)}
    >
      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          className={cn(
            GRID,
            "border-b border-[#19222C] sticky top-0 z-10 bg-[#0D0D0D]",
          )}
        >
          {headerGroup.headers.map((header, i) => (
            <span
              key={header.id}
              className={cn(
                "text-[10px] font-medium text-[#cdcdcd]",
                i > 0 ? "text-right" : "",
              )}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          ))}
        </div>
      ))}

      {table.getRowModel().rows.map((row) => {
        const { month, bar } = row.original;
        const isHovered = hoveredMonth === month;
        const isDimmed = hoveredMonth && !isHovered;
        return (
          <div
            key={row.id}
            onMouseEnter={() => setHoveredMonth(month)}
            className={cn(
              "relative",
              GRID,
              "h-[16px] overflow-hidden cursor-default transition-opacity duration-200",
              isDimmed && "opacity-40",
              isHovered && "bg-white/[0.03]",
            )}
          >
            <div
              className={cn(
                "absolute inset-y-0 right-0 transition-opacity duration-200",
                isHovered ? "opacity-50" : "opacity-20",
              )}
              style={{ width: `${bar}%`, background: barGradient }}
            />
            {row.getVisibleCells().map((cell, i) => (
              <span
                key={cell.id}
                className={cn(
                  "relative text-[10px] font-medium",
                  i === 0 ? accentClass : "text-[#cdcdcd] text-right",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const TableCard = () => {
  // Deferred copy of the simulation: the table re-renders at low priority so
  // typing in the simulator never waits on the table's row work.
  const { rows, initial, finalTotal, years } = useDeferredValue(
    useSimulation(),
  );

  // Inversión: fixed base, bar = its shrinking share of each period's total.
  // Contribuciones: cumulative, bar = its growing share of each period's total.
  const { investmentRows, contributionRows } = useMemo(
    () => ({
      investmentRows: rows.map(({ month, initial: base, contributions }) => {
        const total = base + contributions;
        return { month, amount: base, total, bar: (base / (total || 1)) * 100 };
      }),
      contributionRows: rows.map(({ month, initial: base, contributions }) => {
        const total = base + contributions;
        return {
          month,
          amount: contributions,
          total,
          bar: (contributions / (total || 1)) * 100,
        };
      }),
    }),
    [rows],
  );

  // Sub-year horizons mix month ("6m") and year ("A1") rows.
  const periodLabel = years === 1 ? "Mes" : years < MIN_BARS ? "Plazo" : "Año";
  const investmentColumns = useMemo(
    () => buildColumns(periodLabel, "Inversión"),
    [periodLabel],
  );
  const contributionColumns = useMemo(
    () => buildColumns(periodLabel, "Aporte"),
    [periodLabel],
  );

  const safeTotal = finalTotal || 1;
  const basePct = (initial / safeTotal) * 100;
  const horizonLabel = years === 1 ? "12 meses" : `${years} años`;

  return (
    <Card className="w-full max-w-[240px] p-0 flex flex-col overflow-hidden h-auto gap-2">
      {/* Header */}
      <div className="flex items-center px-[11px] h-[44px] border-b border-[#19222C] shrink-0">
        <span className="text-[13px] font-semibold text-white tracking-[-0.3px]">
          Cartera
        </span>
      </div>

      {/* Inversión table (blue) */}
      <MiniTable
        data={investmentRows}
        columns={investmentColumns}
        barGradient="linear-gradient(to left, #3471FD, transparent)"
        accentClass="text-[#3471FD]"
      />

      {/* Ticker divider — final total */}
      <div className="flex items-center gap-[6px] px-[11px] py-[8px] border-y border-[#19222C] shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <title>Total al alza</title>
          <path
            d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5"
            stroke="#26B179"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[12px] font-semibold text-[#c0dde6]">
          <NumberFlow
            value={finalTotal}
            format={{
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }}
          />
        </span>
        <span className="text-[10px] font-medium text-[#c0dde6] opacity-60">
          ≈ Total a {horizonLabel}
        </span>
      </div>
      {/* Contribuciones table (green) */}
      <MiniTable
        data={contributionRows}
        columns={contributionColumns}
        barGradient="linear-gradient(to left, #26B179, transparent)"
        accentClass="text-[#26b179]"
      />

      {/* Footer: base/contribution ratio gauge */}
      <div className="border-t border-[#19222C] px-[11px] py-[8px] shrink-0 mt-auto">
        <div className="flex h-[16px] items-center gap-[4px]">
          {/* Left end dot + blurred halo */}
          <div className="relative size-[16px] shrink-0">
            <div className="absolute left-[4px] top-[4px] size-[8px] rounded-full bg-[#3471FD]" />
            <div className="absolute inset-0 rounded-full bg-[#0D0D0D]/50 backdrop-blur-[2.5px]" />
          </div>

          {/* Bars */}
          <div className="relative flex h-[8px] flex-1">
            <div
              className="h-full rounded-l-full bg-[#3471FD]"
              style={{
                width: `${basePct}%`,
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 2.5px) 100%, 0 100%)",
              }}
            />
            <div className="w-[4.5px] shrink-0" />
            <div
              className="h-full flex-1 rounded-r-full bg-[#26B179]"
              style={{
                clipPath: "polygon(2.5px 0, 100% 0, 100% 100%, 0 100%)",
              }}
            />
            {/* Slanted divider strokes */}
            <svg
              width="13"
              height="15"
              viewBox="0 0 13 15"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-[-2px] -translate-x-1/2"
              style={{ left: `calc(${basePct}% + 2.25px)` }}
            >
              <path
                d="M5 1L1 14"
                stroke="#3471FD"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 1L8 14"
                stroke="#26B179"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Right end dot + blurred halo */}
          <div className="relative size-[16px] shrink-0">
            <div className="absolute left-[4px] top-[4px] size-[8px] rounded-full bg-[#26B179]" />
            <div className="absolute inset-0 rounded-full bg-[#0D0D0D]/50 backdrop-blur-[2.5px]" />
          </div>
        </div>

        {/* Labels */}
        <div className="mt-[8px] flex items-center justify-between px-[3px]">
          <span className="text-[12px] font-medium text-[#c0dde6]">
            Inv <NumberFlow value={Math.round(basePct)} />%
          </span>
          <span className="text-[12px] font-medium text-[#c0dde6]">
            <NumberFlow value={100 - Math.round(basePct)} />% Con
          </span>
        </div>
      </div>
    </Card>
  );
};

export default TableCard;
