import Image from "next/image";
import Link from "next/link";
import { ChipBooleano, EncabezadoPagina, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import { BotonEliminar, FormularioAccion, Interruptor } from "@/components/admin/Formularios";
import { eliminarCategoria, guardarCategoria } from "@/lib/acciones/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Categoria } from "@/lib/tipos";

export const metadata = { title: "Categorías" };

export default async function PaginaCategorias({ searchParams }: PageProps<"/admin/categorias">) {
  const sp = await searchParams;
  const editarId = typeof sp.editar === "string" ? sp.editar : null;
  const supabase = await crearClienteServidor();
  const [{ data: categorias }, { data: conteos }] = await Promise.all([
    supabase.from("categorias").select("*").order("orden").order("nombre").returns<Categoria[]>(),
    supabase.from("productos").select("categoria_id"),
  ]);
  const porCategoria = (conteos ?? []).reduce<Record<string, number>>((acc, p) => {
    if (p.categoria_id) acc[p.categoria_id] = (acc[p.categoria_id] ?? 0) + 1;
    return acc;
  }, {});
  const editando = categorias?.find((c) => c.id === editarId) ?? null;

  return (
    <>
      <EncabezadoPagina titulo="Categorías" descripcion="Agrupan los productos en la tienda y en la portada." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {!categorias || categorias.length === 0 ? (
            <Vacio titulo="Sin categorías" texto="Crea la primera con el formulario." />
          ) : (
            <Tabla>
              <thead><tr><Th>Categoría</Th><Th>Slug</Th><Th>Productos</Th><Th>Orden</Th><Th>Estado</Th><Th></Th></tr></thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className={editarId === c.id ? "bg-primary-soft/40" : "hover:bg-sand/40"}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                          {c.imagen_url && <Image src={c.imagen_url} alt="" fill sizes="40px" className="object-cover" />}
                        </div>
                        <div><p className="font-semibold">{c.nombre}</p>{c.descripcion && <p className="line-clamp-1 text-xs text-muted">{c.descripcion}</p>}</div>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs text-muted">{c.slug}</Td>
                    <Td>{porCategoria[c.id] ?? 0}</Td>
                    <Td>{c.orden}</Td>
                    <Td><ChipBooleano valor={c.activa} si="Activa" no="Oculta" /></Td>
                    <Td className="text-right">
                      <Link href={`/admin/categorias?editar=${c.id}`} className="mr-3 text-sm font-medium text-primary hover:underline">Editar</Link>
                      <BotonEliminar accion={eliminarCategoria.bind(null, c.id)} confirmacion={`¿Eliminar "${c.nombre}"? Los productos quedarán sin categoría.`} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
        </div>

        <aside className="tarjeta h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editando ? `Editar: ${editando.nombre}` : "Nueva categoría"}</h2>
            {editando && <Link href="/admin/categorias" className="text-xs text-muted hover:text-primary">Cancelar</Link>}
          </div>
          <FormularioAccion key={editando?.id ?? "nueva"} accion={guardarCategoria} className="mt-4 grid gap-3">
            {editando && <input type="hidden" name="id" value={editando.id} />}
            <div><label className="etiqueta">Nombre *</label><input name="nombre" required className="campo" defaultValue={editando?.nombre ?? ""} /></div>
            <div><label className="etiqueta">Slug</label><input name="slug" className="campo font-mono text-xs" defaultValue={editando?.slug ?? ""} placeholder="se genera del nombre" /></div>
            <div><label className="etiqueta">Descripción</label><textarea name="descripcion" rows={2} className="campo" defaultValue={editando?.descripcion ?? ""} /></div>
            <div><label className="etiqueta">URL de imagen</label><input name="imagen_url" className="campo" defaultValue={editando?.imagen_url ?? ""} placeholder="/img/cat-ejecutivo.jpg o https://…" /></div>
            <div><label className="etiqueta">Orden</label><input name="orden" type="number" className="campo w-24" defaultValue={editando?.orden ?? 0} /></div>
            <Interruptor nombre="activa" etiqueta="Activa" valor={editando?.activa ?? true} descripcion="Visible en la tienda" />
          </FormularioAccion>
        </aside>
      </div>
    </>
  );
}
