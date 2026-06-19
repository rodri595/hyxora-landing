// Mock tutorials data. Replace with a real hook (e.g. useGetTutorials) later.
// Posters are rendered as gradients so no image assets are required yet.

export const CATEGORIES = [
  {
    id: "primeros-pasos",
    label: "Primeros pasos",
    description: "Empieza aquí si es tu primera vez",
    accent: "#2F80ED",
  },
  {
    id: "fundamentos",
    label: "Fundamentos blockchain",
    description: "Los conceptos que sostienen todo",
    accent: "#7B61FF",
  },
  {
    id: "trading",
    label: "Trading y mercados",
    description: "Lee el mercado con criterio",
    accent: "#16A34A",
  },
  {
    id: "seguridad",
    label: "Seguridad y custodia",
    description: "Protege tus activos como un profesional",
    accent: "#E0A82E",
  },
  {
    id: "avanzado",
    label: "Estrategias avanzadas",
    description: "Para quienes ya dominan lo básico",
    accent: "#EB5757",
  },
];

const accentFor = (id) =>
  CATEGORIES.find((c) => c.id === id)?.accent ?? "#19363F";

const make = (v) => ({
  ...v,
  accent: accentFor(v.categoryId),
  category: CATEGORIES.find((c) => c.id === v.categoryId)?.label ?? "",
});

