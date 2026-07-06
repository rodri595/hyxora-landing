"use client";

import { cn } from "@/utils";
import { formatDate, formatDuration } from "@/utils/video";
import { useState } from "react";
import Image from "@/components/Image";
const PlayGlyph = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M8 5.5v13l11-6.5L8 5.5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockGlyph = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M12 7.5V12l3 2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarGlyph = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3.5"
      y="5"
      width="17"
      height="15"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Poster card for the public learning center grid. Mirrors the Figma layout
 * (gradient poster on top, title + description + meta below) and opens the
 * video in a modal when activated.
 *
 * @param {object} video
 * @param {() => void} onPlay
 * @param {string} [className]
 */
const VideoCard = ({ video, onPlay, className }) => {
  const [from, to] = video.gradient ?? ["#19363F", "#0E2329"];
  const minutes = Math.max(1, Math.round((video.durationSec ?? 0) / 60));
  // Render the backend cover image when present; otherwise the gradient and its
  // decorative glow/dots act as the default backdrop.
  const coverUrl = video.coverImgUrl;

  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "group/card flex w-full flex-col gap-5 text-left outline-none",
        className,
      )}
    >
      {/* Poster */}
      <div
        className="group/poster relative aspect-[298/220] w-full overflow-hidden rounded-2xl border-[0.7px] border-[rgba(25,54,63,0.04)] shadow-[inset_0px_0px_4px_0px_rgba(25,54,63,0.04)] transition-all duration-300 group-hover/card:shadow-[0px_12px_28px_-8px_rgba(25,54,63,0.28)] group-focus-visible/card:ring-2 group-focus-visible/card:ring-[#19363F]"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      >
        <Image
          src={coverUrl}
          alt="poster"
          height={260}
          width={460}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
        />

        {/* bottom shade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />

        {/* play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 scale-90 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/30 backdrop-blur-sm transition-all duration-300 group-hover/card:scale-100 group-hover/card:opacity-100">
            <PlayGlyph className="ml-0.5" />
          </span>
        </div>

        {/* category badge */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/35 px-2.5 py-1 font-inter text-[10px] font-medium tracking-[-0.3px] text-white backdrop-blur-sm">
          {video.category}
        </span>

        {/* duration badge */}
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/55 px-1.5 py-0.5 font-inter text-[10px] font-semibold tabular-nums tracking-[-0.3px] text-white backdrop-blur-sm">
          {formatDuration(video.durationSec)}
        </span>
      </div>

      {/* Content */}
      <div className="flex w-full flex-col gap-[30px]">
        <div className="flex flex-col gap-4">
          <h3 className="font-inter text-[18px] font-medium leading-normal tracking-[-0.72px] text-[#19363f]">
            {video.title}
          </h3>
          <p className="line-clamp-2 font-inter text-[14px] font-normal leading-6 tracking-[-0.28px] text-[rgba(25,54,63,0.7)]">
            {video.description}
          </p>
        </div>

        <div className="flex items-center gap-5 font-inter text-[12px] tracking-[-0.24px] text-[rgba(25,54,63,0.7)]">
          <span className="flex items-center gap-1.5">
            <CalendarGlyph />
            {formatDate(video.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockGlyph />
            {minutes} min
          </span>
        </div>
      </div>
    </button>
  );
};

export default VideoCard;
