// Curated public teaser videos for the marketing "Centro de aprendizaje".
// Self-contained on purpose: the public landing must not depend on the admin /
// dashboard data. Swap for a real hook (e.g. useGetPublicTutorials) once a
// backend exists. Posters are rendered as gradients, so no image assets needed.

export const TUTORIALS = [
  {
    id: "p-101",
    title: "¿Qué es Hyxora y cómo funciona?",
    description:
      "Un recorrido por la plataforma: qué resuelve, cómo se estructura y qué puedes hacer desde tu panel.",
    category: "Primeros pasos",
    url: "https://vimeo.com/76979871",
    durationSec: 412,
    publishedAt: "2026-05-02",
    gradient: ["#2F80ED", "#1B4F9C"],
  },
  {
    id: "p-102",
    title: "Configura tu cuenta y wallet en 5 minutos",
    description:
      "Paso a paso para dejar tu cuenta lista: verificación, wallet y primeras preferencias.",
    category: "Primeros pasos",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    durationSec: 318,
    publishedAt: "2026-05-05",
    gradient: ["#56CCF2", "#2F80ED"],
  },
  {
    id: "p-201",
    title: "Blockchain explicado sin tecnicismos",
    description:
      "Bloques, hashes y consenso contados con analogías simples para entenderlo de verdad.",
    category: "Fundamentos blockchain",
    url: "https://vimeo.com/22439234",
    durationSec: 734,
    publishedAt: "2026-04-18",
    gradient: ["#7B61FF", "#4B3BAA"],
  },
  {
    id: "p-301",
    title: "Cómo leer un gráfico de velas",
    description:
      "Apertura, cierre, mechas y volumen: aprende a interpretar lo que el precio te está diciendo.",
    category: "Trading y mercados",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    durationSec: 698,
    publishedAt: "2026-03-30",
    gradient: ["#16A34A", "#0E6B32"],
  },
  {
    id: "p-401",
    title: "Protege tus claves frente a phishing",
    description:
      "Las estafas más comunes y un checklist práctico para no caer en ninguna de ellas.",
    category: "Seguridad y custodia",
    url: "https://vimeo.com/57580368",
    durationSec: 521,
    publishedAt: "2026-03-20",
    gradient: ["#E0A82E", "#9C7212"],
  },
  {
    id: "p-501",
    title: "Estrategias DeFi para ir un paso más allá",
    description:
      "Intercambios, fondos indexados e ingresos pasivos: el mundo descentralizado a tu alcance.",
    category: "Estrategias avanzadas",
    url: "https://www.youtube.com/watch?v=Yb6825iv0Vk",
    durationSec: 565,
    publishedAt: "2026-03-08",
    gradient: ["#EB5757", "#A53636"],
  },
];
