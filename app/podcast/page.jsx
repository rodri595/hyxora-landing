import PodcastPage from "@/templates/PodcastPage";

// To find channel IDs: go to youtube.com/@Hyxora → View page source → Ctrl+F "channelId"
// Or use: https://commentpicker.com/youtube-channel-id.php
const CHANNELS = [
  {
    id: "hyxora",
    channelId: "UC4WdMES613lOeBYor8y_YeQ",
    url: "https://www.youtube.com/@Hyxora",
    badge: "Principal",
    title: "¿Qué pasa en Hyxora?",
    description:
      "No nos gustan los videos de formación.. mejor desde la voz de los protagonistas en un podcast sabrás todo lo que ocurre en Hyxora, desde de dónde surge la idea, tecnologías, activos, a por qué esta app es perfecta para ti.",
  },
  {
    id: "elefante",
    channelId: "UCsCmz7TG7GtLk9tK8O-N5Rw",
    url: "https://www.youtube.com/@ElefanteDesnudo",
    badge: "Patrocinado por Hyxora",
    title: "El Elefante Desnudo",
    description:
      'Lo que todos ven, lo que nadie dice. Llevamos a expertos a la mesa para hablar de ese gran "elefante en la habitación" del que nadie se atreve a decir nada. Análisis directo y sin filtros.',
  },
];

async function fetchChannelVideos(channelId) {
  if (!channelId || channelId.startsWith("REPLACE_")) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const videos = [];
    for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      if (videos.length >= 3) break;
      const b = match[1];
      const videoId = (b.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1];
      if (!videoId) continue;
      const rawTitle = (b.match(/<title>(.*?)<\/title>/) || [])[1] || "";
      const published = (b.match(/<published>(.*?)<\/published>/) || [])[1];
      const title = rawTitle
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      videos.push({
        videoId,
        title,
        published: published ?? null,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
    return videos;
  } catch {
    return [];
  }
}

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

export default async function Page() {
  const channels = await Promise.all(
    CHANNELS.map(async (ch) => ({
      ...ch,
      videos: await fetchChannelVideos(ch.channelId),
    })),
  );

  return <PodcastPage channels={channels} />;
}
