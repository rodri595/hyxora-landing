// Small presentation helpers for the tutorials section.

export const formatDuration = (totalSec = 0) => {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

export const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Darken a hex color by a 0–1 amount (for deriving poster gradients).
const darken = (hex, amount = 0.35) => {
  const h = (hex ?? "").replace("#", "");
  if (h.length !== 6) return "#0E2329";
  const num = Number.parseInt(h, 16);
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(((num >> 16) & 255) * (1 - amount));
  const g = clamp(((num >> 8) & 255) * (1 - amount));
  const b = clamp((num & 255) * (1 - amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

// Posters render a gradient instead of an image asset — derive one from the
// category accent so each tutorial gets an on-brand backdrop.
export const gradientFromAccent = (accent) => {
  const base = accent || "#19363F";
  return [base, darken(base)];
};

// Map a backend academy tutorial into the shape the UI components expect:
// `slug` (the route uses the tutorial id), the enriched `category` label /
// `accent`, and a derived `gradient`.
export const decorateAcademyTutorial = (t) => {
  if (!t) return null;
  const accent = t.category?.accent ?? t.accent ?? "#19363F";
  return {
    ...t,
    slug: t.id,
    category: t.category?.label ?? t.category ?? "",
    accent,
    gradient: t.gradient ?? gradientFromAccent(accent),
  };
};
