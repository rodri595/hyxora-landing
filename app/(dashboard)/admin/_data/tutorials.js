// Mock tutorials data for the admin module. There is no backend yet — videos
// are not stored as files, only referenced by their Vimeo / YouTube link.
// Replace the in-memory list with a real hook (e.g. useGetTutorials) later.

import { CATEGORIES } from "../../academy/_data";

export { CATEGORIES };

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

// Decorate a raw record with the derived category label / accent.
const make = (v) => ({
  ...v,
  category: categoryLabel(v.categoryId),
  accent: categoryAccent(v.categoryId),
});

export const TUTORIALS = [
  make({
    id: "t-101",
    title: "¿Qué es Hyxora y cómo funciona?",
    description:
      "Un recorrido completo por la plataforma: qué problema resuelve, cómo se estructura y qué puedes hacer desde tu panel.",
    categoryId: "primeros-pasos",
    url: "https://vimeo.com/76979871",
    durationSec: 412,
    visibility: "visible",
    createdAt: "2026-05-02T10:00:00Z",
    updatedAt: "2026-05-10T08:30:00Z",
  }),
  make({
    id: "t-102",
    title: "Configura tu cuenta y wallet en 5 minutos",
    description:
      "Te guiamos paso a paso para dejar tu cuenta lista: verificación, wallet y primeras preferencias.",
    categoryId: "primeros-pasos",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationSec: 318,
    visibility: "visible",
    createdAt: "2026-05-05T12:00:00Z",
    updatedAt: "2026-05-05T12:00:00Z",
  }),
  make({
    id: "t-201",
    title: "Blockchain explicado sin tecnicismos",
    description:
      "Bloques, hashes y consenso contados con analogías simples para entenderlo de verdad.",
    categoryId: "fundamentos",
    url: "https://vimeo.com/22439234",
    durationSec: 734,
    visibility: "hidden",
    createdAt: "2026-04-18T09:00:00Z",
    updatedAt: "2026-04-29T16:45:00Z",
  }),
  make({
    id: "t-301",
    title: "Cómo leer un gráfico de velas",
    description:
      "Apertura, cierre, mechas y volumen. Aprende a interpretar lo que el precio te está diciendo.",
    categoryId: "trading",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    durationSec: 698,
    visibility: "visible",
    createdAt: "2026-03-30T14:00:00Z",
    updatedAt: "2026-04-12T11:20:00Z",
  }),
  make({
    id: "t-401",
    title: "Protege tus claves frente a phishing",
    description:
      "Las estafas más comunes y un checklist práctico para no caer en ninguna de ellas.",
    categoryId: "seguridad",
    url: "https://vimeo.com/57580368",
    durationSec: 521,
    visibility: "disabled",
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-22T10:10:00Z",
  }),
];

// Re-attach derived fields after edits/creates so the table stays consistent.
export const decorateTutorial = make;
