import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Connect Love",
    short_name: "ConnectLove",
    description:
      "A safety-focused online dating and matchmaking platform for meaningful connections.",
    start_url: "/",
    display: "standalone",
    background_color: "#090910",
    theme_color: "#e11d48",
    icons: [
      {
        src: "/connect-love-logo.png?v=4",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/connect-love-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/connect-love-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
