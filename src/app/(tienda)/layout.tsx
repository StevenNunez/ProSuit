import Encabezado from "@/components/tienda/Encabezado";
import PieDePagina from "@/components/tienda/PieDePagina";
import CarritoLateral from "@/components/tienda/CarritoLateral";
import { obtenerAjustes } from "@/lib/datos/ajustes";

// Las páginas públicas se pre-generan y se sirven desde caché; se vuelven a
// armar como mucho cada 5 minutos (y al tiro cuando el panel guarda cambios,
// por `revalidatePath`). La sesión ya no se lee acá: el encabezado la resuelve
// en el navegador, así la portada no espera a Supabase en cada visita.
export const revalidate = 300;

export default async function LayoutTienda({ children }: LayoutProps<"/">) {
  const ajustes = await obtenerAjustes();

  return (
    <>
      <Encabezado />
      <main className="flex-1">{children}</main>
      <PieDePagina tienda={ajustes.tienda} />
      <CarritoLateral />
    </>
  );
}
