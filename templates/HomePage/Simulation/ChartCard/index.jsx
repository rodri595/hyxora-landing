"use client";

import Icon from "@/components/Icon";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import NumberFlow from "@number-flow/react";
import Card from "../Card";
import {
  useSimulationHoverMonth,
  useSimulationHoverSetter,
} from "../hover-context";
import { useSimulation } from "../simulation-context";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TABS = ["Simulación", "Proyección"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const initial = payload.find((p) => p.dataKey === "initial")?.value ?? 0;
  const contrib =
    payload.find((p) => p.dataKey === "contributions")?.value ?? 0;
  return (
    <div className="bg-[rgba(255,255,255,0.06)] backdrop-blur-[15px] border-[0.7px] border-solid border-[rgba(255,255,255,0.06)] shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15),0_12px_20px_-4px_rgba(25,54,63,0.15)] rounded-2xl px-3 py-2.5 text-[11px]">
      <p className="text-white/50 mb-[6px] font-medium">{label}</p>
      <div className="flex items-center gap-[8px] mb-[4px]">
        <span className="size-[7px] rounded-full bg-[#3471FD] shrink-0" />
        <span className="text-white/60">Inversión:</span>
        <span className="text-white font-bold ml-auto pl-[12px]">
          $<NumberFlow value={initial} format={{ useGrouping: true }} />
        </span>
      </div>
      <div className="flex items-center gap-[8px] mb-[6px]">
        <span className="size-[7px] rounded-full bg-[#26B179] shrink-0" />
        <span className="text-white/60">Contribución:</span>
        <span className="text-white font-bold ml-auto pl-[12px]">
          $<NumberFlow value={contrib} format={{ useGrouping: true }} />
        </span>
      </div>
      <div className="border-t border-white/10 pt-[6px] flex justify-between">
        <span className="text-white/40">Total:</span>
        <span className="text-white font-bold">
          $
          <NumberFlow
            value={initial + contrib}
            format={{ useGrouping: true }}
          />
        </span>
      </div>
    </div>
  );
};

const BAR_KEYS = ["initial", "contributions"];

const cellShape = (props) => (
  <Rectangle
    {...props}
    className={`chart-cell chart-cell-${props.payload?.month ?? props.month ?? ""}`}
  />
);

// Renders nothing — isolates the hover-state subscription so the recharts
// tree doesn't re-render on every hover change.
const ChartHoverHighlight = ({ scopeRef }) => {
  const hoveredMonth = useSimulationHoverMonth();

  useGSAP(
    () => {
      const cells = gsap.utils.toArray(".chart-cell", scopeRef.current);
      if (!cells.length) return;
      for (const cell of cells) {
        const active =
          !hoveredMonth ||
          cell.classList.contains(`chart-cell-${hoveredMonth}`);
        gsap.to(cell, {
          opacity: active ? 1 : 0.15,
          duration: 0.08,
          ease: "power1.out",
          overwrite: "auto",
        });
      }
    },
    { dependencies: [hoveredMonth], scope: scopeRef },
  );

  return null;
};