export const VIDEOS = [
  // ── Primeros pasos ──────────────────────────────────────────────
  make({
    id: "t-101",
    slug: "que-es-hyxora",
    title: "¿Qué es Hyxora y cómo funciona?",
    description:
      "Un recorrido completo por la plataforma: qué problema resuelve, cómo se estructura y qué puedes hacer desde tu panel.",
    categoryId: "primeros-pasos",
    durationSec: 412,
    level: "Principiante",
    publishedAt: "2026-05-02",
    gradient: ["#2F80ED", "#1B4F9C"],
  }),
  make({
    id: "t-102",
    slug: "configura-tu-cuenta",
    title: "Configura tu cuenta y wallet en 5 minutos",
    description:
      "Te guiamos paso a paso para dejar tu cuenta lista: verificación, wallet y primeras preferencias.",
    categoryId: "primeros-pasos",
    durationSec: 318,
    level: "Principiante",
    publishedAt: "2026-05-05",
    gradient: ["#56CCF2", "#2F80ED"],
  }),
  make({
    id: "t-103",
    slug: "tu-primer-deposito",
    title: "Tu primer depósito sin estrés",
    description:
      "Métodos disponibles, tiempos de confirmación y errores comunes que conviene evitar.",
    categoryId: "primeros-pasos",
    durationSec: 506,
    level: "Principiante",
    publishedAt: "2026-05-09",
    gradient: ["#6FB1FC", "#4364F7"],
  }),
  make({
    id: "t-104",
    slug: "navega-el-dashboard",
    title: "Navega el dashboard como un experto",
    description:
      "Cada sección del panel explicada: dónde encontrar tus NFTs, encuestas y simulaciones.",
    categoryId: "primeros-pasos",
    durationSec: 264,
    level: "Principiante",
    publishedAt: "2026-05-12",
    gradient: ["#4A90E2", "#0B3C7A"],
  }),

  // ── Fundamentos blockchain ──────────────────────────────────────
  make({
    id: "t-201",
    slug: "blockchain-explicado",
    title: "Blockchain explicado sin tecnicismos",
    description:
      "Bloques, hashes y consenso contados con analogías simples para entenderlo de verdad.",
    categoryId: "fundamentos",
    durationSec: 734,
    level: "Principiante",
    publishedAt: "2026-04-18",
    gradient: ["#7B61FF", "#4B2FB8"],
  }),
  make({
    id: "t-202",
    slug: "wallets-y-llaves",
    title: "Wallets, llaves públicas y privadas",
    description:
      "Qué representa cada llave, por qué nunca debes compartir la privada y cómo se firman las transacciones.",
    categoryId: "fundamentos",
    durationSec: 561,
    level: "Intermedio",
    publishedAt: "2026-04-22",
    gradient: ["#9D7BFF", "#6943D6"],
  }),
  make({
    id: "t-203",
    slug: "smart-contracts",
    title: "Smart contracts: código que se cumple solo",
    description:
      "Cómo funcionan los contratos inteligentes y qué garantías ofrecen frente a un acuerdo tradicional.",
    categoryId: "fundamentos",
    durationSec: 642,
    level: "Intermedio",
    publishedAt: "2026-04-27",
    gradient: ["#8E7CFF", "#3A2A9E"],
  }),
  make({
    id: "t-204",
    slug: "gas-y-comisiones",
    title: "Gas y comisiones, ¿por qué pago esto?",
    description:
      "Entiende qué es el gas, cómo se calcula y trucos para pagar menos en momentos de congestión.",
    categoryId: "fundamentos",
    durationSec: 389,
    level: "Intermedio",
    publishedAt: "2026-05-01",
    gradient: ["#A88BFF", "#5B3FD6"],
  }),

  // ── Trading y mercados ──────────────────────────────────────────
  make({
    id: "t-301",
    slug: "leer-un-grafico",
    title: "Cómo leer un gráfico de velas",
    description:
      "Apertura, cierre, mechas y volumen. Aprende a interpretar lo que el precio te está diciendo.",
    categoryId: "trading",
    durationSec: 698,
    level: "Intermedio",
    publishedAt: "2026-03-30",
    gradient: ["#27AE60", "#0E7A3C"],
  }),
  make({
    id: "t-302",
    slug: "gestion-de-riesgo",
    title: "Gestión de riesgo para no quemarte",
    description:
      "Tamaño de posición, stop-loss y la regla que todo trader debería respetar antes de operar.",
    categoryId: "trading",
    durationSec: 815,
    level: "Avanzado",
    publishedAt: "2026-04-04",
    gradient: ["#2ECC71", "#11643A"],
  }),
  make({
    id: "t-303",
    slug: "indicadores-clave",
    title: "Los 4 indicadores que de verdad uso",
    description:
      "Medias móviles, RSI, MACD y volumen explicados con ejemplos reales del mercado.",
    categoryId: "trading",
    durationSec: 552,
    level: "Intermedio",
    publishedAt: "2026-04-10",
    gradient: ["#43E97B", "#1F9C57"],
  }),
  make({
    id: "t-304",
    slug: "psicologia-del-trader",
    title: "Psicología del trader: domina tus emociones",
    description:
      "FOMO, miedo y avaricia. Cómo construir una rutina que mantenga tus decisiones frías.",
    categoryId: "trading",
    durationSec: 470,
    level: "Avanzado",
    publishedAt: "2026-04-15",
    gradient: ["#1FD18E", "#0A7A4D"],
  }),

  // ── Seguridad y custodia ────────────────────────────────────────
  make({
    id: "t-401",
    slug: "protege-tus-claves",
    title: "Protege tus claves frente a phishing",
    description:
      "Las estafas más comunes y un checklist práctico para no caer en ninguna de ellas.",
    categoryId: "seguridad",
    durationSec: 521,
    level: "Principiante",
    publishedAt: "2026-03-20",
    gradient: ["#F2C94C", "#C28B12"],
  }),
  make({
    id: "t-402",
    slug: "cold-storage",
    title: "Cold storage: tu bóveda offline",
    description:
      "Qué es una hardware wallet, cuándo usarla y cómo configurarla sin exponer tu seed.",
    categoryId: "seguridad",
    durationSec: 633,
    level: "Intermedio",
    publishedAt: "2026-03-25",
    gradient: ["#F7B733", "#B26A00"],
  }),
  make({
    id: "t-403",
    slug: "2fa-correctamente",
    title: "Configura 2FA correctamente",
    description:
      "Por qué el SMS no basta y cómo migrar a una app de autenticación o llave física.",
    categoryId: "seguridad",
    durationSec: 287,
    level: "Principiante",
    publishedAt: "2026-03-28",
    gradient: ["#FFD45E", "#D99400"],
  }),

  // ── Estrategias avanzadas ───────────────────────────────────────
  make({
    id: "t-501",
    slug: "defi-staking",
    title: "DeFi y staking: pon a trabajar tus activos",
    description:
      "Cómo generar rendimiento de forma responsable y qué riesgos esconden las APYs altas.",
    categoryId: "avanzado",
    durationSec: 902,
    level: "Avanzado",
    publishedAt: "2026-02-28",
    gradient: ["#EB5757", "#A11D1D"],
  }),
  make({
    id: "t-502",
    slug: "portfolio-rebalancing",
    title: "Rebalanceo de cartera paso a paso",
    description:
      "Una estrategia sencilla para mantener tu portfolio alineado con tu perfil de riesgo.",
    categoryId: "avanzado",
    durationSec: 688,
    level: "Avanzado",
    publishedAt: "2026-03-05",
    gradient: ["#FF6B6B", "#C0392B"],
  }),
  make({
    id: "t-503",
    slug: "lectura-onchain",
    title: "Lectura on-chain para anticiparte",
    description:
      "Flujos de exchanges, wallets ballena y métricas on-chain que adelantan movimientos.",
    categoryId: "avanzado",
    durationSec: 1024,
    level: "Avanzado",
    publishedAt: "2026-03-12",
    gradient: ["#F45B5B", "#7A1414"],
  }),
];

// Featured hero (Apple TV-style spotlight).
export const FEATURED = VIDEOS.find((v) => v.slug === "leer-un-grafico");

export const getVideoBySlug = (slug) => VIDEOS.find((v) => v.slug === slug);

export const getVideosByCategory = (categoryId) =>
  VIDEOS.filter((v) => v.categoryId === categoryId);
