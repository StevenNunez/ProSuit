import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SearchX } from "lucide-react";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { listarCategorias, listarProductos, type FiltrosCatalogo } from "@/lib/datos/catalogo";
import { enlaceWhatsApp } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Tienda de uniformes clínicos, escolares y corporativos",
  description: "Compra online batas médicas, ambos de enfermería, delantales, uniformes escolares, ropa corporativa e industrial. Confección a medida y bordado de logo. Precios en pesos chilenos, envío a todo Chile.",
  alternates: { canonical: "/tienda" },
};

const ORDENES: { valor: NonNullable<FiltrosCatalogo["orden"]>; etiqueta: string }[] = [
  { valor: "recientes", etiqueta: "Destacados" },
  { valor: "precio_asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio_desc", etiqueta: "Precio: mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre A–Z" },
];

export default async function PaginaTienda({ searchParams }: PageProps<"/tienda">) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const orden = (typeof params.orden === "string" ? params.orden : "recientes") as FiltrosCatalogo["orden"];

  const [productos, categorias, todos] = await Promise.all([
    listarProductos({ categoria, q, orden }),
    listarCategorias(),
    listarProductos({}),
  ]);
  const categoriaActual = categorias.find((c) => c.slug === categoria);
  const conteo = todos.reduce<Record<string, number>>((acc, p) => {
    if (p.categoria_id) acc[p.categoria_id] = (acc[p.categoria_id] ?? 0) + 1;
    return acc;
  }, {});

  const construirUrl = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const final = { categoria, q, orden, ...cambios };
    for (const [k, v] of Object.entries(final)) if (v && v !== "recientes") p.set(k, v);
    const cadena = p.toString();
    return cadena ? `/tienda?${cadena}` : "/tienda";
  };

  return (
    <>
      {/* Cabecera del catálogo */}
      <section className="bg-sand">
        <div className="contenedor py-14 lg:py-20">
          <nav aria-label="Migas de pan" className="text-xs text-muted">
            <ol className="flex gap-1.5">
              <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
              <li>/</li>
              <li><Link href="/tienda" className="hover:text-primary">Tienda</Link></li>
              {categoriaActual && (<><li>/</li><li className="text-foreground">{categoriaActual.nombre}</li></>)}
            </ol>
          </nav>
          <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="font-display text-xl text-foreground/70">Catálogo</p>
              <h1 className="mt-1 font-display text-4xl leading-tight sm:text-5xl lg:text-[56px]">
                {categoriaActual ? categoriaActual.nombre : q ? `Resultados para “${q}”` : "Uniformes confeccionados a tu medida"}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/85">
                {categoriaActual?.descripcion ??
                  "Salud, colegios, empresas e industria. Elige tu talla o pídelo a medida, agrega el bordado de tu logo y recíbelo en todo Chile."}
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2 lg:w-96" role="search">
              {categoria && <input type="hidden" name="categoria" value={categoria} />}
              <input name="q" defaultValue={q} placeholder="Buscar: bata, ambo, cotona…" className="campo bg-white py-3" aria-label="Buscar productos" />
              <button type="submit" className="btn-primario shrink-0 px-5">Buscar</button>
            </form>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="border-b border-border bg-white">
        <div className="contenedor flex gap-2 overflow-x-auto py-4">
          <Link
            href={construirUrl({ categoria: undefined })}
            className={`shrink-0 border px-4 py-2 text-sm font-medium transition ${!categoria ? "border-black bg-black text-white" : "border-border hover:border-black"}`}
          >
            Todos <span className="opacity-60">({todos.length})</span>
          </Link>
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={construirUrl({ categoria: c.slug })}
              className={`shrink-0 border px-4 py-2 text-sm font-medium transition ${categoria === c.slug ? "border-black bg-black text-white" : "border-border hover:border-black"}`}
            >
              {c.nombre} <span className="opacity-60">({conteo[c.id] ?? 0})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="contenedor py-10 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
            {q && (<> · <Link href={construirUrl({ q: undefined })} className="text-primary hover:underline">limpiar búsqueda</Link></>)}
          </p>
          <form className="flex items-center gap-2 text-sm">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            {q && <input type="hidden" name="q" value={q} />}
            <label htmlFor="orden" className="text-muted">Ordenar por</label>
            <select id="orden" name="orden" defaultValue={orden} className="campo w-auto py-1.5">
              {ORDENES.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
            </select>
            <button type="submit" className="btn-secundario px-4 py-1.5 text-sm">Aplicar</button>
          </form>
        </div>

        {productos.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-border p-14 text-center">
            <SearchX className="size-10 text-muted/50" />
            <p className="font-display text-xl">No encontramos productos con esos filtros.</p>
            <p className="text-sm text-muted">Prueba con otra categoría o escríbenos: lo confeccionamos a medida.</p>
            <div className="mt-2 flex gap-3">
              <Link href="/tienda" className="btn-secundario">Ver todo el catálogo</Link>
              <a href={enlaceWhatsApp(`Hola ProSuit, busco "${q ?? "una prenda"}" y no la vi en la tienda.`)} target="_blank" rel="noopener noreferrer" className="btn-primario">Pedir a medida</a>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {productos.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
        )}
      </section>

      {/* Confección a medida */}
      <section className="bg-sand">
        <div className="contenedor grid items-center gap-10 py-20 lg:grid-cols-[1fr_480px]">
          <div>
            <p className="font-display text-xl text-foreground/70">Confección a pedido</p>
            <h2 className="mt-1 font-display text-4xl leading-tight lg:text-[42px]">¿No encuentras tu talla o tu modelo?</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/85">
              Todas nuestras prendas se pueden confeccionar a tus medidas y en los colores de tu institución.
              Para equipos, cursos completos o empresas preparamos una cotización con bordado de logo.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={enlaceWhatsApp("Hola ProSuit, quiero cotizar una confección a medida.")} target="_blank" rel="noopener noreferrer" className="btn-primario">Cotizar por WhatsApp</a>
              <Link href="/contacto" className="btn border-2 border-foreground text-foreground hover:bg-white">Agendar visita al taller</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src="/img/galeria-3.jpg" alt="Tela y confección a mano en el taller" fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
