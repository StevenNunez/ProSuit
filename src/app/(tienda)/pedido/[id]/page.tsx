import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { formatearCLP, formatearFechaHora, numeroPedido } from "@/lib/formato";
import { ESTADOS_PEDIDO, type PedidoConItems } from "@/lib/tipos";
import { enlaceWhatsApp } from "@/lib/sitio";
import BotonReintentarPago from "@/components/tienda/BotonReintentarPago";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };

export default async function PaginaPedido({ params, searchParams }: PageProps<"/pedido/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : null;
  const resultado = typeof sp.resultado === "string" ? sp.resultado : null;

  // El pedido se puede ver con el token (invitados) o siendo el dueño/admin.
  const admin = crearClienteAdmin();
  const { data: pedido } = await admin
    .from("pedidos")
    .select("*, items:pedido_items(*)")
    .eq("id", id)
    .maybeSingle<PedidoConItems>();
  if (!pedido) notFound();

  const { usuario, perfil } = await obtenerSesion();
  const autorizado =
    (token && token === pedido.token_acceso) ||
    (usuario && pedido.usuario_id === usuario.id) ||
    perfil?.rol === "admin";
  if (!autorizado) notFound();

  const ajustes = await obtenerAjustes();
  const estado = ESTADOS_PEDIDO[pedido.estado];
  const pendienteMP = pedido.estado === "pendiente_pago" && pedido.metodo_pago === "mercadopago";
  const pendienteTransferencia = pedido.estado === "pendiente_pago" && pedido.metodo_pago === "transferencia";

  const cabecera =
    pedido.estado === "cancelado"
      ? { icono: XCircle, clase: "text-danger", titulo: "Pedido cancelado" }
      : pedido.estado === "pendiente_pago"
        ? { icono: Clock, clase: "text-warning", titulo: resultado === "error" ? "El pago no se completó" : "Pedido recibido, falta el pago" }
        : { icono: CheckCircle2, clase: "text-success", titulo: "¡Gracias por tu compra!" };

  return (
    <div className="contenedor max-w-4xl py-10">
      <div className="flex items-start gap-4">
        <cabecera.icono className={`size-10 shrink-0 ${cabecera.clase}`} />
        <div>
          <h1 className="font-display text-3xl font-bold">{cabecera.titulo}</h1>
          <p className="mt-1 text-muted">
            Pedido <strong className="text-foreground">{numeroPedido(pedido.numero)}</strong> · {formatearFechaHora(pedido.creado_el)}
          </p>
          <span className={`chip mt-2 ${estado.clase}`}>{estado.etiqueta}</span>
        </div>
      </div>

      {pendienteMP && (
        <div className="tarjeta mt-8 border-amber-200 bg-amber-50/50">
          <h2 className="font-semibold">Completa el pago con Mercado Pago</h2>
          <p className="mt-1 text-sm text-muted">
            {resultado === "pendiente"
              ? "Mercado Pago está procesando tu pago. Te avisaremos apenas se confirme; si elegiste un medio con cupón de pago, recuerda pagarlo."
              : "Tu pedido quedó reservado. Si el pago no se completó, puedes intentarlo de nuevo."}
          </p>
          {resultado !== "pendiente" && <BotonReintentarPago pedidoId={pedido.id} token={pedido.token_acceso} />}
        </div>
      )}

      {pendienteTransferencia && (
        <div className="tarjeta mt-8 border-amber-200 bg-amber-50/50">
          <h2 className="font-semibold">Datos para la transferencia</h2>
          <p className="mt-1 text-sm text-muted">Transfiere el total y envíanos el comprobante por WhatsApp o correo. Validamos en horario hábil y comenzamos con tu pedido.</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Dato etiqueta="Monto" valor={formatearCLP(pedido.total)} destacado />
            <Dato etiqueta="Titular" valor={ajustes.transferencia.titular} />
            <Dato etiqueta="RUT" valor={ajustes.transferencia.rut || "—"} />
            <Dato etiqueta="Banco" valor={ajustes.transferencia.banco || "—"} />
            <Dato etiqueta="Tipo de cuenta" valor={ajustes.transferencia.tipo_cuenta || "—"} />
            <Dato etiqueta="N° de cuenta" valor={ajustes.transferencia.numero || "—"} />
            <Dato etiqueta="Correo" valor={ajustes.transferencia.email} />
            <Dato etiqueta="Asunto / glosa" valor={numeroPedido(pedido.numero)} />
          </dl>
          <a
            href={enlaceWhatsApp(`Hola ProSuit, envío el comprobante de transferencia del pedido ${numeroPedido(pedido.numero)}.`, ajustes.tienda.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primario mt-4"
          >
            Enviar comprobante por WhatsApp
          </a>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <section className="tarjeta">
          <h2 className="font-semibold">Productos</h2>
          <ul className="mt-3 divide-y divide-border">
            {pedido.items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {i.imagen_url && <Image src={i.imagen_url} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.nombre}</p>
                  <p className="text-xs text-muted">{i.variante} · {i.cantidad} × {formatearCLP(i.precio_unitario)}</p>
                  {i.personalizacion && <p className="text-xs text-muted">Personalización: {i.personalizacion}</p>}
                </div>
                <p className="text-sm font-semibold">{formatearCLP(i.precio_unitario * i.cantidad)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatearCLP(pedido.subtotal)}</dd></div>
            {pedido.descuento > 0 && <div className="flex justify-between text-success"><dt>Descuento {pedido.cupon_codigo}</dt><dd>−{formatearCLP(pedido.descuento)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>{pedido.metodo_entrega === "retiro" ? "Retiro en tienda" : pedido.envio === 0 ? "Gratis" : formatearCLP(pedido.envio)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd>{formatearCLP(pedido.total)}</dd></div>
          </dl>
        </section>

        <aside className="space-y-4">
          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Entrega</h2>
            {pedido.metodo_entrega === "retiro" ? (
              <p className="mt-2 text-muted">Retiro en tienda · {ajustes.retiro.direccion}<br />{ajustes.retiro.horario}</p>
            ) : (
              <p className="mt-2 text-muted">
                {pedido.direccion.calle} {pedido.direccion.numero}{pedido.direccion.depto ? `, ${pedido.direccion.depto}` : ""}<br />
                {pedido.direccion.comuna}, {pedido.direccion.region}
                {pedido.zona_envio && <><br /><span className="text-xs">{pedido.zona_envio}</span></>}
              </p>
            )}
          </section>
          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Contacto</h2>
            <p className="mt-2 text-muted">{pedido.nombre}<br />{pedido.email}<br />{pedido.telefono}</p>
          </section>
          <p className="text-xs text-muted">
            Guarda este enlace para revisar el estado de tu pedido. También puedes consultarlo en{" "}
            <Link href="/seguimiento" className="text-primary underline">seguimiento</Link>.
          </p>
          <Link href="/tienda" className="btn-secundario w-full">Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="rounded-lg bg-white/70 px-3 py-2">
      <dt className="text-xs text-muted">{etiqueta}</dt>
      <dd className={destacado ? "text-lg font-bold text-primary" : "font-medium"}>{valor}</dd>
    </div>
  );
}
