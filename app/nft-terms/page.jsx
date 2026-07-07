import FounderTermsPage from "@/templates/FounderTermsPage";

export const metadata = {
  title: "Términos y Condiciones - Hyxora",
  description:
    "Lee los términos y condiciones de uso de la plataforma Hyxora. Conoce tus derechos y responsabilidades al utilizar nuestros servicios DeFi.",
  openGraph: {
    title: "Términos y Condiciones - Hyxora",
    description:
      "Términos y condiciones de uso de la plataforma DeFi de Hyxora. Información legal sobre el uso de nuestros servicios financieros descentralizados.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/nft-terms",
  },
};

export default function Page() {
  return <FounderTermsPage />;
}
