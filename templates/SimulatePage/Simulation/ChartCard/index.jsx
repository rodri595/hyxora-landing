"use client";

import Icon from "@/components/Icon";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { memo, useDeferredValue, useEffect, useRef } from "react";
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
import Card from "../Card";
import {
  useSimulationHoverMonth,
  useSimulationHoverSetter,
} from "../hover-context";
import { useSimulation } from "../simulation-context";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const initial = payload.find((p) => p.dataKey === "initial")?.value ?? 0;
  const contrib =
    payload.find((p) => p.dataKey === "contributions")?.value ?? 0;
  return (
    <div className="bg-white/90 backdrop-blur-[15px] border-[0.7px] border-solid border-[#E2E2E2] shadow-[0_6px_14px_-4px_rgba(25,54,63,0.15),0_12px_20px_-4px_rgba(25,54,63,0.15)] rounded-2xl px-3 py-2.5 text-[11px]">
      <p className="text-[#a8a8a8] mb-[6px] font-medium">{label}</p>
      <div className="flex items-center gap-[8px] mb-[4px]">
        <span className="size-[7px] rounded-full bg-[#2D68FF] shrink-0" />
        <span className="text-[#727272]">Inversión:</span>
        <span className="text-[#1B1B1B] font-bold ml-auto pl-[12px]">
          $<NumberFlow value={initial} format={{ useGrouping: true }} />
        </span>
      </div>
      <div className="flex items-center gap-[8px] mb-[6px]">
        <span className="size-[7px] rounded-full bg-[#0EA5A6] shrink-0" />
        <span className="text-[#727272]">Contribución:</span>
        <span className="text-[#1B1B1B] font-bold ml-auto pl-[12px]">
          $<NumberFlow value={contrib} format={{ useGrouping: true }} />
        </span>
      </div>
      <div className="border-t border-[#E2E2E2] pt-[6px] flex justify-between">
        <span className="text-[#a8a8a8]">Total:</span>
        <span className="text-[#1B1B1B] font-bold">
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

// Memoized so tab clicks, table toggles and parent re-renders never touch the
// recharts tree — only a new `data` reference does.
const ChartCanvas = memo(function ChartCanvas({ data }) {
  const chartRef = useRef(null);
  const setHoveredMonth = useSimulationHoverSetter();
  // recharts animates value updates between renders, but stays inert on the
  // first render — the GSAP scroll entrance owns the intro.
  const hasRendered = useRef(false);
  useEffect(() => {
    hasRendered.current = true;
  }, []);

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

  const barAnimation = {
    isAnimationActive: hasRendered.current,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: "ease-out",
  };

  return (
    <div ref={chartRef} className="relative w-full h-full">
      <ChartHoverHighlight scopeRef={chartRef} />
      {/* debounce keeps the chart from re-rendering on every frame while the
          side panels animate their width */}
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={data}
          maxBarSize={24}
          margin={{ top: 40, right: 0, bottom: 0, left: 0 }}
          onMouseMove={(state) =>
            setHoveredMonth(state?.isTooltipActive ? state.activeLabel : null)
          }
          onMouseLeave={() => setHoveredMonth(null)}
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
                      <span className="text-[10px] text-[#a8a8a8] font-medium">
                        {entry.value}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          />

          <CartesianGrid
            vertical={false}
            stroke="#E2E2E2"
            strokeDasharray="8 8"
          />
          <XAxis
            dataKey="month"
            tick={{
              fill: "#A8A8A8",
              fontSize: 9,
              fontWeight: 500,
              fontFamily: "Inter",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => {
              if (v >= 1_000_000)
                return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
              if (v >= 1_000)
                return `$${(v / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
              return `$${v}`;
            }}
            tick={{
              fill: "#727272",
              fontSize: 10,
              fontWeight: 500,
              fontFamily: "Inter",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)", radius: 2 }}
          />
          <Bar
            dataKey="initial"
            stackId="a"
            fill="#2D68FF"
            radius={[0, 0, 2, 2]}
            className="bar-initial"
            shape={cellShape}
            {...barAnimation}
          />
          <Bar dataKey="gap" stackId="a" fill="transparent" {...barAnimation} />
          <Bar
            dataKey="contributions"
            stackId="a"
            fill="#0EA5A6"
            radius={[2, 2, 2, 2]}
            className="bar-contributions"
            shape={cellShape}
            {...barAnimation}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

const ChartCard = ({ showTable, onToggleTable }) => {
  const { rows } = useSimulation();
  // Low-priority copy of the data: input commits stay instant and the chart
  // catches up in an interruptible background render (key for mobile).
  const data = useDeferredValue(rows);
  const isStale = data !== rows;
  const dimRef = useRef(null);

  // While the deferred render lags behind (slow devices), gently dim the
  // chart instead of letting it look frozen.
  useGSAP(
    () => {
      gsap.to(dimRef.current, {
        opacity: isStale ? 0.7 : 1,
        duration: isStale ? 0.15 : 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    { dependencies: [isStale] },
  );

  return (
    <Card className="flex-1 h-auto p-0 min-w-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-[16px] h-[44px] border-b border-[#E2E2E2] shrink-0">
        <span className="text-[11px] font-medium text-[#1B1B1B]">Simulación</span>

        {/* Right: table visibility toggle */}
        <button
          type="button"
          onClick={onToggleTable}
          aria-pressed={showTable}
          aria-label={showTable ? "Ocultar tabla" : "Mostrar tabla"}
          className={cn(
            "flex items-center justify-center rounded-[6px] size-[24px] transition-colors",
            // The table panel is hidden on mobile, so hide its toggle too.
            "max-md:hidden",
            showTable ? "bg-[#E2E2E2]" : "bg-[#F1F1F1] hover:bg-[#E2E2E2]",
          )}
        >
          <Icon
            name={showTable ? "hide-view" : "show-view"}
            size={20}
            className="size-[12px] fill-[#727272]"
          />
        </button>
      </div>

      {/* Recharts BarChart — owns its height so the row doesn't collapse
          while the table panel is hidden */}
      <div
        ref={dimRef}
        className="w-full flex-1 min-h-[460px] max-md:min-h-[320px]"
      >
        <ChartCanvas data={data} />
      </div>
    </Card>
  );
};

export default ChartCard;
