import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
  webpack: (config) => {
    // Add memory limits for Next.js webpack
    config.optimization = {
      ...config.optimization,
      minimize: false,
    };
    return config;
  },
};

export default nextConfig;
