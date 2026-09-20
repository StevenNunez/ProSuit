import { EncabezadoPagina } from "@/components/admin/ui";
import EditorProducto from "@/components/admin/EditorProducto";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto() {
  const supabase = await crearClienteServidor();
  const { data: categorias } = await supabase.from("categorias").select("*").order("orden").order("nombre");
  return (
    <>
      <EncabezadoPagina volver={{ href: "/admin/productos", etiqueta: "Productos" }} titulo="Nuevo producto" />
      <EditorProducto producto={null} categorias={categorias ?? []} />
    </>
  );
}
