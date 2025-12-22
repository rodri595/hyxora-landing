import PlansPage from "@/templates/PlansPage";

export const metadata = {
  title: "Planes y Precios",
  description:
    "Descubre los planes de Hyxora para acceder al mundo DeFi. Soluciones financieras descentralizadas adaptadas a tus necesidades. Multiproducto, seguridad y autocustodia.",
  openGraph: {
    title: "Planes y Precios - Hyxora",
    description:
      "Planes y opciones para acceder a las mejores oportunidades DeFi con Hyxora. Productos financieros descentralizados al alcance de todos.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/plans",
  },
};

export default function Page() {
  return <PlansPage />;
}
