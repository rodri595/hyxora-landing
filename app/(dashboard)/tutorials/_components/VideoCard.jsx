"use client";

import { cn } from "@/utils";
import Link from "next/link";
import { formatDate } from "../_lib";
import Poster from "./Poster";

/**
 * Poster card for the grid / carousel layout (YouTube-style: poster on top,
 * title and metadata below).
 *
 * @param {object} video
 * @param {string} [className]
 */
const VideoCard = ({ video, className }) => (
  <Link
    href={`/tutorials/${video.slug}`}
    data-stagger-item
    className={cn("group/card flex w-full flex-col gap-2 text-left outline-none", className)}
  >
    <div className="overflow-hidden rounded-[10px] shadow-[0px_1px_4px_0px_rgba(25,54,63,0.08)] transition-all duration-300 group-hover/card:shadow-[0px_8px_24px_0px_rgba(25,54,63,0.16)] group-focus-visible/card:ring-2 group-focus-visible/card:ring-[#19363F]">
      <Poster
        video={video}
        rounded={false}
        flipId={`poster-${video.id}`}
        className="transition-transform duration-300 group-hover/card:scale-[1.03]"
      />
    </div>

    <div className="flex flex-col gap-1 px-0.5">
      <h3 className="line-clamp-2 font-inter text-[12.5px] font-semibold leading-[16px] tracking-[-0.44px] text-[#19363F] transition-colors group-hover/card:text-[#0f2228]">
        {video.title}
      </h3>
      <div className="flex items-center gap-1.5 font-inter text-[11px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)]">
        <span
          className="inline-block size-1.5 shrink-0 rounded-full"
          style={{ background: video.accent }}
        />
        <span className="truncate">{video.level}</span>
        <span className="text-[rgba(25,54,63,0.3)]">·</span>
        <span className="whitespace-nowrap">{formatDate(video.publishedAt)}</span>
      </div>
    </div>
  </Link>
);

export default VideoCard;
