import type { Metadata } from "next";
import Image from "next/image";
import Portada from "@/components/tienda/Portada";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { galeria } from "@/lib/contenido";
import { listarProductos } from "@/lib/datos/catalogo";

export const metadata: Metadata = {
  title: "Galería",
  description: "Una selección de fotografías que reflejan la calidad y el diseño de nuestras prendas y uniformes personalizados.",
  alternates: { canonical: "/galeria" },
};

export default async function PaginaGaleria() {
  const productos = await listarProductos({ limite: 4 });

  return (
    <>
      <Portada
        subtitulo="Galería"
        titulo="Galería de uniformes personalizados"
        descripcion="Aquí mostramos una cuidada selección de fotografías que reflejan la calidad y el diseño de nuestras prendas."
        migas={[{ href: "/galeria", etiqueta: "Galería" }]}
      />
      <section className="contenedor py-14">
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {galeria.map((g, i) => (
            <figure key={g.src} className={`relative overflow-hidden rounded-2xl bg-sand ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-500 hover:scale-105" />
            </figure>
          ))}
        </div>
      </section>
      {productos.length > 0 && (
        <section className="bg-sand/60 py-16">
          <div className="contenedor">
            <h2 className="font-display text-3xl font-bold">Uniformes profesionales que reflejan tu identidad</h2>
            <p className="mt-2 text-muted">Diseños exclusivos y prendas confeccionadas a medida para cada sector.</p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {productos.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
