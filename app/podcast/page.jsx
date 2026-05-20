import PodcastPage from "@/templates/PodcastPage";

export const metadata = {
  title: "Podcast - Hyxora",
  description:
    "Escucha el podcast de Hyxora y mantente al día con las últimas novedades del mundo DeFi, finanzas descentralizadas y más.",
  openGraph: {
    title: "Podcast - Hyxora",
    description:
      "El podcast de Hyxora: conversaciones, análisis y todo sobre las finanzas descentralizadas.",
    type: "website",
  },
  alternates: {
    canonical: "https://hyxora.com/podcast",
  },
};

export default function Page() {
  return <PodcastPage />;
}
