import { redirect } from "next/navigation";
import BarraLateral from "@/components/admin/BarraLateral";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata = {
  title: { default: "Panel", template: "%s · Panel ProSuit" },
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  const { usuario, perfil } = await obtenerSesion();
  if (!usuario) redirect("/login?volver=/admin");
  if (perfil?.rol !== "admin") redirect("/mi-cuenta");

  const supabase = await crearClienteServidor();
  const [{ count: pendientes }, { count: mensajes }] = await Promise.all([
    supabase.from("pedidos").select("id", { count: "exact", head: true }).in("estado", ["pendiente_pago", "pagado"]),
    supabase.from("mensajes_contacto").select("id", { count: "exact", head: true }).eq("leido", false),
  ]);

  return (
    <div className="flex min-h-screen bg-[#f6f4f8]">
      <BarraLateral
        nombre={perfil?.nombre || usuario.email || "Admin"}
        contadores={{ pedidos: pendientes ?? 0, mensajes: mensajes ?? 0 }}
      />
      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
