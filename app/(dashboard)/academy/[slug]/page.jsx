"use client";

import ErrorComp from "@/components/Error";
import Spinner from "@/components/Spinner";
import { useGetTutorial } from "@/hooks/academy/useGetTutorial";
import { useGetTutorials } from "@/hooks/academy/useGetTutorials";
import { useUpdateWatchProgress } from "@/hooks/academy/useUpdateWatchProgress";
import { sortTutorials } from "@/utils/tutorialTitle";
import Link from "next/link";
import { use, useCallback, useMemo } from "react";
import Poster from "../_components/Poster";
import VideoPlayer from "../_components/VideoPlayer";
import { decorateAcademyTutorial, formatDate, formatDuration } from "../_lib";

// Compact "up next" row for the right rail: small poster + title / meta.
const RelatedRow = ({ video }) => (
  <Link
    href={`/academy/${video.slug}`}
    className="group flex gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-[rgba(25,54,63,0.04)]"
  >
    <div className="w-[140px] shrink-0 overflow-hidden rounded-lg">
      <Poster video={video} />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
      <h3 className="line-clamp-2 font-inter text-[12px] font-semibold leading-[15px] tracking-[-0.4px] text-[#19363F]">
        {video.title}
      </h3>
      <span className="truncate font-inter text-[11px] tracking-[-0.3px] text-[rgba(25,54,63,0.5)]">
        {video.category}
      </span>
      <span className="font-inter text-[10.5px] tabular-nums tracking-[-0.3px] text-[rgba(25,54,63,0.4)]">
        {formatDuration(video.durationSec)}
      </span>
    </div>
  </Link>
);

// Tutorial player page (normal-user view). Streams the video through the Vimeo
// player and persists watch progress on a throttled cadence.
const TutorialDetailPage = ({ params }) => {
  const { slug } = use(params);
  const { data, isLoading, isError } = useGetTutorial(slug);
  const video = decorateAcademyTutorial(data?.tutorial);

  // Pull the (already-cached) tutorials list for the "Más tutoriales" rail —
  // same category first, then the rest, excluding the one being watched. Both
  // groups follow the manual order, so the rail reads as "what comes next".
  const { data: listData } = useGetTutorials();
  const related = useMemo(() => {
    const all = sortTutorials((listData?.tutorials ?? []).map(decorateAcademyTutorial));
    const others = all.filter((t) => t.slug !== slug);
    const sameCat = others.filter((t) => t.categoryId === video?.categoryId);
    const rest = others.filter((t) => t.categoryId !== video?.categoryId);
    return [...sameCat, ...rest].slice(0, 12);
  }, [listData, slug, video?.categoryId]);

  // Resume point: the caller's saved progress (skip if already completed).
  const progress = data?.progress;
  const startAt = progress?.completed ? 0 : (progress?.positionSec ?? 0);

  const { mutate: updateProgress } = useUpdateWatchProgress();
  const handleSave = useCallback(
    ({ positionSec, completed }) => {
      updateProgress({ id: slug, positionSec, completed });
    },
    [updateProgress, slug]
  );

  if (isLoading) {
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center p-4">
        <Spinner />
      </section>
    );
  }

  if (isError || !video) {
    return (
      <section className="flex h-full min-h-0 flex-1 items-center justify-center p-4">
        <ErrorComp error message="No se pudo cargar este tutorial." className="max-w-sm" />
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col p-4" data-lenis-prevent>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-[0.7px] border-[rgba(25,54,63,0.08)] bg-white px-4 py-3 shadow-[0px_2px_12px_0px_rgba(25,54,63,0.08)]">
        <Link
          href="/academy"
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

        <div className="flex min-h-0 gap-6 max-lg:flex-col">
          {/* Main column — video + metadata (sticks in view while the rail scrolls) */}
          <div className="flex min-w-0 flex-1 flex-col lg:sticky lg:top-0 lg:self-start">
            <div className="w-full max-w-[1040px]">
              <VideoPlayer url={video.url} startAt={startAt} onSave={handleSave} />

              <div className="mt-4 flex flex-col gap-2">
                <span
                  className="inline-flex w-fit items-center rounded-[5px] px-1.5 py-0.5 font-inter text-[10px] font-medium tracking-[-0.3px]"
                  style={{
                    background: `${video.accent}14`,
                    color: video.accent,
                  }}
                >
                  {video.category}
                  {video.level ? ` · ${video.level}` : ""}
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

          {/* Right rail — more tutorials */}
          {related.length > 0 && (
            <aside className="w-full shrink-0 lg:w-[340px] xl:w-[380px]">
              <h2 className="mb-2 px-1.5 font-inter text-[12.5px] font-bold tracking-[-0.5px] text-[#19363F]">
                Más tutoriales
              </h2>
              <div className="flex flex-col gap-1">
                {related.map((v) => (
                  <RelatedRow key={v.slug} video={v} />
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
};

export default TutorialDetailPage;
