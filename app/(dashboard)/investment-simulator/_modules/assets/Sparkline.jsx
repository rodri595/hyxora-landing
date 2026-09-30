"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { prefersReducedMotion, trendOf } from "./shared";

/**
 * The curve under a token card: no axes, no grid, no tooltip — a shape, not a
 * reading. The numbers above it are the reading.
 *
 * Two things it must get right. The domain is `dataMin → dataMax`, because
 * recharts anchors an area at zero by default and a stablecoin's day would
 * render as a dead flat line at the top of the box. And the gradient id is
 * per-instance (`useId`): a shared id makes every card paint with whichever
 * definition mounted last, so a falling token borrows the green fill.
 *
 * @param {Object} props
 * @param {Array<{ timestamp: number, value: number }>} props.points
 * @param {number} props.change Direction of the period — decides the colour.
 * @param {number} [props.height]
 * @param {boolean} [props.animate]
 */
const Sparkline = ({ points, change, height = 64, animate = true }) => {
  const gradientId = useId().replace(/:/g, "");
  const trend = trendOf(change);
  const reduced = prefersReducedMotion();

  if (!points?.length) return <div style={{ height }} />;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trend.fill} stopOpacity={0.34} />
              <stop offset="100%" stopColor={trend.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={trend.stroke}
            strokeWidth={1.6}
            fill={`url(#${gradientId})`}
            isAnimationActive={animate && !reduced}
            animationDuration={700}
            animationEasing="ease-out"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
