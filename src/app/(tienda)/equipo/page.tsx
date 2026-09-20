import type { Metadata } from "next";
import Image from "next/image";
import Portada from "@/components/tienda/Portada";
import { cifras, equipo } from "@/lib/contenido";

export const metadata: Metadata = {
  title: "Equipo",
  description: "Conoce al equipo detrás de ProSuit: expertos dedicados a confeccionar tus uniformes ideales.",
  alternates: { canonical: "/equipo" },
};

export default function PaginaEquipo() {
  return (
    <>
      <Portada
        subtitulo="Equipo"
        titulo="Uniformes que reflejan tu identidad"
        descripcion="En ProSuit nos comprometemos a confeccionar uniformes que unen diseño estético y funcional sin perder la calidad en materiales y en cada detalle. Nuestra visión es liderar el mercado ofreciendo prendas que potencien la imagen y confianza de cada usuario."
        migas={[{ href: "/equipo", etiqueta: "Equipo" }]}
      />
      <section className="contenedor py-16">
        <h2 className="font-display text-3xl font-bold">Uniformes a medida para tu empresa</h2>
        <p className="mt-2 text-muted">Conoce al equipo detrás de ProSuit, expertos dedicados a confeccionar tus uniformes ideales.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {equipo.map((m) => (
            <article key={m.nombre} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="relative aspect-square">
                <Image src={m.imagen} alt={m.nombre} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{m.nombre}</h3>
                <p className="text-sm font-medium text-primary">{m.cargo}</p>
                <p className="mt-2 text-sm text-muted">{m.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-primary py-16 text-white">
        <div className="contenedor">
          <h2 className="font-display text-3xl font-bold">Compromiso y precisión en cada uniforme</h2>
          <p className="mt-2 max-w-2xl text-white/80">Datos clave que reflejan nuestro avance, calidad y dedicación en la confección de prendas personalizadas.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {cifras.map((c) => (
              <div key={c.etiqueta}>
                <p className="font-display text-5xl font-bold text-accent">{c.valor}</p>
                <p className="mt-1 font-semibold">{c.etiqueta}</p>
                <p className="mt-1 text-sm text-white/70">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
