"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import Poster from "../_components/Poster";
import { getVideoBySlug } from "../_data";
import { formatDate, formatDuration } from "../_lib";

// Placeholder detail page. The full video player / chapters experience
// is the next step — for now it confirms navigation works end to end.
const TutorialDetailPage = ({ params }) => {
  const { slug } = use(params);
  const video = getVideoBySlug(slug);
  if (!video) notFound();

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col p-4" data-lenis-prevent>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-3 shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
        <Link
          href="/tutorials"
          className="mb-3 inline-flex w-fit items-center gap-1.5 font-inter text-[11.5px] font-medium tracking-[-0.4px] text-[rgba(25,54,63,0.55)] transition-colors hover:text-[#19363F]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver a tutoriales
        </Link>

        <div className="mx-auto w-full max-w-[760px]">
          <div className="relative overflow-hidden rounded-2xl shadow-[0px_8px_24px_0px_rgba(25,54,63,0.16)]">
            <Poster video={video} rounded={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/90 px-4 py-2 font-inter text-[11.5px] font-semibold tracking-[-0.3px] text-[#19363F] backdrop-blur">
                Reproductor próximamente
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <span
              className="inline-flex w-fit items-center rounded-[5px] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
              style={{ background: `${video.accent}14`, color: video.accent }}
            >
              {video.category} · {video.level}
            </span>
            <h1 className="font-inter text-[20px] font-bold leading-[1.15] tracking-[-0.7px] text-[#19363F]">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 font-inter text-[11.5px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)]">
              <span className="tabular-nums">{formatDuration(video.durationSec)}</span>
              <span className="text-[rgba(25,54,63,0.25)]">·</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>
            <p className="mt-1 font-inter text-[13px] leading-[20px] tracking-[-0.3px] text-[rgba(25,54,63,0.7)]">
              {video.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorialDetailPage;
