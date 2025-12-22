import FAQPage from "@/templates/FAQPage";

export const metadata = {
  title: "Preguntas Frecuentes - FAQ",
  description:
    "Encuentra respuestas a las preguntas más frecuentes sobre Hyxora, nuestra plataforma DeFi, seguridad, autocustodia, productos financieros y más.",
  openGraph: {
    title: "Preguntas Frecuentes - Hyxora",
    description:
      "Respuestas a tus preguntas sobre la plataforma DeFi de Hyxora, seguridad, productos y servicios financieros descentralizados.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/faq",
  },
};

export default function Page() {
  return <FAQPage />;
}
