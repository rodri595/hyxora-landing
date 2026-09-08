import PressPage from "@/templates/PressPage";

export const metadata = {
  title: "Sala de Prensa - Recursos para Medios",
  description:
    "Descarga los logotipos oficiales de Hyxora, material gráfico de la app, documentación corporativa y consulta las normas de uso de marca para medios y partners.",
  openGraph: {
    title: "Sala de Prensa - Hyxora",
    description:
      "Logotipos, material gráfico de la app y documentación oficial de Hyxora para medios, partners y colaboraciones.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/brand-assets",
  },
};

export default function Page() {
  return <PressPage />;
}
