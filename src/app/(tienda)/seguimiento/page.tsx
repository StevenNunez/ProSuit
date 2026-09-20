import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Portada from "@/components/tienda/Portada";
import { crearClienteAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

async function buscarPedido(datos: FormData) {
  "use server";
  const numero = parseInt(String(datos.get("numero") ?? "").replace(/\D/g, ""), 10);
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  if (!numero || !email) redirect("/seguimiento?error=datos");

  const admin = crearClienteAdmin();
  const { data } = await admin
    .from("pedidos")
    .select("id, token_acceso")
    .eq("numero", numero)
    .eq("email", email)
    .maybeSingle();
  if (!data) redirect("/seguimiento?error=noexiste");
  redirect(`/pedido/${data.id}?t=${data.token_acceso}`);
}

export default async function PaginaSeguimiento({ searchParams }: PageProps<"/seguimiento">) {
  const sp = await searchParams;
  return (
    <>
      <Portada subtitulo="Pedidos" titulo="Seguimiento de tu pedido" descripcion="Ingresa el número de pedido y el correo con el que compraste para ver su estado." />
      <div className="contenedor flex justify-center py-12">
        <form action={buscarPedido} className="tarjeta w-full max-w-md grid gap-4">
          <div>
            <label className="etiqueta" htmlFor="numero">Número de pedido</label>
            <input id="numero" name="numero" required className="campo" placeholder="PS-1001" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="campo" />
          </div>
          {sp.error === "noexiste" && <p className="text-sm text-danger">No encontramos un pedido con esos datos.</p>}
          {sp.error === "datos" && <p className="text-sm text-danger">Completa ambos campos.</p>}
          <button type="submit" className="btn-primario">Ver pedido</button>
        </form>
      </div>
    </>
  );
}
