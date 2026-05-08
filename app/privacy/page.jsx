import PrivacyPage from "@/templates/PrivacyPage";

export const metadata = {
  title: "Política de Privacidad - Hyxora",
  description:
    "Consulta la política de privacidad de Hyxora. Conoce cómo recopilamos, usamos y protegemos tu información personal al utilizar nuestra plataforma DeFi.",
  openGraph: {
    title: "Política de Privacidad - Hyxora",
    description:
      "Política de privacidad de la plataforma DeFi de Hyxora. Transparencia total sobre el tratamiento de tus datos personales.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/privacy",
  },
};

export default function Page() {
  return <PrivacyPage />;
}
