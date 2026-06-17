// Helpers shared by the tutorials admin module and its sidebars.
// Pure functions — no React, safe to import anywhere.

/**
 * Detect the provider behind a video URL and derive an embeddable URL.
 * Supports Vimeo and YouTube; anything else is returned as "other".
 *
 * @param {string} rawUrl
 * @returns {{ provider: "vimeo"|"youtube"|"other"|null, id: string|null, embedUrl: string|null, url: string }}
 */
export const detectVideoSource = (rawUrl = "") => {
  const url = (rawUrl ?? "").trim();
  if (!url) return { provider: null, id: null, embedUrl: null, url };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return {
      provider: "vimeo",
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      url,
    };
  }

  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) {
    return {
      provider: "youtube",
      id: yt[1],
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
      url,
    };
  }

  return { provider: "other", id: null, embedUrl: url, url };
};

export const isSupportedVideoUrl = (url) =>
  ["vimeo", "youtube"].includes(detectVideoSource(url).provider);

/** Format a duration in seconds as `m:ss` or `h:mm:ss`. */
export const formatDuration = (totalSec = 0) => {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

/** Parse a `m:ss` / `h:mm:ss` / `ss` string into seconds. */
export const parseDuration = (str = "") => {
  const trimmed = String(str).trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(":").map((n) => Number.parseInt(n, 10));
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

/** Short date, e.g. "12 may 2026". */
export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