const ChartCard = ({ showTable, onToggleTable }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { rows: data } = useSimulation();
  const chartRef = useRef(null);
  const setHoveredMonth = useSimulationHoverSetter();
  const hoverCall = useRef(null);
  const queuedMonth = useRef(null);

  const { contextSafe } = useGSAP(
    (_context, ctxSafe) => {
      // Entrance: bars grow from their base with a stagger, once on scroll-in.
      // Recharts mounts the cells async (ResponsiveContainer measures first),
      // so retry until they exist.
      const playEntrance = ctxSafe(() => {
        const cells = gsap.utils.toArray(".chart-cell", chartRef.current);
        if (!cells.length) {
          gsap.delayedCall(0.1, playEntrance);
          return;
        }
        gsap.from(cells, {
          scaleY: 0,
          transformOrigin: "50% 100%",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.035,
        });
      });

      ScrollTrigger.create({
        trigger: chartRef.current,
        start: "top 85%",
        once: true,
        onEnter: playEntrance,
      });
    },
    { scope: chartRef },
  );

  const animateBars = contextSafe((hoveredKey) => {
    for (const key of BAR_KEYS) {
      const el = chartRef.current?.querySelector(`.bar-${key}`);
      if (!el) return;
      gsap.to(el, {
        opacity: !hoveredKey || hoveredKey === key ? 1 : 0.2,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  const queueHover = contextSafe((month) => {
    if (month === queuedMonth.current) return;
    queuedMonth.current = month;
    hoverCall.current?.kill();
    setHoveredMonth(month);
  });

  return (
    <Card className="flex-1 h-auto p-0 min-w-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-[16px] h-[44px] border-b border-[#19222C] shrink-0">
        {/* Left: tabs */}
        <div className="flex h-full">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                "relative text-[11px] font-medium h-full px-[12px] first:pl-0 transition-colors",
                activeTab === i
                  ? "text-white"
                  : "text-white/30 hover:text-white/60",
              )}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Right: table visibility toggle */}
        <button
          type="button"
          onClick={onToggleTable}
          aria-pressed={showTable}
          aria-label={showTable ? "Ocultar tabla" : "Mostrar tabla"}
          className={cn(
            "flex items-center justify-center rounded-[6px] size-[24px] transition-colors",
            showTable ? "bg-[#3d3d3d]" : "bg-[#282828] hover:bg-[#3d3d3d]",
          )}
        >
          <Icon
            name={showTable ? "hide-view" : "show-view"}
            size={20}
            className="size-[12px] fill-white"
          />
        </button>
      </div>

      {/* Recharts BarChart — owns its height so the row doesn't collapse
          while the table panel is hidden */}
      <div ref={chartRef} className="w-full flex-1 min-h-[460px] relative">
        <ChartHoverHighlight scopeRef={chartRef} />
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            maxBarSize={24}
            syncId="anyId"
            margin={{ top: 40, right: 0, bottom: 0, left: 0 }}
            onMouseMove={(state) =>
              queueHover(state?.isTooltipActive ? state.activeLabel : null)
            }
            onMouseLeave={() => queueHover(null)}
          >
            <Legend
              align="left"
              verticalAlign="top"
              wrapperStyle={{ position: "absolute", left: 0, top: 0 }}
              content={({ payload }) => (
                <div className="flex items-center gap-[16px] px-3">
                  {payload
                    ?.filter((entry) => entry.color !== "transparent")
                    .sort((a, b) => b.dataKey.localeCompare(a.dataKey))
                    .map((entry) => (
                      <div
                        key={entry.dataKey}
                        className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onMouseEnter={() => animateBars(entry.dataKey)}
                        onMouseLeave={() => animateBars(undefined)}
                      >
                        <span
                          className="size-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[10px] text-white/40 font-medium">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            />

            <CartesianGrid
              vertical={false}
              stroke="#24292D"
              strokeDasharray="8 8"
            />
            <XAxis
              dataKey="month"
              tick={{
                fill: "rgba(255, 255, 255, 0.50)",
                fontSize: 9,
                fontWeight: 500,
                fontFamily: "Inter",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
                if (v >= 1_000) return `$${(v / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
                return `$${v}`;
              }}
              tick={{
                fill: "rgba(255, 255, 255, 0.70)",
                fontSize: 10,
                fontWeight: 500,
                fontFamily: "Inter",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)", radius: 2 }}
            />
            <Bar
              dataKey="initial"
              stackId="a"
              fill="#3471FD"
              radius={[0, 0, 2, 2]}
              className="bar-initial"
              shape={cellShape}
              isAnimationActive={false}
            />
            <Bar
              dataKey="gap"
              stackId="a"
              fill="transparent"
              isAnimationActive={false}
            />
            <Bar
              dataKey="contributions"
              stackId="a"
              fill="#26B179"
              radius={[2, 2, 2, 2]}
              className="bar-contributions"
              shape={cellShape}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChartCard;
