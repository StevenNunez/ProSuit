import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ruler, ShieldCheck, Truck } from "lucide-react";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import GaleriaProducto from "@/components/tienda/GaleriaProducto";
import SelectorCompra from "@/components/tienda/SelectorCompra";
import { obtenerProductoPorSlug, productosRelacionados } from "@/lib/datos/catalogo";
import { formatearCLP, precioVigente } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/sitio";

// Cada ficha se arma la primera vez que alguien la visita y después se sirve
// desde caché (se refresca con el `revalidate` del layout o al guardar en el panel).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: producto.nombre,
    description: producto.descripcion_corta ?? producto.descripcion?.slice(0, 160) ?? undefined,
    alternates: { canonical: `/producto/${producto.slug}` },
    openGraph: { images: producto.imagenes[0] ? [{ url: producto.imagenes[0] }] : undefined },
  };
}

export default async function PaginaProducto({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);
  if (!producto) notFound();
  const relacionados = await productosRelacionados(producto);

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion_corta ?? producto.descripcion ?? undefined,
    image: producto.imagenes,
    sku: producto.sku ?? undefined,
    brand: { "@type": "Brand", name: "ProSuit" },
    offers: {
      "@type": "Offer",
      priceCurrency: "CLP",
      price: precioVigente(producto),
      availability: (producto.variantes ?? []).some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <div className="contenedor py-8 lg:py-12">
        <nav aria-label="Migas de pan" className="mb-6 text-xs text-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
            <li>/</li>
            <li><Link href="/tienda" className="hover:text-primary">Tienda</Link></li>
            {producto.categoria && (
              <>
                <li>/</li>
                <li><Link href={`/tienda?categoria=${producto.categoria.slug}`} className="hover:text-primary">{producto.categoria.nombre}</Link></li>
              </>
            )}
            <li>/</li>
            <li className="text-foreground">{producto.nombre}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <GaleriaProducto imagenes={producto.imagenes} nombre={producto.nombre} />

          <div>
            {producto.categoria && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{producto.categoria.nombre}</p>
            )}
            <h1 className="mt-2 font-display text-4xl leading-tight lg:text-5xl">{producto.nombre}</h1>
            {producto.sku && <p className="mt-1 text-xs text-muted">SKU {producto.sku}</p>}
            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-3xl font-bold">{formatearCLP(precioVigente(producto))}</p>
              {producto.precio_oferta && producto.precio_oferta < producto.precio && (
                <p className="text-lg text-muted line-through">{formatearCLP(producto.precio)}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Precio en pesos chilenos, IVA incluido.</p>
            {producto.descripcion_corta && <p className="mt-5 text-muted">{producto.descripcion_corta}</p>}

            <div className="mt-6">
              <SelectorCompra producto={producto} />
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-foreground/80 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Truck className="size-4 text-primary" /> Envío a todo Chile</li>
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Pago seguro</li>
              <li className="flex items-center gap-2"><Ruler className="size-4 text-primary" /> Confección a medida</li>
            </ul>

            <div className="mt-8 bg-sand p-5 text-sm">
              <p className="font-semibold">¿Necesitas más de 10 unidades o tallas especiales?</p>
              <p className="mt-1 text-muted">Cotiza por volumen y te preparamos una propuesta con bordado de tu logo.</p>
              <a href={enlaceWhatsApp(`Hola ProSuit, quiero cotizar por volumen el producto "${producto.nombre}".`)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
                Cotizar por WhatsApp →
              </a>
            </div>
          </div>
        </div>

        {producto.descripcion && (
          <section className="mt-14 max-w-3xl">
            <h2 className="font-display text-3xl">Descripción</h2>
            <div className="prose-sm mt-4 whitespace-pre-line text-foreground/85">{producto.descripcion}</div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl">También te puede interesar</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {relacionados.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
