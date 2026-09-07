"use client";

import { useGetTokenHistory } from "@/hooks/simulator/useGetTokenHistory";
import { cn } from "@/utils";
import { useId, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import SegmentedControl from "./SegmentedControl";
import { formatPrice, prefersReducedMotion, trendOf } from "./shared";

/**
 * The drawer's price chart — the same series the card sparkline draws, with the
 * range picker and the reading the card leaves out.
 *
 * The percentage under the title is the change **over the selected range**, not
 * the catalogue's 24h figure: on a 30-day chart those two disagree often, and
 * the number next to a curve has to be the curve's own.
 */

const RANGES = [
  { id: "DAY", label: "24H" },
  { id: "WEEK", label: "7D" },
  { id: "MONTH", label: "30D" },
  { id: "YEAR", label: "1A" },
];

const stampFormat = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

// app-api sends seconds, and `new Date(seconds)` is 1970 — a mistake that reads
// as a working chart with unreadable labels.
const formatStamp = (timestamp) => stampFormat.format(new Date(timestamp * 1000));

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="squircle rounded-[8px] border-[0.7px] border-[rgba(25,54,63,0.1)] bg-white px-2 py-1.5 shadow-[0px_4px_14px_-4px_rgba(25,54,63,0.25)]">
      <p className="font-inter text-[10px] tracking-[-0.4px] text-[rgba(25,54,63,0.45)]">
        {formatStamp(point.timestamp)}
      </p>
      <p className="font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px] text-[#19363F]">
        {formatPrice(point.value)}
      </p>
    </div>
  );
};

const TokenChart = ({ token }) => {
  const [range, setRange] = useState("WEEK");
  const gradientId = useId().replace(/:/g, "");

  const {
    data: history,
    isLoading,
    isError,
  } = useGetTokenHistory({
    address: token.address,
    chainId: token.chainId,
    timeFrame: range,
  });

  const first = history?.[0]?.value;
  const last = history?.[history.length - 1]?.value;
  const change = Number.isFinite(first) && Number.isFinite(last) ? last - first : 0;
  const changePct = first ? (change / first) * 100 : 0;
  const trend = trendOf(change);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-inter text-[12px] font-semibold tracking-[-0.48px] text-[#19363F]">
          Precio
        </p>
        {history?.length > 1 && (
          <span
            className={cn(
              "font-inter text-[11px] font-semibold tabular-nums tracking-[-0.44px]",
              change >= 0 ? "text-[#15803D]" : "text-[#DC2626]"
            )}
          >
            {change >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="h-[120px] w-full">
        {isLoading ? (
          <div className="squircle size-full animate-pulse rounded-[10px] bg-[rgba(25,54,63,0.04)]" />
        ) : isError || !history?.length ? (
          <div className="flex size-full items-center justify-center rounded-[10px] border-[0.7px] border-dashed border-[rgba(25,54,63,0.12)]">
            <p className="px-3 text-center font-inter text-[11px] tracking-[-0.44px] text-[rgba(25,54,63,0.45)]">
              El histórico de precios no está disponible ahora mismo.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trend.fill} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={trend.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(25,54,63,0.2)", strokeWidth: 1 }}
                wrapperStyle={{ outline: "none" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={trend.stroke}
                strokeWidth={1.8}
                fill={`url(#${gradientId})`}
                isAnimationActive={!prefersReducedMotion()}
                animationDuration={620}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: trend.stroke }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <SegmentedControl
        options={RANGES}
        value={range}
        onChange={setRange}
        tone="light"
        className="self-start"
      />
    </div>
  );
};

export default TokenChart;
