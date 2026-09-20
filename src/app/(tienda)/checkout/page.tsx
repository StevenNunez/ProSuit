import type { Metadata } from "next";
import FormularioCheckout from "@/components/tienda/FormularioCheckout";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { listarZonasEnvio } from "@/lib/datos/catalogo";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { mercadoPagoConfigurado } from "@/lib/mercadopago";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function PaginaCheckout() {
  const [ajustes, zonas, { usuario, perfil }] = await Promise.all([
    obtenerAjustes(),
    listarZonasEnvio(),
    obtenerSesion(),
  ]);

  return (
    <div className="contenedor py-10">
      <h1 className="font-display text-3xl font-bold">Finalizar compra</h1>
      <p className="mt-1 text-sm text-muted">Completa tus datos y elige cómo quieres recibir y pagar tu pedido.</p>
      <div className="mt-8">
        <FormularioCheckout
          zonas={zonas}
          transferencia={ajustes.transferencia}
          retiro={ajustes.retiro}
          mercadoPagoDisponible={mercadoPagoConfigurado()}
          usuario={
            usuario
              ? { email: usuario.email ?? "", nombre: perfil?.nombre ?? "", telefono: perfil?.telefono ?? "" }
              : null
          }
        />
      </div>
    </div>
  );
}
