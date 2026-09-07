"use client";

import { cn } from "@/utils";
import NumberFlow from "@number-flow/react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { USD_FORMAT, prefersReducedMotion } from "./shared";

/**
 * How the balance splits across what you hold — one slice per position, plus the
 * cash that is still waiting.
 *
 * Cash is deliberately the muted slice: it is part of the balance but it is not
 * an allocation, and colouring it like a holding reads as a sixth asset.
 */

const SLICE_COLORS = ["#7C5CFC", "#7DD3FC", "#34D399", "#FBBF24", "#F472B6", "#60A5FA"];
const CASH_COLOR = "rgba(25,54,63,0.14)";
const EMPTY_COLOR = "rgba(25,54,63,0.07)";

// Más de esto y la leyenda deja de leerse: el resto se suma en «Otros».
const MAX_SLICES = 5;

/**
 * @param {Array<{ name: string, value: number }>} positions Held assets, any order.
 * @param {number} cash
 * @return {Array<{ key: string, name: string, value: number, color: string }>}
 */
const buildSlices = (positions, cash) => {
  const held = positions.filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  const top = held.slice(0, MAX_SLICES);
  const rest = held.slice(MAX_SLICES);

  const slices = top.map((p, i) => ({
    key: p.key,
    name: p.name,
    value: p.value,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));

  if (rest.length) {
    slices.push({
      key: "otros",
      name: `Otros (${rest.length})`,
      value: rest.reduce((acc, p) => acc + p.value, 0),
      color: SLICE_COLORS[MAX_SLICES % SLICE_COLORS.length],
    });
  }

  if (cash > 0) {
    slices.push({ key: "cash", name: "Disponible", value: cash, color: CASH_COLOR });
  }

  return slices;
};

const PortfolioDonut = ({ positions, cash, total }) => {
  const [active, setActive] = useState(null);
  const slices = buildSlices(positions, cash);
  const isEmpty = slices.length === 0;
  const data = isEmpty ? [{ key: "empty", name: "", value: 1, color: EMPTY_COLOR }] : slices;

  return (
    <div className="flex items-center gap-5 max-sm:flex-col max-sm:items-stretch">
      <div className="relative size-[168px] shrink-0 max-sm:mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={data.length > 1 ? 2.5 : 0}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={!prefersReducedMotion()}
              animationDuration={620}
              onMouseEnter={(_, index) => setActive(data[index]?.key ?? null)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((slice) => (
                <Cell
                  key={slice.key}
                  fill={slice.color}
                  opacity={active && active !== slice.key ? 0.35 : 1}
                  style={{ transition: "opacity 200ms ease-out", outline: "none" }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <NumberFlow
            value={total}
            format={USD_FORMAT}
            className="font-inter text-[20px] font-bold tracking-[-0.8px] text-[#19363F]"
          />
          <span className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
            Balance total
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {isEmpty ? (
          <p className="font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.45)]">
            Aún no tienes posiciones. Compra tu primer activo para ver aquí su reparto.
          </p>
        ) : (
          slices.map((slice) => (
            <button
              key={slice.key}
              type="button"
              onMouseEnter={() => setActive(slice.key)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "flex items-center gap-2 rounded-[8px] px-1.5 py-1 text-left transition-colors duration-200",
                active === slice.key ? "bg-[rgba(25,54,63,0.04)]" : "bg-transparent"
              )}
            >
              <span
                className="size-[10px] shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1 truncate font-inter text-[12px] tracking-[-0.48px] text-[rgba(25,54,63,0.6)]">
                {slice.name}
              </span>
              <span className="shrink-0 font-inter text-[12px] font-semibold tabular-nums tracking-[-0.48px] text-[#19363F]">
                <NumberFlow value={slice.value} format={USD_FORMAT} />
              </span>
              <span className="w-[42px] shrink-0 text-right font-inter text-[11px] tabular-nums tracking-[-0.44px] text-[rgba(25,54,63,0.4)]">
                {total > 0 ? `${((slice.value / total) * 100).toFixed(1)}%` : "—"}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PortfolioDonut;
