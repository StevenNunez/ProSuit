import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Portada from "@/components/tienda/Portada";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { listarProductos } from "@/lib/datos/catalogo";
import { sectores, servicios } from "@/lib/contenido";
import { enlaceWhatsApp } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Confección de uniformes a medida y a pedido",
  description: "Diseñamos y confeccionamos uniformes para salud, colegios, empresas, hostelería e industria en La Serena: tallas personalizadas, bordado o estampado de logo, materiales antifluido y gabardina, entrega puntual a todo Chile.",
  alternates: { canonical: "/servicios" },
};

export default async function PaginaServicios() {
  const productos = await listarProductos({ limite: 4 });

  return (
    <>
      <Portada
        subtitulo="Servicios"
        titulo="Confección de uniformes y prendas de vestir"
        descripcion="Servicios especializados que se adaptan a las necesidades específicas de cada sector, garantizando calidad y estilo."
        migas={[{ href: "/servicios", etiqueta: "Servicios" }]}
      />

      <section className="contenedor grid items-center gap-12 py-16 lg:grid-cols-2">
        <div className="grid gap-6 sm:grid-cols-2">
          {servicios.map((s, i) => (
            <div key={s.titulo} className="rounded-2xl border border-border p-6">
              <span className="font-display text-3xl font-bold text-primary/30">0{i + 1}</span>
              <h2 className="mt-2 font-display text-lg font-semibold">{s.titulo}</h2>
              <p className="mt-2 text-sm text-muted">{s.texto}</p>
            </div>
          ))}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image src="/img/servicios-1.jpg" alt="Máquina de coser en el taller" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="contenedor">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sectores</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Uniformes para cada rubro</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectores.map((s) => (
              <div key={s.nombre} className="flex gap-3 rounded-2xl bg-white p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{s.nombre}</h3>
                  <p className="text-sm text-muted">{s.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contenedor py-16">
        <h2 className="font-display text-3xl font-bold">¿Cómo trabajamos?</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Cotización", "Nos cuentas qué necesitas: rubro, cantidad, tallas y personalización."],
            ["Diseño y muestra", "Definimos telas, colores y ubicación del logo. Si lo pides, hacemos una muestra."],
            ["Confección", "Producimos en nuestro taller de La Serena con control de calidad prenda por prenda."],
            ["Entrega", "Despachamos a todo Chile o retiras en tienda. Plazo estándar 15 a 20 días hábiles."],
          ].map(([t, d], i) => (
            <li key={t} className="relative rounded-2xl border border-border p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={enlaceWhatsApp("Hola ProSuit, quiero una cotización de uniformes.")} target="_blank" rel="noopener noreferrer" className="btn-primario">Cotizar por WhatsApp</a>
          <Link href="/contacto" className="btn-secundario">Agendar visita</Link>
        </div>
      </section>

      {productos.length > 0 && (
        <section className="bg-sand/60 py-16">
          <div className="contenedor">
            <h2 className="font-display text-3xl font-bold">Uniformes corporativos hechos a medida</h2>
            <p className="mt-2 text-muted">Explora nuestro catálogo con promociones diseñadas para satisfacer las necesidades de tu empresa.</p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {productos.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
