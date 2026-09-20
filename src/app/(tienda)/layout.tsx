import Encabezado from "@/components/tienda/Encabezado";
import PieDePagina from "@/components/tienda/PieDePagina";
import CarritoLateral from "@/components/tienda/CarritoLateral";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { obtenerAjustes } from "@/lib/datos/ajustes";

export default async function LayoutTienda({ children }: LayoutProps<"/">) {
  const [{ usuario, perfil }, ajustes] = await Promise.all([obtenerSesion(), obtenerAjustes()]);

  return (
    <>
      <Encabezado sesionIniciada={!!usuario} esAdmin={perfil?.rol === "admin"} />
      <main className="flex-1">{children}</main>
      <PieDePagina tienda={ajustes.tienda} />
      <CarritoLateral />
    </>
  );
}
