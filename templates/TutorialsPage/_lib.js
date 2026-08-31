// Presentation helpers for the public learning center grid. Kept local so the
// marketing /tutorials page stays self-contained and independent from the
// dashboard academy code.

import { parseTutorialTitle } from "@/utils/tutorialTitle";

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

// Posters render a gradient (no image assets needed), derived from the
// category accent so each tutorial gets an on-brand backdrop.
export const gradientFromAccent = (accent) => {
  const base = accent || "#19363F";
  return [base, darken(base)];
};

// Map a backend tutorial into the shape the public VideoCard / VideoModal
// expect: a `category` label string and a derived `gradient` tuple.
export const decoratePublicTutorial = (t) => {
  if (!t) return null;
  const accent = t.category?.accent ?? t.accent ?? "#19363F";
  // The manual order rides inside the stored title as JSON — unpack it here so
  // the cards and modal keep reading a plain `title` (utils/tutorialTitle.js).
  const { title, order, meta } = parseTutorialTitle(t.title);
  return {
    ...t,
    title,
    order,
    titleMeta: meta,
    category: t.category?.label ?? t.category ?? "",
    gradient: t.gradient ?? gradientFromAccent(accent),
  };
};
