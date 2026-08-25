import QuizPage from "@/templates/QuizPage";

export const metadata = {
  title: "Cuestionario - Hyxora",
  description:
    "Responde unas breves preguntas para que Hyxora pueda ofrecerte contenido y novedades adaptadas a ti.",
  openGraph: {
    title: "Cuestionario - Hyxora",
    description:
      "Responde unas breves preguntas para que Hyxora pueda ofrecerte contenido y novedades adaptadas a ti.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/quiz",
  },
};

export default function Page() {
  return <QuizPage />;
}
