"use client";

import { cn } from "@/utils";
import { detectVideoSource } from "@/utils/video";
import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

// ── Vimeo (uses @vimeo/player) ───────────────────────────────────────────────
// We mount the official Vimeo Player into a container so we can later read
// metadata (duration, etc.) and control playback programmatically.

const VimeoPreview = ({ embedUrl, onReady }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const player = new Player(el, {
      url: embedUrl,
      responsive: true,
      dnt: true,
    });

    let cancelled = false;
    if (onReady) {
      player
        .ready()
        .then(() => player.getDuration())
        .then((duration) => {
          if (!cancelled) onReady({ duration });
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      player.destroy().catch(() => {});
    };
  }, [embedUrl, onReady]);

  return <div ref={mountRef} className="h-full w-full [&>iframe]:rounded-xl" />;
};

// ── YouTube (plain iframe embed) ─────────────────────────────────────────────

const YouTubePreview = ({ embedUrl }) => (
  <iframe
    src={embedUrl}
    title="Vista previa del video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="h-full w-full rounded-xl border-0"
  />
);

// ── Fallback for unrecognised / empty links ──────────────────────────────────

const EmptyState = ({ message }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.4"
      />
      <path
        d="M10 9.5l5 2.5-5 2.5v-5Z"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-inter text-[11px] tracking-[-0.44px] text-white/55">{message}</span>
  </div>
);

/**
 * Renders a preview for a tutorial video URL. Vimeo links use the
 * `@vimeo/player` SDK; YouTube uses a standard embed; anything else shows a
 * placeholder. `onReady` receives `{ duration }` once a Vimeo player loads.
 *
 * @param {string} url
 * @param {(meta: { duration: number }) => void} [onReady]
 * @param {string} [className]
 */
const VideoPreview = ({ url, onReady, className }) => {
  const { provider, embedUrl } = detectVideoSource(url);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-[#0c1c21]",
        className
      )}
    >
      {provider === "vimeo" ? (
        <VimeoPreview embedUrl={embedUrl} onReady={onReady} />
      ) : provider === "youtube" ? (
        <YouTubePreview embedUrl={embedUrl} />
      ) : provider === "other" ? (
        <EmptyState message="Este enlace no es de Vimeo ni YouTube — no hay vista previa." />
      ) : (
        <EmptyState message="Añade un enlace de Vimeo o YouTube para ver la vista previa." />
      )}
    </div>
  );
};

export default VideoPreview;
