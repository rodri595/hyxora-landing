import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
export const metadata = {
  title: "Hyxora",
  description: "Hyxora",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Description no longer than 155 characters */}
        <meta name="description" content="Hyxora" />
        {/* Product Name */}
        <meta name="product-name" content="Hyxora" />
        {/* Twitter Card data */}
        {/* <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@ui8" />
        <meta name="twitter:title" content="Hyxora" />
        <meta
          name="twitter:description"
          content="Build AI powered brief generation tools with ready to use Tailwind code"
        />
        <meta name="twitter:creator" content="@ui8" /> */}
        {/* Twitter Summary card images must be at least 120x120px */}
        {/* <meta
          name="twitter:image"
          content="https://briefberry-cyan.vercel.app/twitter-card.png"
        /> */}
        {/* Open Graph data for Facebook */}
        {/* <meta property="og:title" content="Hyxora" />
        <meta property="og:type" content="Article" />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/briefberry-ai-powered-brief-generation-ui-kit-coded"
        />
        <meta
          property="og:image"
          content="https://briefberry-cyan.vercel.app/fb-og-image.png"
        />
        <meta
          property="og:description"
          content="Build AI powered brief generation tools with ready to use Tailwind code"
        />
        <meta
          property="og:site_name"
          content="Hyxora"
        />
        <meta property="fb:admins" content="132951670226590" /> */}
        {/* Open Graph data for LinkedIn */}
        {/* <meta property="og:title" content="Hyxora" />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/briefberry-ai-powered-brief-generation-ui-kit-coded"
        />
        <meta
          property="og:image"
          content="https://briefberry-cyan.vercel.app/linkedin-og-image.png"
        />
        <meta
          property="og:description"
          content="Build AI powered brief generation tools with ready to use Tailwind code"
        /> */}
        {/* Open Graph data for Pinterest */}
        {/* <meta property="og:title" content="Hyxora" />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/briefberry-ai-powered-brief-generation-ui-kit-coded"
        />
        <meta
          property="og:image"
          content="https://briefberry-cyan.vercel.app/pinterest-og-image.png"
        />
        <meta
          property="og:description"
          content="Build AI powered brief generation tools with ready to use Tailwind code"
        /> */}
      </head>

      <body
        className={`${inter.variable} bg-b-surface1 font-inter text-[1rem]  antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
