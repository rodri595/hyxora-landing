"use client";

import Icon from "@/components/Icon";
import { cn } from "@/utils";
import { useGSAP } from "@gsap/react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import Card from "../Card";
gsap.registerPlugin(useGSAP);

const StatCard = ({
  id,
  color,
  badgeBg,
  glowFill,
  titleTop,
  titleBottom,
  label,
  numericValue,
  prefix = "",
  suffix = "",
}) => {
  const gradientId = `paint0_radial_${id}`;
  const filterId = `filter_${id}_glow`;
  const title = `${titleTop} ${titleBottom}`;

  return (
    <Card className={cn("p-[16px] min-w-0 gap-[8px]")}>
      <div className="flex w-full justify-between flex-1">
        <div className="flex gap-[8px] items-start justify-center">
          <div className="relative flex items-center justify-center size-[24px] shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute"
            >
              <title>{title}</title>
              <rect
                x="0.25"
                y="0.25"
                width="23.5"
                height="23.5"
                rx="3.08333"
                stroke={`url(#${gradientId})`}
                strokeOpacity="0.6"
                strokeWidth="0.5"
              />
              <defs>
                <radialGradient
                  id={gradientId}
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(15 8) rotate(132.614) scale(16.9853)"
                >
                  <stop stopColor={color} />
                  <stop offset="1" stopColor="white" stopOpacity="0.2" />
                </radialGradient>
              </defs>
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="6"
              viewBox="0 0 11 6"
              fill="none"
            >
              <title>Arrow up</title>
              <path
                d="M6.5 0.5H10.5V4.5M10.5 0.5L5.73657 5.26343L3.23657 2.76343L0.5 5.5"
                stroke={color}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white opacity-70 font-medium leading-[15px]">
              {titleTop}
            </p>
            <p className="text-[13px] font-bold text-[#FFF] leading-[15px]">
              {titleBottom}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center flex-col gap-[4px]">
          <div
            className="flex shrink-0 justify-center items-center size-[30px] p-[4px] rounded-full"
            style={{ backgroundColor: badgeBg }}
          >
            <div
              className="flex shrink-0 justify-center items-center size-full rounded-full"
              style={{ backgroundColor: color }}
            >
              <Icon
                name="sparkle"
                size={20}
                className="size-[12px] fill-white"
              />
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="9"
            viewBox="0 0 28 9"
            fill="none"
          >
            <title>Glow</title>
            <g opacity="0.2" filter={`url(#${filterId})`}>
              <ellipse cx="14" cy="4.5" rx="10" ry="0.5" fill={glowFill} />
            </g>
            <defs>
              <filter
                id={filterId}
                x="0"
                y="0"
                width="28"
                height="9"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="2"
                  result="effect1_foregroundBlur"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="flex w-full justify-end gap-[12px] flex-1 pl-6">
        <div className="flex gap-[8px] items-center justify-center shrink-0">
          <div>
            <p className="text-[11px] text-white opacity-70 font-medium leading-[15px]">
              {label}
            </p>
            <p className="text-[13px] font-bold text-[#FFF] leading-[15px]">
              {prefix}
              <NumberFlow value={numericValue} format={{ useGrouping: true }} />
              {suffix}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
