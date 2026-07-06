import TutorialsPage from "@/templates/TutorialsPage";

export const metadata = {
  title: "Tutoriales - Hyxora",
  description:
    "Aprende a usar Hyxora con nuestras guías en vídeo paso a paso: primeros pasos, seguridad, autocustodia y productos DeFi.",
  openGraph: {
    title: "Tutoriales - Hyxora",
    description:
      "Guías en vídeo para dominar la plataforma DeFi de Hyxora, paso a paso.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/tutorials",
  },
};

export default function Page() {
  return <TutorialsPage />;
}
