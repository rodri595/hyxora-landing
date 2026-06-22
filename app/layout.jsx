import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = "https://hyxora.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hyxora - Plataforma DeFi: Finanzas Descentralizadas en tus Manos",
    template: "%s | Hyxora",
  },
  description:
    "Hyxora es tu plataforma multiproducto financiero para el mundo DeFi. Seguridad, autocustodia, oportunidades descentralizadas y control total de tus activos cripto. Intercambios, fondos indexados e ingresos pasivos.",
  keywords: [
    "DeFi",
    "finanzas descentralizadas",
    "criptomonedas",
    "blockchain",
    "autocustodia",
    "wallet cripto",
    "plataforma financiera",
    "intercambio cripto",
    "fondos indexados",
    "ingresos pasivos",
    "seguridad blockchain",
    "Web3",
    "finanzas digitales",
    "Hyxora",
  ],
  authors: [{ name: "Hyxora Team" }],
  creator: "Hyxora",
  publisher: "Hyxora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",

    url: siteUrl,
    title: "Hyxora - Plataforma DeFi: Finanzas Descentralizadas en tus Manos",
    description:
      "Plataforma multiproducto financiero con seguridad, autocustodia y acceso a oportunidades DeFi. Control total de tus activos cripto.",
    siteName: "Hyxora",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hyxora - Plataforma DeFi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyxora - Plataforma DeFi: Finanzas Descentralizadas",
    description:
      "Tu plataforma multiproducto financiero para el mundo DeFi. Seguridad, autocustodia y control total.",
    images: ["/twitter-card.jpg"],
    creator: "@hyxora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icons and manifest are generated automatically by Next.js from the
  // file conventions in /app: favicon.ico, icon0.svg, icon1.png,
  // apple-icon.png and manifest.json. Hard-coding them here previously
  // pointed at non-existent files, so iOS "Add to Home Screen" fell back
  // to the "H" letter instead of the brand logo.
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-ES": siteUrl,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "Hyxora",
    description:
      "Plataforma multiproducto financiero para el mundo DeFi con seguridad, autocustodia y oportunidades descentralizadas",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    // sameAs: [
    //   "https://twitter.com/hyxora",
    //   "https://linkedin.com/company/hyxora",
    //   "https://github.com/hyxora",
    // ],
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      category: "Financial Services",
    },
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="apple-mobile-web-app-title" content="Hyxora" />
      </head>

      <body
        className={`${inter.variable} bg-[#0D0D0D] font-inter text-[1rem]  antialiased `}
      >
        <Toaster
          toastOptions={{
            duration: 5000,
            className: `
            rounder=d-md! border-[#24292D]! bg-[#0D0D0D]!
            text-[14px]! font-inter! font-bold! text-[#FFF]! leading-[normal]! tracking-[-0.56px]!
              `,
          }}
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
