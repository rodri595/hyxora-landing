import FoundersPage from "@/templates/FoundersPage";

export const metadata = {
  title: "Founders NFT",
  description:
    "Accede al programa exclusivo para fundadores de Hyxora. Beneficios únicos, acceso anticipado y ventajas especiales para los primeros miembros de la comunidad.",
  openGraph: {
    title: "Founders NFT - Hyxora",
    description:
      "Programa exclusivo para fundadores de Hyxora. Únete a los primeros miembros y accede a beneficios únicos en la plataforma DeFi.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/founders",
  },
};

export default function Page() {
  return <FoundersPage />;
}
