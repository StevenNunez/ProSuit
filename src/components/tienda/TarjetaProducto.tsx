import Link from "next/link";
import Image from "next/image";
import type { ProductoConRelaciones } from "@/lib/tipos";
import { formatearCLP, porcentajeDescuento, precioVigente } from "@/lib/formato";
import { stockTotal } from "@/lib/datos/catalogo";

/** Tarjeta de catálogo: imagen 4:5 con segunda foto al pasar el mouse, título condensado y precio en CLP. */
export default function TarjetaProducto({ producto }: { producto: ProductoConRelaciones }) {
  const [principal, secundaria] = producto.imagenes;
  const descuento = porcentajeDescuento(producto.precio, producto.precio_oferta);
  const agotado = stockTotal(producto) === 0;
  const variantes = producto.variantes ?? [];
  const aMedida = variantes.some((v) => v.talla === "A medida");
  const tallas = Array.from(new Set(variantes.map((v) => v.talla).filter((t) => t && t !== "A medida"))) as string[];
  const colores = Array.from(new Set(variantes.map((v) => v.color).filter(Boolean)));

  return (
    <Link href={`/producto/${producto.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {principal ? (
          <>
            <Image
              src={principal}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition duration-700 ${secundaria ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
            />
            {secundaria && (
              <Image
                src={secundaria}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Sin imagen</div>
        )}

        <div className="absolute left-0 top-4 flex flex-col items-start gap-1.5">
          {descuento > 0 && <span className="bg-primary px-3 py-1 text-xs font-bold tracking-wide text-white">-{descuento}%</span>}
          {producto.destacado && <span className="bg-black px-3 py-1 text-xs font-bold tracking-wide text-white">Destacado</span>}
        </div>
        {aMedida && (
          <span className="absolute bottom-4 right-4 bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            A medida
          </span>
        )}
        {agotado && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-xs font-semibold text-white">A pedido</div>
        )}
      </div>

      <div className="pt-4">
        {producto.categoria && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{producto.categoria.nombre}</p>
        )}
        <h3 className="mt-1 font-display text-lg leading-snug group-hover:text-primary">{producto.nombre}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-base font-semibold">{formatearCLP(precioVigente(producto))}</p>
          {descuento > 0 && <p className="text-sm text-muted line-through">{formatearCLP(producto.precio)}</p>}
        </div>
        {(tallas.length > 0 || colores.length > 0) && (
          <p className="mt-1 text-xs text-muted">
            {tallas.length > 0 && (tallas.length > 5 ? `Tallas ${tallas[0]} a ${tallas[tallas.length - 1]}` : `Tallas ${tallas.join(" · ")}`)}
            {tallas.length > 0 && colores.length > 0 && " · "}
            {colores.length > 0 && `${colores.length} ${colores.length === 1 ? "color" : "colores"}`}
          </p>
        )}
      </div>
    </Link>
  );
}
