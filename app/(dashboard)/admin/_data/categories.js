// Mock categories data for the admin module. Categories are the small lookup
// table that classifies tutorials. Membership gating lives on the tutorial, not
// the category. There is no backend yet — this seeds local state.
// Replace with a real hook (e.g. useGetCategories) later.

import { CATEGORIES } from "../../academy/_data";

// ── Membership gating ─────────────────────────────────────────────────────────
// Mirrors the public plan names (see templates/HomePage/Plans). Applied per
// tutorial via `membershipType`. "all" means any logged-in user; the rest require
// at least that plan. (A tutorial flagged `isPublic` bypasses this entirely.)
export const MEMBERSHIPS = {
  all: {
    id: "all",
    label: "Todos",
    badge: "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.6)]",
  },
  basic: { id: "basic", label: "Basic", badge: "bg-sky-50 text-sky-700" },
  premium: {
    id: "premium",
    label: "Premium",
    badge: "bg-violet-50 text-violet-700",
  },
  business: {
    id: "business",
    label: "Business",
    badge: "bg-emerald-50 text-emerald-700",
  },
  founder: {
    id: "founder",
    label: "Founder",
    badge: "bg-amber-50 text-amber-700",
  },
};

export const MEMBERSHIP_OPTIONS = Object.values(MEMBERSHIPS).map((m) => ({
  value: m.id,
  label: m.label,
}));

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
