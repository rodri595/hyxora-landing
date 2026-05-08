import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@privy-io/react-auth"],
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream", "sonic-boom", "pino-std-serializers"],

  turbopack: {
    resolveAlias: {
      "pino": "./lib/empty-module.js",
      "thread-stream": "./lib/empty-module.js",
    },
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "pino", "thread-stream"];
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pino": path.resolve(__dirname, "lib/empty-module.js"),
        "thread-stream": path.resolve(__dirname, "lib/empty-module.js"),
      };
    }
    return config;
  },

  devIndicators: false,

  // Compress responses
  compress: true,

  // Generate sitemap automatically
  poweredByHeader: false,

  // Image optimization for better SEO
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Security headers for SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
        ],
      },
    ];
  },
};

export default nextConfig;

