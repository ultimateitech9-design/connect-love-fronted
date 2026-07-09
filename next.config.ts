import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5002",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5002",
      },
    ],
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {},
};

export default nextConfig;
