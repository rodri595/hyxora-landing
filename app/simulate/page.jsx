import SimulatePage from "@/templates/SimulatePage";

export const metadata = {
  title: "Simulación - Hyxora",
  description:
    "Simula operaciones y escenarios en la plataforma Hyxora. Experimenta con nuestros servicios DeFi de manera segura.",
  openGraph: {
    title: "Simulación - Hyxora",
    description:
      "Simula operaciones y escenarios en la plataforma DeFi de Hyxora. Experimenta con nuestros servicios financieros descentralizados de manera segura.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/simulate",
  },
};

export default function Page() {
  return <SimulatePage />;
}
