"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { eliminarProducto, guardarProducto, subirImagen, type ProductoEntrada, type VarianteEntrada } from "@/lib/acciones/admin";
import { slugificar } from "@/lib/formato";
import type { Categoria, ProductoConRelaciones } from "@/lib/tipos";

interface Props {
  producto: ProductoConRelaciones | null;
  categorias: Categoria[];
}

const TALLAS_RAPIDAS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function EditorProducto({ producto, categorias }: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [slug, setSlug] = useState(producto?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!producto);
  const [sku, setSku] = useState(producto?.sku ?? "");
  const [descripcionCorta, setDescripcionCorta] = useState(producto?.descripcion_corta ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : "");
  const [precioOferta, setPrecioOferta] = useState(producto?.precio_oferta ? String(producto.precio_oferta) : "");
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ?? "");
  const [imagenes, setImagenes] = useState<string[]>(producto?.imagenes ?? []);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [personalizacion, setPersonalizacion] = useState(producto?.permite_personalizacion ?? true);
  const [variantes, setVariantes] = useState<VarianteEntrada[]>(
    producto?.variantes?.length
      ? producto.variantes.map((v) => ({ id: v.id, talla: v.talla ?? "", color: v.color ?? "", sku: v.sku ?? "", stock: v.stock, precio_extra: v.precio_extra, activa: v.activa }))
      : [{ talla: "", color: "", sku: "", stock: 10, precio_extra: 0, activa: true }],
  );
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const inputArchivo = useRef<HTMLInputElement>(null);

  const alCambiarNombre = (v: string) => {
    setNombre(v);
    if (!slugManual) setSlug(slugificar(v));
  };

  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setSubiendo(true);
    setMensaje(null);
    for (const archivo of Array.from(archivos)) {
      const fd = new FormData();
      fd.set("archivo", archivo);
      const r = await subirImagen(fd);
      if (r.ok) setImagenes((prev) => [...prev, r.url]);
      else setMensaje({ ok: false, texto: r.mensaje });
    }
    setSubiendo(false);
    if (inputArchivo.current) inputArchivo.current.value = "";
  };

  const moverImagen = (i: number, dir: -1 | 1) => {
    setImagenes((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  };

  const actualizarVariante = (i: number, cambios: Partial<VarianteEntrada>) =>
    setVariantes((prev) => prev.map((v, k) => (k === i ? { ...v, ...cambios } : v)));

  const agregarTallas = () => {
    const existentes = new Set(variantes.map((v) => v.talla));
    const nuevas = TALLAS_RAPIDAS.filter((t) => !existentes.has(t)).map((t) => ({ talla: t, color: "", sku: "", stock: 10, precio_extra: 0, activa: true }));
    setVariantes((prev) => [...prev.filter((v) => v.talla || v.color || v.id), ...nuevas]);
  };

  const guardar = () => {
    setMensaje(null);
    const entrada: ProductoEntrada = {
      id: producto?.id,
      nombre,
      slug,
      sku,
      descripcion_corta: descripcionCorta,
      descripcion,
      precio: parseInt(precio.replace(/\D/g, ""), 10) || 0,
      precio_oferta: precioOferta.trim() ? parseInt(precioOferta.replace(/\D/g, ""), 10) || 0 : null,
      categoria_id: categoriaId || null,
      imagenes,
      destacado,
      activo,
      permite_personalizacion: personalizacion,
      variantes,
    };
    iniciarGuardado(async () => {
      const r = await guardarProducto(entrada);
      setMensaje({ ok: r.ok, texto: r.mensaje });
      if (r.ok && !producto && r.id) router.replace(`/admin/productos/${r.id}`);
      else if (r.ok) router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="tarjeta space-y-4">
          <h2 className="font-semibold">Información</h2>
          <div>
            <label className="etiqueta" htmlFor="p-nombre">Nombre *</label>
            <input id="p-nombre" className="campo" value={nombre} onChange={(e) => alCambiarNombre(e.target.value)} placeholder="Ej: Polera piqué corporativa" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="p-slug">URL (slug)</label>
              <input id="p-slug" className="campo font-mono text-xs" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }} />
              <p className="mt-1 text-xs text-muted">/producto/{slug || "…"}</p>
            </div>
            <div>
              <label className="etiqueta" htmlFor="p-sku">SKU</label>
              <input id="p-sku" className="campo" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Código interno" />
            </div>
          </div>
          <div>
            <label className="etiqueta" htmlFor="p-corta">Descripción corta</label>
            <input id="p-corta" className="campo" value={descripcionCorta} onChange={(e) => setDescripcionCorta(e.target.value)} maxLength={160} placeholder="Una línea que se ve en la tarjeta del producto" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="p-desc">Descripción completa</label>
            <textarea id="p-desc" rows={7} className="campo" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={"Materiales, cuidados, qué incluye…\nPuedes separar párrafos con líneas en blanco."} />
          </div>
        </section>

        <section className="tarjeta">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Imágenes</h2>
            <button type="button" className="btn-secundario" disabled={subiendo} onClick={() => inputArchivo.current?.click()}>
              <ImagePlus className="size-4" /> {subiendo ? "Subiendo…" : "Subir imágenes"}
            </button>
            <input ref={inputArchivo} type="file" accept="image/*" multiple className="hidden" onChange={(e) => subir(e.target.files)} />
          </div>
          <p className="mt-1 text-xs text-muted">La primera imagen es la principal. JPG, PNG o WebP de hasta 5 MB.</p>
          {imagenes.length === 0 ? (
            <button type="button" onClick={() => inputArchivo.current?.click()} className="mt-4 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted hover:border-primary/40">
              <ImagePlus className="size-6" /> Arrastra o haz clic para subir
            </button>
          ) : (
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {imagenes.map((url, i) => (
                <li key={url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-sand">
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">Principal</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                    <button type="button" className="rounded p-1 text-white hover:bg-white/20" aria-label="Mover antes" onClick={() => moverImagen(i, -1)}><ArrowUp className="size-3.5" /></button>
                    <button type="button" className="rounded p-1 text-white hover:bg-white/20" aria-label="Quitar" onClick={() => setImagenes((prev) => prev.filter((_, k) => k !== i))}><X className="size-3.5" /></button>
                    <button type="button" className="rounded p-1 text-white hover:bg-white/20" aria-label="Mover después" onClick={() => moverImagen(i, 1)}><ArrowDown className="size-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <input className="campo" placeholder="…o pega la URL de una imagen y presiona Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v) { setImagenes((p) => [...p, v]); (e.target as HTMLInputElement).value = ""; } } }} />
          </div>
        </section>

        <section className="tarjeta">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">Variantes y stock</h2>
              <p className="text-xs text-muted">Tallas y colores disponibles. Si el producto no tiene variantes, deja una sola fila vacía.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secundario px-3 py-1.5 text-xs" onClick={agregarTallas}>+ Tallas XS–XXL</button>
              <button type="button" className="btn-secundario px-3 py-1.5 text-xs" onClick={() => setVariantes((p) => [...p, { talla: "", color: "", sku: "", stock: 0, precio_extra: 0, activa: true }])}><Plus className="size-3.5" /> Fila</button>
            </div>
          </div>
          <div className="tabla-scroll mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-2 font-semibold">Talla</th>
                  <th className="pb-2 pr-2 font-semibold">Color</th>
                  <th className="pb-2 pr-2 font-semibold">SKU</th>
                  <th className="pb-2 pr-2 font-semibold">Stock</th>
                  <th className="pb-2 pr-2 font-semibold">Recargo $</th>
                  <th className="pb-2 pr-2 font-semibold">Activa</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {variantes.map((v, i) => (
                  <tr key={v.id ?? `n-${i}`}>
                    <td className="py-1 pr-2"><input className="campo" value={v.talla} onChange={(e) => actualizarVariante(i, { talla: e.target.value })} placeholder="M" /></td>
                    <td className="py-1 pr-2"><input className="campo" value={v.color} onChange={(e) => actualizarVariante(i, { color: e.target.value })} placeholder="Azul marino" /></td>
                    <td className="py-1 pr-2"><input className="campo" value={v.sku} onChange={(e) => actualizarVariante(i, { sku: e.target.value })} /></td>
                    <td className="py-1 pr-2"><input className="campo w-20" type="number" min={0} value={v.stock} onChange={(e) => actualizarVariante(i, { stock: parseInt(e.target.value, 10) || 0 })} /></td>
                    <td className="py-1 pr-2"><input className="campo w-24" type="number" value={v.precio_extra} onChange={(e) => actualizarVariante(i, { precio_extra: parseInt(e.target.value, 10) || 0 })} /></td>
                    <td className="py-1 pr-2 text-center"><input type="checkbox" checked={v.activa} onChange={(e) => actualizarVariante(i, { activa: e.target.checked })} className="size-4 accent-primary" /></td>
                    <td className="py-1"><button type="button" className="p-1 text-muted hover:text-danger" aria-label="Quitar variante" disabled={variantes.length === 1} onClick={() => setVariantes((p) => p.filter((_, k) => k !== i))}><Trash2 className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="tarjeta space-y-4">
          <h2 className="font-semibold">Publicación</h2>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span><span className="font-medium">Publicado</span><br /><span className="text-xs text-muted">Visible en la tienda</span></span>
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="size-5 accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span><span className="font-medium">Destacado</span><br /><span className="text-xs text-muted">Aparece en la portada</span></span>
            <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="size-5 accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span><span className="font-medium">Permite personalización</span><br /><span className="text-xs text-muted">Campo de bordado/nombre al comprar</span></span>
            <input type="checkbox" checked={personalizacion} onChange={(e) => setPersonalizacion(e.target.checked)} className="size-5 accent-primary" />
          </label>
          <div>
            <label className="etiqueta" htmlFor="p-cat">Categoría</label>
            <select id="p-cat" className="campo" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </section>

        <section className="tarjeta space-y-4">
          <h2 className="font-semibold">Precio (CLP, IVA incluido)</h2>
          <div>
            <label className="etiqueta" htmlFor="p-precio">Precio normal *</label>
            <input id="p-precio" inputMode="numeric" className="campo" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="19990" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="p-oferta">Precio de oferta</label>
            <input id="p-oferta" inputMode="numeric" className="campo" value={precioOferta} onChange={(e) => setPrecioOferta(e.target.value)} placeholder="Opcional" />
          </div>
        </section>

        {mensaje && <p className={`rounded-lg p-3 text-sm ${mensaje.ok ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-danger"}`}>{mensaje.texto}</p>}

        <div className="flex flex-col gap-2">
          <button type="button" className="btn-primario w-full py-3" disabled={guardando || subiendo} onClick={guardar}>
            {guardando ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
          </button>
          {producto && (
            <button
              type="button"
              className="text-xs text-danger hover:underline"
              onClick={() => { if (confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) iniciarGuardado(() => eliminarProducto(producto.id)); }}
            >
              Eliminar producto
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
