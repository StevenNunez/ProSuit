import type { MetadataRoute } from "next";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/sitio";

const estaticas: { ruta: string; prioridad: number; frecuencia: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { ruta: "/", prioridad: 1, frecuencia: "weekly" },
  { ruta: "/tienda", prioridad: 0.9, frecuencia: "daily" },
  { ruta: "/servicios", prioridad: 0.8, frecuencia: "monthly" },
  { ruta: "/contacto", prioridad: 0.8, frecuencia: "monthly" },
  { ruta: "/galeria", prioridad: 0.6, frecuencia: "monthly" },
  { ruta: "/sobre", prioridad: 0.6, frecuencia: "monthly" },
  { ruta: "/equipo", prioridad: 0.5, frecuencia: "monthly" },
  { ruta: "/testimonios", prioridad: 0.5, frecuencia: "monthly" },
  { ruta: "/recursos", prioridad: 0.5, frecuencia: "monthly" },
  { ruta: "/faq", prioridad: 0.6, frecuencia: "monthly" },
  { ruta: "/seguimiento", prioridad: 0.3, frecuencia: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = sitio.url.replace(/\/$/, "");
  const ahora = new Date();
  const entradas: MetadataRoute.Sitemap = estaticas.map((e) => ({
    url: `${base}${e.ruta}`,
    lastModified: ahora,
    changeFrequency: e.frecuencia,
    priority: e.prioridad,
  }));

  // Productos y categorías publicados (con service role para no depender de cookies).
  try {
    const admin = crearClienteAdmin();
    const [{ data: productos }, { data: categorias }] = await Promise.all([
      admin.from("productos").select("slug, actualizado_el").eq("activo", true),
      admin.from("categorias").select("slug").eq("activa", true),
    ]);
    for (const c of categorias ?? []) {
      entradas.push({ url: `${base}/tienda?categoria=${c.slug}`, lastModified: ahora, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const p of productos ?? []) {
      entradas.push({ url: `${base}/producto/${p.slug}`, lastModified: new Date(p.actualizado_el), changeFrequency: "weekly", priority: 0.8 });
    }
  } catch {
    // Sin base de datos disponible el sitemap igual sirve las páginas fijas.
  }
  return entradas;
}
