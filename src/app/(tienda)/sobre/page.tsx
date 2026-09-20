import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Portada from "@/components/tienda/Portada";
import { cifras, equipo } from "@/lib/contenido";
import { sitio } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "ProSuit crea uniformes y prendas de vestir que reflejan la identidad de cada cliente, desde La Serena para todo Chile.",
  alternates: { canonical: "/sobre" },
};

export default function PaginaSobre() {
  return (
    <>
      <Portada
        subtitulo="Nosotros"
        titulo="Uniformes personalizados para cada necesidad"
        descripcion="En ProSuit nos dedicamos a crear uniformes y prendas de vestir que reflejan la identidad de cada cliente. Nuestra visión es liderar el mercado ofreciendo calidad, innovación y un servicio adaptado a públicos específicos."
        migas={[{ href: "/sobre", etiqueta: "Nosotros" }]}
      />

      <section className="contenedor grid gap-4 py-14 md:grid-cols-3">
        {["/img/sobre-1.jpg", "/img/sobre-2.jpg", "/img/galeria-3.jpg"].map((src, i) => (
          <div key={src} className={`relative overflow-hidden rounded-2xl ${i === 0 ? "aspect-[4/3] md:col-span-2" : "aspect-[4/3]"}`}>
            <Image src={src} alt="Taller de confección ProSuit" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        ))}
      </section>

      <section className="contenedor grid gap-12 pb-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nuestra historia</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Confianza y estilo para tu identidad profesional</h2>
          <div className="mt-4 space-y-4 text-muted">
            <p>
              ProSuit nace en La Serena con una idea simple: que vestir a un equipo de trabajo sea sinónimo de
              orgullo y comodidad. Partimos confeccionando uniformes para comercios locales y hoy vestimos a
              empresas de salud, industria, educación y servicios en toda la región y el país.
            </p>
            <p>
              Cada prenda pasa por nuestras manos: elegimos la tela, cortamos, cosemos, bordamos y revisamos
              una a una antes de entregar. Esa cercanía es la que nos permite adaptarnos a lo que cada cliente
              necesita, desde una polera con logo hasta una línea completa de uniformes corporativos.
            </p>
            <p className="font-display text-lg font-semibold text-primary">“{sitio.lema}”</p>
          </div>
          <Link href="/contacto" className="btn-primario mt-6">Conversemos</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {cifras.map((c) => (
            <div key={c.etiqueta} className="rounded-2xl bg-sand/70 p-6">
              <p className="font-display text-4xl font-bold text-primary">{c.valor}</p>
              <p className="mt-1 font-semibold">{c.etiqueta}</p>
              <p className="mt-1 text-sm text-muted">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="contenedor">
          <h2 className="font-display text-3xl font-bold">Uniformes creados para cada industria</h2>
          <p className="mt-2 text-muted">Conoce a los expertos que forman parte de nuestro equipo.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {equipo.map((m) => (
              <div key={m.nombre} className="text-center">
                <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl">
                  <Image src={m.imagen} alt={m.nombre} fill sizes="220px" className="object-cover" />
                </div>
                <h3 className="mt-3 font-semibold">{m.nombre}</h3>
                <p className="text-sm text-muted">{m.cargo}</p>
              </div>
            ))}
          </div>
          <Link href="/equipo" className="mt-8 inline-flex text-sm font-semibold text-primary hover:underline">Conocer al equipo →</Link>
        </div>
      </section>
    </>
  );
}
