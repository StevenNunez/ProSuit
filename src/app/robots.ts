import type { MetadataRoute } from "next";
import { sitio } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/carrito", "/pedido/", "/mi-cuenta", "/login", "/registro", "/recuperar", "/auth/"],
      },
    ],
    sitemap: `${sitio.url}/sitemap.xml`,
    host: sitio.url,
  };
}
