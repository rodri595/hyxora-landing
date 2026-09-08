import carlosIMG from "@/assets/imgs/people/carlos.webp";
import victorIMG from "@/assets/imgs/people/victor.webp";

// Everything the press page offers lives here, so adding an asset is a data
// edit rather than a JSX one. Every `file` is a real path under /public/press
// — the folder is the same set of files the ZIP is built from, so a link and
// the kit can never drift apart.

export const PRESS_KIT_ZIP = "/brand-assets/hyxora-press-kit.zip";
export const PRESS_EMAIL = "future@hyxora.com";

// The section ids double as the floating rail entries and as the scroll
// anchors, so the rail is derived from this list rather than duplicated.
export const PRESS_SECTIONS = [
  { id: "logos", label: "Logotipos" },
  { id: "color", label: "Color" },
  { id: "app", label: "App" },
  { id: "documentos", label: "Documentos" },
  { id: "portavoces", label: "Portavoces" },
  { id: "uso", label: "Uso de marca" },
];

// `tone` picks the preview backdrop: the mark is only legible against the
// surface it was drawn for, so each variant carries its own.
export const PRESS_LOGOS = [
  {
    id: "principal",
    name: "Isotipo principal",
    description: "Versión por defecto. Úsala sobre fondos claros o neutros.",
    tone: "light",
    src: "/brand-assets/hyxora-isotipo.svg",
    files: [
      { label: "SVG", href: "/brand-assets/hyxora-isotipo.svg" },
      { label: "PNG", href: "/brand-assets/hyxora-isotipo-1024.png" },
    ],
  },
  {
    id: "oscuro",
    name: "Isotipo sobre fondo oscuro",
    description: "Para fondos oscuros, vídeo y presentaciones en negativo.",
    tone: "dark",
    src: "/brand-assets/hyxora-isotipo-oscuro.svg",
    files: [
      { label: "SVG", href: "/brand-assets/hyxora-isotipo-oscuro.svg" },
      { label: "PNG", href: "/brand-assets/hyxora-isotipo-oscuro-1024.png" },
    ],
  },
  {
    id: "mono-oscuro",
    name: "Monocromo oscuro",
    description: "Fondo transparente. Para impresión a una tinta y documentos.",
    tone: "grid",
    src: "/brand-assets/hyxora-isotipo-negro.svg",
    files: [
      { label: "SVG", href: "/brand-assets/hyxora-isotipo-negro.svg" },
      { label: "PNG", href: "/brand-assets/hyxora-isotipo-negro-1024.png" },
    ],
  },
  {
    id: "mono-blanco",
    name: "Monocromo blanco",
    description: "Fondo transparente. Para fotografía y fondos con color.",
    tone: "solid",
    src: "/brand-assets/hyxora-isotipo-blanco.svg",
    files: [
      { label: "SVG", href: "/brand-assets/hyxora-isotipo-blanco.svg" },
      { label: "PNG", href: "/brand-assets/hyxora-isotipo-blanco-1024.png" },
    ],
  },
];

export const PRESS_COLORS = [
  { name: "Azul Hyxora", hex: "#2D68FF", usage: "Acento y llamadas a la acción" },
  { name: "Verde profundo", hex: "#19363F", usage: "Texto y superficies oscuras" },
  { name: "Gris marca", hex: "#EDEDED", usage: "Fondo del isotipo" },
  { name: "Blanco hueso", hex: "#FDFDFD", usage: "Superficies claras" },
  { name: "Verde positivo", hex: "#00A656", usage: "Estados positivos" },
  { name: "Negro texto", hex: "#1B1B1B", usage: "Titulares sobre fondo claro" },
];

export const PRESS_SCREENSHOTS = [
  {
    id: "app-01",
    caption: "Pantalla principal",
    description: "Resumen de cartera y accesos rápidos.",
    src: "/brand-assets/hyxora-app-01.png",
  },
  {
    id: "app-02",
    caption: "Detalle de activos",
    description: "Posiciones, rendimiento y movimientos.",
    src: "/brand-assets/hyxora-app-02.png",
  },
];

export const PRESS_DOCUMENTS = [
  {
    id: "dossier",
    name: "Dossier de prensa",
    description:
      "Información corporativa, modelo noBanco, adopción DeFi y detalles del programa NFT Founders.",
    href: "/brand-assets/hyxora-dossier-prensa.pdf",
    meta: "PDF",
  },
  {
    id: "nota-founders",
    name: "Nota informativa · Founders Fase 1",
    description: "Nota oficial sobre la primera fase del programa NFT Founders.",
    href: "/brand-assets/hyxora-nota-founders-fase1.pdf",
    meta: "PDF · 72 KB",
  },
  {
    id: "terminos-nft",
    name: "Términos del NFT Founders",
    description: "Condiciones completas del NFT Founders, en vigor desde mayo de 2026.",
    href: "/brand-assets/hyxora-terminos-nft-founders.pdf",
    meta: "PDF · 190 KB",
  },
];

// `initials` stays as the fallback for a spokesperson added before their
// portrait exists — the card renders the monogram until `photo` lands.
export const PRESS_SPOKESPEOPLE = [
  {
    id: "ceo",
    initials: "VC",
    photo: victorIMG,
    name: "Víctor Callejo",
    role: "CEO & Cofundador",
    topics: "Visión corporativa, expansión global y el modelo noBanco.",
  },
  {
    id: "cto",
    initials: "CC",
    photo: carlosIMG,
    name: "Carlos Callejo",
    role: "CTO",
    topics: "Desarrollo, seguridad e integración de herramientas DeFi e IA.",
  },
];

// The «no» column matters more than the «sí» one: it is what stops a partner
// recolouring the mark or calling us a bank in a video title.
export const PRESS_GUIDELINES = {
  do: [
    "Usa siempre los archivos originales de este kit.",
    "Deja un margen libre alrededor del logo igual a la altura de su marca interior.",
    "Sobre fondos oscuros o fotografías, usa la versión blanca o la de fondo oscuro.",
    "Escribe «Hyxora» con H mayúscula y «noBanco» con n minúscula y B mayúscula.",
  ],
  dont: [
    "No redibujes, deformes ni rotes el isotipo.",
    "No le apliques sombras, degradados ni contornos.",
    "No cambies sus colores ni lo coloques sobre fondos que resten legibilidad.",
    "No describas Hyxora como un banco, entidad de pago o gestora de fondos: es una interfaz de software de autocustodia.",
  ],
};
