import { notFound } from "next/navigation";
import { EncabezadoPagina } from "@/components/admin/ui";
import EditorProducto from "@/components/admin/EditorProducto";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { ProductoConRelaciones } from "@/lib/tipos";

export const metadata = { title: "Editar producto" };

export default async function PaginaEditarProducto({ params }: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const [{ data: producto }, { data: categorias }] = await Promise.all([
    supabase.from("productos").select("*, variantes(*)").eq("id", id).maybeSingle<ProductoConRelaciones>(),
    supabase.from("categorias").select("*").order("orden").order("nombre"),
  ]);
  if (!producto) notFound();
  producto.variantes = (producto.variantes ?? []).sort((a, b) => a.orden - b.orden);

  return (
    <>
      <EncabezadoPagina volver={{ href: "/admin/productos", etiqueta: "Productos" }} titulo={producto.nombre} descripcion={`/producto/${producto.slug}`} />
      <EditorProducto producto={producto} categorias={categorias ?? []} />
    </>
  );
}
