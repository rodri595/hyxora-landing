import NewsletterPage from "@/templates/NewsletterPage";

export const metadata = {
  title: "Newsletter - Avances semanales",
  description:
    "Cada semana, un resumen en PDF de los avances de Hyxora: qué hemos lanzado, qué viene y en qué estamos trabajando.",
  openGraph: {
    title: "Newsletter - Hyxora",
    description: "Los avances semanales de Hyxora, en PDF.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/newsletter",
  },
};

export default function Page() {
  return <NewsletterPage />;
}
