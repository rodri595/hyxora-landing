"use client";

import { cn } from "@/utils";
import { detectVideoSource } from "@/utils/video";
import Player from "@vimeo/player";
import { useEffect, useRef } from "react";

// Persist progress at most this often (in seconds of playback). Vimeo's
// `timeupdate` event fires ~4×/second; writing on every tick would hammer the
// API, so we batch the writes to one per interval (5–8s is plenty).
const SAVE_EVERY_SEC = 8;
// Treat the tutorial as finished once the viewer crosses this fraction — Vimeo
// doesn't always emit a clean `ended` if the user scrubs near the very end.
const COMPLETE_AT = 0.95;

// ── Vimeo (tracked) ──────────────────────────────────────────────────────────
// Mounts the official Vimeo player, resumes from the saved position and reports
// progress back through `onSave` on a throttled cadence (+ on pause / ended).

const VimeoTrackedPlayer = ({ embedUrl, startAt = 0, onSave }) => {
  const mountRef = useRef(null);

  // Keep the latest callback without re-running the mount effect.
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Capture the resume point once so a parent re-render never re-seeks the user.
  const startAtRef = useRef(startAt);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    // Mount the player into a throwaway child rather than `host` itself.
    // `player.destroy()` is async, so when `embedUrl` changes the next Player
    // would find the old (still-unloading) iframe left inside `host` and latch
    // onto it — Vimeo then throws "Unknown player. Probably unloaded.". A fresh
    // child we remove synchronously on cleanup guarantees a clean slate.
    const el = document.createElement("div");
    el.className = "size-full";
    host.appendChild(el);

    const player = new Player(el, {
      url: embedUrl,
      responsive: true,
      dnt: true,
    });

    let duration = 0;
    let lastSaved = 0; // seconds of the last persisted position
    let latest = 0; // most recent playhead seen
    let completedSent = false;
    let cancelled = false;

    const save = (positionSec, completed) => {
      if (cancelled) return;
      onSaveRef.current?.({ positionSec: Math.floor(positionSec), completed });
    };

    // Resume playback where the viewer left off. Each step bails if the effect
    // was already cleaned up (e.g. React Strict Mode's mount→unmount→remount in
    // dev) — calling methods on a destroyed player throws the Vimeo
    // "Unknown player. Probably unloaded." error.
    player
      .ready()
      .then(() => {
        if (cancelled) return undefined;
        return player.getDuration();
      })
      .then((d) => {
        if (cancelled || d == null) return undefined;
        duration = d || 0;
        const resume = startAtRef.current;
        if (resume > 1 && (!duration || resume < duration - 5)) {
          lastSaved = resume;
          latest = resume;
          return player.setCurrentTime(resume).catch(() => {});
        }
      })
      .catch(() => {});

    const handleTimeUpdate = ({ seconds, duration: d }) => {
      duration = d || duration;
      latest = seconds;
      if (seconds - lastSaved >= SAVE_EVERY_SEC) {
        lastSaved = seconds;
        const done = duration > 0 && seconds / duration >= COMPLETE_AT;
        if (done) completedSent = true;
        save(seconds, done);
      }
    };

    const handlePause = ({ seconds }) => {
      lastSaved = seconds;
      latest = seconds;
      save(seconds, completedSent);
    };

    const handleEnded = () => {
      completedSent = true;
      save(duration || latest, true);
    };

    player.on("timeupdate", handleTimeUpdate);
    player.on("pause", handlePause);
    player.on("ended", handleEnded);

    return () => {
      cancelled = true;
      // Flush the final position when leaving mid-playback so the resume point
      // isn't stuck at the last throttled save.
      if (latest > lastSaved && !completedSent) {
        onSaveRef.current?.({ positionSec: Math.floor(latest), completed: false });
      }
      player.off("timeupdate", handleTimeUpdate);
      player.off("pause", handlePause);
      player.off("ended", handleEnded);
      player.destroy().catch(() => {});
      el.remove();
    };
    // embedUrl is the only identity that should remount the player.
  }, [embedUrl]);

  return <div ref={mountRef} className="size-full [&_iframe]:rounded-2xl" />;
};

// ── Fallbacks ────────────────────────────────────────────────────────────────

const YouTubeEmbed = ({ embedUrl }) => (
  <iframe
    src={embedUrl}
    title="Reproductor del tutorial"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="size-full rounded-2xl border-0"
  />
);

const EmptyState = ({ message }) => (
  <div className="flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <span className="font-inter text-[11.5px] tracking-[-0.44px] text-white/55">
      {message}
    </span>
  </div>
);

/**
 * VideoPlayer — academy player for the normal-user tutorial page.
 *
 * Vimeo links get the tracked `@vimeo/player`; YouTube falls back to a plain
 * embed (no progress tracking); anything else shows a placeholder.
 *
 * @param {string}  url        - the tutorial video URL
 * @param {number}  startAt    - seconds to resume from (0 = start)
 * @param {(p: { positionSec: number, completed: boolean }) => void} onSave
 * @param {string}  [className]
 */
const VideoPlayer = ({ url, startAt = 0, onSave, className }) => {
  const { provider, embedUrl } = detectVideoSource(url);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-2xl bg-[#0c1c21] shadow-[0px_8px_24px_0px_rgba(25,54,63,0.16)]",
        className,
      )}
    >
      {provider === "vimeo" ? (
        <VimeoTrackedPlayer embedUrl={embedUrl} startAt={startAt} onSave={onSave} />
      ) : provider === "youtube" ? (
        <YouTubeEmbed embedUrl={embedUrl} />
      ) : provider === "other" ? (
        <EmptyState message="Este enlace no es de Vimeo ni YouTube." />
      ) : (
        <EmptyState message="Este tutorial aún no tiene un vídeo disponible." />
      )}
    </div>
  );
};

export default VideoPlayer;
