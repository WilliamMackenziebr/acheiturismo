import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Achei Turismo",
    short_name: "Achei Turismo",
    description: "Descubra lugares, hospedagens, gastronomia e experiências pelo Vale do Paraíba.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05351f",
    theme_color: "#05351f",
    icons: [
      { src: "/icons/achei-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/achei-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/achei-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
