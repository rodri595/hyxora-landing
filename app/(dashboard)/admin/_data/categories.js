// Mock categories data for the admin module. Categories are the small lookup
// table that classifies tutorials. There is no backend yet — this seeds local
// state. Replace with a real hook (e.g. useGetCategories) later.

import { CATEGORIES } from "../../academy/_data";

// Preset palette so accents stay on-brand and consistent across categories.
export const ACCENT_PRESETS = [
  "#2F80ED",
  "#7B61FF",
  "#16A34A",
  "#E0A82E",
  "#EB5757",
  "#0EA5E9",
  "#EC4899",
  "#19363F",
];

// slug used as the stable id/key. Lowercase, accent-stripped, dash-separated.
export const slugify = (str) =>
  (str ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Seed admin state from the canonical category list.
export const CATEGORY_SEED = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  description: c.description ?? "",
  accent: c.accent ?? "#19363F",
}));
