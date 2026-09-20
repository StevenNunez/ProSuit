"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { ProductoConRelaciones, Variante } from "@/lib/tipos";
import { useCarrito } from "@/lib/carrito";
import { formatearCLP, nombreVariante, precioVigente } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/sitio";

export default function SelectorCompra({ producto }: { producto: ProductoConRelaciones }) {
  const variantes = useMemo(() => producto.variantes ?? [], [producto.variantes]);
  const tallas = useMemo(() => {
    const lista = Array.from(new Set(variantes.map((v) => v.talla).filter(Boolean))) as string[];
    // "A medida" siempre al final, después de las tallas estándar.
    return [...lista.filter((t) => t !== "A medida"), ...lista.filter((t) => t === "A medida")];
  }, [variantes]);
  const colores = useMemo(() => Array.from(new Set(variantes.map((v) => v.color).filter(Boolean))) as string[], [variantes]);

  const [talla, setTalla] = useState<string | null>(tallas.length === 1 ? tallas[0] : null);
  const [color, setColor] = useState<string | null>(colores.length === 1 ? colores[0] : null);
  const [cantidad, setCantidad] = useState(1);
  const [personalizacion, setPersonalizacion] = useState("");
  const [medidas, setMedidas] = useState("");
  const [agregado, setAgregado] = useState(false);
  const agregar = useCarrito((e) => e.agregar);

  const variante: Variante | undefined = useMemo(() => {
    if (variantes.length === 0) return undefined;
    return variantes.find(
      (v) => (tallas.length === 0 || v.talla === talla) && (colores.length === 0 || v.color === color),
    );
  }, [variantes, tallas.length, colores.length, talla, color]);

  const precioBase = precioVigente(producto);
  const precio = precioBase + (variante?.precio_extra ?? 0);
  const listo = !!variante;
  const sinStock = listo && variante.stock === 0;
  const stockDisponible = variante?.stock ?? 0;
  const esAMedida = talla === "A medida";
  const faltanMedidas = esAMedida && medidas.trim().length < 8;

  const disponibleTalla = (t: string) =>
    variantes.some((v) => v.talla === t && (colores.length === 0 || !color || v.color === color) && v.stock > 0);
  const disponibleColor = (c: string) =>
    variantes.some((v) => v.color === c && (tallas.length === 0 || !talla || v.talla === talla) && v.stock > 0);

  const alAgregar = () => {
    if (!variante || sinStock || faltanMedidas) return;
    const detalle = [esAMedida ? `Medidas: ${medidas.trim()}` : "", personalizacion.trim()].filter(Boolean).join(" | ");
    agregar({
      productoId: producto.id,
      varianteId: variante.id,
      slug: producto.slug,
      nombre: producto.nombre,
      variante: nombreVariante(variante),
      imagen: producto.imagenes[0] ?? null,
      precio,
      cantidad,
      stock: variante.stock,
      personalizacion: detalle || undefined,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className="space-y-5">
      {tallas.length > 0 && (
        <div>
          <p className="etiqueta">Talla {talla && <span className="text-foreground normal-case">· {talla}</span>}</p>
          <div className="flex flex-wrap gap-2">
            {tallas.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTalla(t)}
                className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  talla === t ? "border-primary bg-primary text-white" : disponibleTalla(t) ? "border-border hover:border-primary" : "border-border text-muted/60 line-through"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {colores.length > 0 && (
        <div>
          <p className="etiqueta">Color {color && <span className="text-foreground normal-case">· {color}</span>}</p>
          <div className="flex flex-wrap gap-2">
            {colores.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  color === c ? "border-primary bg-primary text-white" : disponibleColor(c) ? "border-border hover:border-primary" : "border-border text-muted/60 line-through"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {esAMedida && (
        <div className="border border-primary/30 bg-primary-soft/40 p-4">
          <label className="etiqueta" htmlFor="medidas">Tus medidas (en cm) *</label>
          <textarea
            id="medidas"
            className="campo"
            rows={3}
            placeholder="Ej: estatura 165, busto 92, cintura 76, cadera 98, largo de manga 58, largo total 70"
            value={medidas}
            onChange={(e) => setMedidas(e.target.value)}
            maxLength={300}
          />
          <p className="mt-1 text-xs text-muted">
            Confeccionamos la prenda a tu medida sin costo adicional. Si tienes dudas de cómo medirte, te guiamos por WhatsApp después de la compra.
          </p>
        </div>
      )}

      {producto.permite_personalizacion && (
        <div>
          <label className="etiqueta" htmlFor="personalizacion">Personalización (opcional)</label>
          <input
            id="personalizacion"
            className="campo"
            placeholder="Ej: bordar logo en pecho izquierdo, nombre “Carla”"
            value={personalizacion}
            onChange={(e) => setPersonalizacion(e.target.value)}
            maxLength={140}
          />
          <p className="mt-1 text-xs text-muted">Coordinamos el diseño contigo después de la compra.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-border">
          <button type="button" className="px-3 py-2.5 hover:bg-sand" aria-label="Restar" onClick={() => setCantidad((c) => Math.max(1, c - 1))}>
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-semibold">{cantidad}</span>
          <button type="button" className="px-3 py-2.5 hover:bg-sand disabled:opacity-40" aria-label="Sumar" disabled={listo && cantidad >= stockDisponible} onClick={() => setCantidad((c) => c + 1)}>
            <Plus className="size-4" />
          </button>
        </div>
        {listo && !sinStock && (
          <p className="text-xs text-muted">{stockDisponible <= 5 ? `¡Quedan ${stockDisponible}!` : `${stockDisponible} disponibles`}</p>
        )}
      </div>

      {sinStock ? (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-semibold">Esta variante está agotada.</p>
          <p className="mt-1 text-muted">La confeccionamos a pedido: escríbenos y te indicamos el plazo.</p>
          <a href={enlaceWhatsApp(`Hola ProSuit, quiero encargar "${producto.nombre}" (${variante ? nombreVariante(variante) : ""}).`)} target="_blank" rel="noopener noreferrer" className="btn-secundario mt-3">
            Encargar por WhatsApp
          </a>
        </div>
      ) : (
        <button type="button" className="btn-primario w-full py-3.5 text-base" disabled={!listo || faltanMedidas} onClick={alAgregar}>
          <ShoppingBag className="size-5" />
          {agregado ? "¡Agregado al carrito!" : faltanMedidas ? "Ingresa tus medidas" : listo ? `Agregar · ${formatearCLP(precio * cantidad)}` : tallas.length && !talla ? "Elige una talla" : "Elige una opción"}
        </button>
      )}
    </div>
  );
}
