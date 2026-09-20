import Image from "next/image";
import Link from "next/link";
import { ChipBooleano, EncabezadoPagina, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP } from "@/lib/formato";
import type { ProductoConRelaciones } from "@/lib/tipos";

export const metadata = { title: "Productos" };

export default async function PaginaProductosAdmin({ searchParams }: PageProps<"/admin/productos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("productos")
    .select("*, categoria:categorias(id,nombre,slug), variantes(id, stock, activa)")
    .order("creado_el", { ascending: false });
  if (q) consulta = consulta.or(`nombre.ilike.%${q}%,sku.ilike.%${q}%`);
  const { data } = await consulta.returns<ProductoConRelaciones[]>();

  return (
    <>
      <EncabezadoPagina
        titulo="Productos"
        descripcion={`${data?.length ?? 0} productos en el catálogo`}
        acciones={<Link href="/admin/productos/nuevo" className="btn-primario">Agregar producto</Link>}
      />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o SKU…" className="campo max-w-sm" />
        <button type="submit" className="btn-secundario">Buscar</button>
        {q && <Link href="/admin/productos" className="btn-fantasma">Limpiar</Link>}
      </form>

      {!data || data.length === 0 ? (
        <Vacio titulo="Todavía no hay productos" texto="Agrega tu primer producto para empezar a vender." accion={<Link href="/admin/productos/nuevo" className="btn-primario">Agregar producto</Link>} />
      ) : (
        <Tabla>
          <thead>
            <tr>
              <Th>Producto</Th><Th>Categoría</Th><Th>Precio</Th><Th>Stock</Th><Th>Estado</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const stock = (p.variantes ?? []).reduce((a, v) => a + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-sand/40">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {p.imagenes[0] && <Image src={p.imagenes[0]} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <div>
                        <Link href={`/admin/productos/${p.id}`} className="font-semibold hover:text-primary">{p.nombre}</Link>
                        <p className="text-xs text-muted">{p.sku ?? "sin SKU"}{p.destacado ? " · Destacado" : ""}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{p.categoria?.nombre ?? "—"}</Td>
                  <Td>
                    <span className="font-semibold">{formatearCLP(p.precio_oferta ?? p.precio)}</span>
                    {p.precio_oferta && <span className="ml-1 text-xs text-muted line-through">{formatearCLP(p.precio)}</span>}
                  </Td>
                  <Td>
                    <span className={`chip ${stock === 0 ? "bg-rose-50 text-rose-800" : stock <= 5 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{stock} u.</span>
                    <span className="ml-1 text-xs text-muted">{p.variantes?.length ?? 0} var.</span>
                  </Td>
                  <Td><ChipBooleano valor={p.activo} si="Publicado" no="Borrador" /></Td>
                  <Td className="text-right">
                    <Link href={`/admin/productos/${p.id}`} className="text-sm font-medium text-primary hover:underline">Editar</Link>
                    <Link href={`/producto/${p.slug}`} target="_blank" className="ml-3 text-sm text-muted hover:text-primary">Ver</Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      )}
    </>
  );
}
