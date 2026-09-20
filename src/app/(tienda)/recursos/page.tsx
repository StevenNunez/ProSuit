import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import Portada from "@/components/tienda/Portada";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { recursos } from "@/lib/contenido";
import { listarProductos } from "@/lib/datos/catalogo";
import { slugificar } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Guías sobre telas, tallas, personalización y cuidado de uniformes corporativos.",
  alternates: { canonical: "/recursos" },
};

export default async function PaginaRecursos() {
  const productos = await listarProductos({ limite: 4 });
  return (
    <>
      <Portada
        subtitulo="Recursos"
        titulo="Uniformes corporativos de alta calidad"
        descripcion="Herramientas y guías esenciales para optimizar la confección y gestión de prendas laborales."
        migas={[{ href: "/recursos", etiqueta: "Recursos" }]}
      />
      <section className="contenedor py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {recursos.map((r) => (
            <a key={r.titulo} href={`#${slugificar(r.titulo)}`} className="rounded-2xl border border-border p-6 transition hover:border-primary/40 hover:shadow-md">
              <BookOpen className="size-6 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">{r.titulo}</h2>
              <p className="mt-1 text-sm text-muted">{r.resumen}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-primary">Ver detalles →</span>
            </a>
          ))}
        </div>

        <div className="mt-16 space-y-12">
          {recursos.map((r) => (
            <article key={r.titulo} id={slugificar(r.titulo)} className="scroll-mt-28 max-w-3xl">
              <h2 className="font-display text-2xl font-bold">{r.titulo}</h2>
              <p className="mt-1 text-muted">{r.resumen}</p>
              <ul className="mt-4 space-y-3">
                {r.contenido.map((c) => (
                  <li key={c} className="flex gap-3 text-foreground/85">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {c}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      {productos.length > 0 && (
        <section className="bg-sand/60 py-16">
          <div className="contenedor">
            <h2 className="font-display text-3xl font-bold">Selección premium de uniformes</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {productos.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
