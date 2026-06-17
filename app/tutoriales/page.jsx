import TutorialsPage from "@/templates/TutorialsPage";

export const metadata = {
  title: "Centro de aprendizaje - Tutoriales",
  description:
    "Aprende el mundo cripto de cero a experto con los tutoriales de Hyxora: blockchain, trading, seguridad y estrategias DeFi explicados de forma fácil.",
  openGraph: {
    title: "Centro de aprendizaje - Hyxora",
    description:
      "Tutoriales en vídeo para entender criptomonedas y blockchain de forma fácil, interactiva y confiable.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/tutoriales",
  },
};

export default function Page() {
  return <TutorialsPage />;
}
