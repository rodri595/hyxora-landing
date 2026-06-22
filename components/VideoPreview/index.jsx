"use client";

import { cn } from "@/utils";
import { detectVideoSource } from "@/utils/video";
import Player from "@vimeo/player";
import { useEffect, useRef } from "react";

// ── Vimeo (uses @vimeo/player) ───────────────────────────────────────────────
// We mount the official Vimeo Player into a container so we can later read
// metadata (duration, etc.) and control playback programmatically.

const VimeoPreview = ({ embedUrl, onReady }) => {
  const hostRef = useRef(null);

  // Keep the latest callback without re-running the mount effect.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Mount the player into a throwaway child rather than `host` itself.
    // `player.destroy()` is async, so when `embedUrl` changes the next Player
    // would find the old (still-unloading) iframe left inside `host` and latch
    // onto it — Vimeo then throws "Unknown player. Probably unloaded.". A fresh
    // child we remove synchronously on cleanup guarantees a clean slate.
    const el = document.createElement("div");
    el.className = "h-full w-full";
    host.appendChild(el);

    const player = new Player(el, {
      url: embedUrl,
      responsive: true,
      dnt: true,
    });

    let cancelled = false;
    player
      .ready()
      .then(() => player.getDuration())
      .then((duration) => {
        if (!cancelled) onReadyRef.current?.({ duration });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      player.destroy().catch(() => {});
      el.remove();
    };
  }, [embedUrl]);

  return <div ref={hostRef} className="h-full w-full [&_iframe]:rounded-xl" />;
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
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <span className="font-inter text-[11px] tracking-[-0.44px] text-white/55">
      {message}
    </span>
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
        className,
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
