import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package, Settings } from "lucide-react";
import FormularioAuth from "@/components/tienda/FormularioAuth";
import { actualizarPerfil, cerrarSesion } from "@/lib/acciones/auth";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { formatearCLP, formatearFecha, numeroPedido } from "@/lib/formato";
import { ESTADOS_PEDIDO, type Pedido } from "@/lib/tipos";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function PaginaMiCuenta() {
  const { usuario, perfil } = await obtenerSesion();
  if (!usuario) redirect("/login?volver=/mi-cuenta");

  const supabase = await crearClienteServidor();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("usuario_id", usuario.id)
    .order("creado_el", { ascending: false })
    .returns<Pedido[]>();

  return (
    <div className="contenedor py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Hola, {perfil?.nombre || usuario.email}</h1>
          <p className="mt-1 text-sm text-muted">{usuario.email}</p>
        </div>
        <div className="flex gap-2">
          {perfil?.rol === "admin" && <Link href="/admin" className="btn-secundario">Panel de administración</Link>}
          <form action={cerrarSesion}>
            <button type="submit" className="btn-fantasma"><LogOut className="size-4" /> Cerrar sesión</button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Package className="size-5 text-primary" /> Mis pedidos</h2>
          {!pedidos || pedidos.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-muted">Aún no tienes pedidos.</p>
              <Link href="/tienda" className="btn-primario mt-4">Ir a la tienda</Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
              {pedidos.map((p) => {
                const estado = ESTADOS_PEDIDO[p.estado];
                return (
                  <li key={p.id}>
                    <Link href={`/pedido/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-sand/50">
                      <div>
                        <p className="font-semibold">{numeroPedido(p.numero)}</p>
                        <p className="text-xs text-muted">{formatearFecha(p.creado_el)} · {p.metodo_pago === "mercadopago" ? "Mercado Pago" : "Transferencia"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatearCLP(p.total)}</p>
                        <span className={`chip ${estado.clase}`}>{estado.etiqueta}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="tarjeta h-fit">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Settings className="size-5 text-primary" /> Mis datos</h2>
          <div className="mt-4">
            <FormularioAuth
              accion={actualizarPerfil}
              textoBoton="Guardar"
              campos={[
                { nombre: "nombre", etiqueta: "Nombre", autoComplete: "name", valor: perfil?.nombre ?? "" },
                { nombre: "telefono", etiqueta: "Teléfono", autoComplete: "tel", valor: perfil?.telefono ?? "" },
              ]}
            />
          </div>
          <Link href="/mi-cuenta/contrasena" className="mt-4 block text-sm text-primary hover:underline">Cambiar contraseña</Link>
        </aside>
      </div>
    </div>
  );
}
