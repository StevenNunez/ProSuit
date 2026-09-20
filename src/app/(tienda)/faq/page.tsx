import type { Metadata } from "next";
import Link from "next/link";
import Portada from "@/components/tienda/Portada";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { preguntasFrecuentes } from "@/lib/contenido";
import { listarProductos } from "@/lib/datos/catalogo";
import { enlaceWhatsApp } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas a las dudas más comunes sobre la confección de uniformes personalizados: plazos, materiales, pagos y envíos.",
  alternates: { canonical: "/faq" },
};

export default async function PaginaFAQ() {
  const productos = await listarProductos({ limite: 4 });
  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntasFrecuentes.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <Portada
        subtitulo="FAQ"
        titulo="Confección de uniformes personalizados"
        descripcion="Aquí respondemos las dudas más comunes para que encuentres todo lo que buscas de manera rápida y práctica."
        migas={[{ href: "/faq", etiqueta: "Preguntas frecuentes" }]}
      />
      <section className="contenedor grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border rounded-2xl border border-border bg-white">
          {preguntasFrecuentes.map((p) => (
            <details key={p.pregunta} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                {p.pregunta}
                <span className="text-xl text-primary transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">{p.respuesta}</p>
            </details>
          ))}
        </div>
        <aside className="h-fit rounded-2xl bg-primary p-6 text-white lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-semibold">¿Tienes otra duda?</h2>
          <p className="mt-2 text-sm text-white/80">Escríbenos y te respondemos a la brevedad.</p>
          <a href={enlaceWhatsApp("Hola ProSuit, tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full bg-white text-primary hover:bg-sand">WhatsApp</a>
          <Link href="/contacto" className="btn mt-2 w-full border border-white/30 text-white hover:bg-white/10">Formulario de contacto</Link>
        </aside>
      </section>
      {productos.length > 0 && (
        <section className="bg-sand/60 py-16">
          <div className="contenedor">
            <h2 className="font-display text-3xl font-bold">Uniformes personalizados de alta calidad</h2>
            <p className="mt-2 text-muted">Descubre nuestro catálogo con prendas profesionales diseñadas para cada sector.</p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {productos.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
