"use client";

import { cn } from "@/utils";
import { detectVideoSource } from "@/utils/video";
import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

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
 * @param {string} [cover]   – resolved custom cover URL; shown as a clickable
 *                             poster facade that mounts the embed on click.
 * @param {(meta: { duration: number }) => void} [onReady]
 * @param {string} [className]
 */
const VideoPreview = ({ url, cover, onReady, className }) => {
  const { provider, embedUrl } = detectVideoSource(url);
  const [playing, setPlaying] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  // Reset the facade when the source video or cover changes (the sidebar reuses
  // this instance across rows).
  // biome-ignore lint/correctness/useExhaustiveDependencies: url/cover are intentional reset triggers, not read in the body.
  useEffect(() => {
    setPlaying(false);
    setCoverFailed(false);
  }, [url, cover]);

  const isPlayable = provider === "vimeo" || provider === "youtube";
  // When a custom cover exists, show it as a clickable poster first (mirrors the
  // public poster → player flow); clicking mounts the real embed. Falls back to
  // the embed directly when there's no cover or the image fails to load.
  const showFacade = Boolean(cover) && !coverFailed && isPlayable && !playing;

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-[#0c1c21]",
        className,
      )}
    >
      {showFacade ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Reproducir vista previa"
          className="group/preview absolute inset-0 size-full"
        >
          <img
            src={cover}
            alt=""
            onError={() => setCoverFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover/preview:scale-105">
              <PlayGlyph className="ml-0.5" />
            </span>
          </span>
        </button>
      ) : provider === "vimeo" ? (
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
