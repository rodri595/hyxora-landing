import Icon from "@/components/Icon";
import { cn } from "@/utils";
import NumberFlow from "@number-flow/react";
import Card from "../Card";

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
    <Card className={cn("p-[16px] max-lg:min-w-[250px] max-md:min-w-full")}>
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
      <div className="flex w-full justify-between flex-1 pl-6">
        <div className="flex gap-[8px] items-center justify-center">
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
        <div className="flex gap-[8px] items-center justify-center max-w-[80px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="117"
            height="28"
            viewBox="0 0 117 28"
            fill="none"
          >
            <title>{`${title} chart`}</title>
            <path d="M0 21L114 21" stroke="#262626" strokeDasharray="8 8" />
            <path
              opacity="0.2"
              d="M116.5 21.0002C116.5 21.0002 111 18.5002 97.9995 24.5002C83.5 31.192 86.361 2.26757 68.5 4.5002C56.5 6.00021 64.5004 17.7246 49 18.5002C43.3444 18.7832 41.4995 29.0002 33.9995 26.0002C25.5347 22.6143 24 13.5002 12.9995 13.5002C7.09624 13.5002 4.34635 17.2502 3.07227 21.0002"
              stroke="white"
              strokeLinecap="round"
            />
            <path
              d="M74.5 4.87114C72.9421 4.35431 70.9974 4.18815 68.5 4.50034C56.5 6.00034 64.5004 17.7248 49 18.5003C43.3444 18.7833 41.4995 29.0003 33.9995 26.0003C31.5526 25.0216 29.6848 23.5642 28 21.9866"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="28"
              cy="22"
              r="4"
              fill={color}
              stroke="#0D0D0D"
              strokeWidth="2"
            />
            <circle
              cx="75"
              cy="5"
              r="4"
              fill={color}
              stroke="#0D0D0D"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
