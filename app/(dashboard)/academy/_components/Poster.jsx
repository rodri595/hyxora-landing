"use client";

import { cn } from "@/utils";
import { formatDuration } from "../_lib";
import Image from "@/components/Image";
const PlayGlyph = ({ className }) => (
  <svg
    width="18"
    height="18"
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

/**
 * Gradient poster used by cards and list rows.
 * Renders a 16:9 surface with a decorative glow, hover play affordance
 * and a duration badge. No image assets required.
 *
 * @param {object} video
 * @param {string} [className]
 * @param {boolean} [rounded=true]
 * @param {string} [flipId]   – data-flip-id used by the grid ⇄ table Flip transition.
 */
const Poster = ({ video, className, rounded = true, flipId }) => {
  const [from, to] = video.gradient ?? ["#19363F", "#0E2329"];
  // Render the backend cover image when present; otherwise (or if it fails to
  // load) the gradient background shows through as the default.
  const coverUrl = video.coverImgUrl;

  return (
    <div
      data-flip-id={flipId}
      className={cn(
        "group/poster relative aspect-video w-full overflow-hidden",
        rounded && "rounded-[10px]",
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      <Image
        src={coverUrl}
        alt="poster"
        height={260}
        width={460}
        className="absolute inset-0 size-full object-cover"
      />

      {/* bottom shade for legibility of the badge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />

      {/* hover play affordance */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/poster:opacity-100 group-hover/card:opacity-100 group-hover/card:scale-100 scale-90 ring-1 ring-white/30">
          <PlayGlyph className="ml-0.5" />
        </span>
      </div>

      {/* duration badge */}
      <span className="absolute bottom-1.5 right-1.5 rounded-[5px] bg-black/55 px-1.5 py-0.5 font-inter text-[10px] font-semibold tabular-nums tracking-[-0.3px] text-white backdrop-blur-sm">
        {formatDuration(video.durationSec)}
      </span>
    </div>
  );
};

export default Poster;
