import type { Metadata } from "next";
import Link from "next/link";
import { Quote, ShieldCheck } from "lucide-react";
import Portada from "@/components/tienda/Portada";
import { garantias, testimonios } from "@/lib/contenido";

export const metadata: Metadata = {
  title: "Testimonios",
  description: "Testimonios auténticos de clientes satisfechos con los uniformes de ProSuit.",
  alternates: { canonical: "/testimonios" },
};

export default function PaginaTestimonios() {
  const [principal, ...resto] = testimonios;
  return (
    <>
      <Portada
        subtitulo="Testimonios"
        titulo="Testimonios auténticos de clientes satisfechos"
        descripcion="Descubre cómo trabajamos con nuestros clientes para crear uniformes que combinan calidad y estilo, facilitando una imagen corporativa sólida y profesional."
        migas={[{ href: "/testimonios", etiqueta: "Testimonios" }]}
      />
      <section className="contenedor py-16">
        <blockquote className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto size-10 text-accent" />
          <p className="mt-4 font-display text-2xl font-semibold leading-snug lg:text-3xl">“{principal.texto}”</p>
          <footer className="mt-5 text-sm text-muted">
            <span className="font-semibold text-foreground">{principal.nombre}</span> · {principal.cargo}
          </footer>
        </blockquote>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {resto.map((t) => (
            <article key={t.nombre} className="rounded-2xl border border-border p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.cargo}</p>
              <p className="mt-3 text-foreground/85">“{t.texto}”</p>
              <p className="mt-4 text-sm font-semibold">{t.nombre}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand/60 py-16">
        <div className="contenedor grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Confianza construida con calidad y compromiso</h2>
            <p className="mt-2 text-muted">Estándares que avalan nuestra excelencia y fiabilidad.</p>
            <Link href="/contacto" className="btn-primario mt-6">Quiero ser el próximo caso de éxito</Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {garantias.map((g) => (
              <li key={g} className="flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-medium">
                <ShieldCheck className="size-5 shrink-0 text-primary" /> {g}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
