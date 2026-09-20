import type { MetadataRoute } from "next";
import { descripcionPrincipal } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ProSuit · Uniformes a medida",
    short_name: "ProSuit",
    description: descripcionPrincipal,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2c0453",
    lang: "es-CL",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
