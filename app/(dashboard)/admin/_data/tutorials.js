// Visibility states drive whether a tutorial is shown to the public.
export const VISIBILITY = {
  visible: {
    id: "visible",
    label: "Visible",
    description: "Publicado y visible para todos los usuarios.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "#059669",
  },
  hidden: {
    id: "hidden",
    label: "Oculto",
    description:
      "No aparece en el listado público, pero sigue accesible por enlace.",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "#d97706",
  },
  disabled: {
    id: "disabled",
    label: "Deshabilitado",
    description: "Desactivado por completo. Nadie puede reproducirlo.",
    badge:
      "bg-[rgba(25,54,63,0.06)] text-[rgba(25,54,63,0.55)] border-[rgba(25,54,63,0.12)]",
    dot: "rgba(25,54,63,0.4)",
  },
};

export const VISIBILITY_OPTIONS = Object.values(VISIBILITY);

const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? "";
const categoryAccent = (id) =>
  CATEGORIES.find((c) => c.id === id)?.accent ?? "#19363F";

const make = (v) => ({
  isPublic: false,
  ...v,
  category: v.category?.label ?? categoryLabel(v.categoryId),
  accent: v.category?.accent ?? categoryAccent(v.categoryId),
});

// Re-attach derived fields after edits/creates so the table stays consistent.
export const decorateTutorial = make;
