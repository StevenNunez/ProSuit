import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChipEstado, EncabezadoPagina } from "@/components/admin/ui";
import GestionPedido from "@/components/admin/GestionPedido";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP, formatearFechaHora, numeroPedido } from "@/lib/formato";
import { enlaceWhatsApp } from "@/lib/sitio";
import type { PedidoConItems } from "@/lib/tipos";

export const metadata = { title: "Detalle del pedido" };

export default async function PaginaDetallePedido({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const supabase = await crearClienteServidor();
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*, items:pedido_items(*)")
    .eq("id", id)
    .maybeSingle<PedidoConItems>();
  if (!pedido) notFound();

  const telefonoLimpio = pedido.telefono?.replace(/\D/g, "") ?? "";
  const wa = telefonoLimpio ? enlaceWhatsApp(`Hola ${pedido.nombre}, te escribimos de ProSuit por tu pedido ${numeroPedido(pedido.numero)}.`, telefonoLimpio.startsWith("56") ? telefonoLimpio : `56${telefonoLimpio}`) : null;

  return (
    <>
      <EncabezadoPagina
        volver={{ href: "/admin/pedidos", etiqueta: "Pedidos" }}
        titulo={`Pedido ${numeroPedido(pedido.numero)}`}
        descripcion={`Creado el ${formatearFechaHora(pedido.creado_el)} · ${pedido.metodo_pago === "mercadopago" ? "Mercado Pago" : "Transferencia bancaria"}`}
        acciones={
          <>
            <ChipEstado estado={pedido.estado} />
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secundario">WhatsApp al cliente</a>}
            <Link href={`/pedido/${pedido.id}?t=${pedido.token_acceso}`} target="_blank" className="btn-secundario">Ver como cliente</Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="tarjeta">
            <h2 className="font-semibold">Productos</h2>
            <ul className="mt-3 divide-y divide-border">
              {pedido.items.map((i) => (
                <li key={i.id} className="flex gap-4 py-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {i.imagen_url && <Image src={i.imagen_url} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.nombre}</p>
                    <p className="text-xs text-muted">{i.variante} · {i.cantidad} × {formatearCLP(i.precio_unitario)}</p>
                    {i.personalizacion && (
                      <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900"><strong>Personalización:</strong> {i.personalizacion}</p>
                    )}
                  </div>
                  <p className="font-semibold">{formatearCLP(i.precio_unitario * i.cantidad)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatearCLP(pedido.subtotal)}</dd></div>
              {pedido.descuento > 0 && <div className="flex justify-between text-success"><dt>Descuento ({pedido.cupon_codigo})</dt><dd>−{formatearCLP(pedido.descuento)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd>{pedido.metodo_entrega === "retiro" ? "Retiro" : formatearCLP(pedido.envio)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd>{formatearCLP(pedido.total)}</dd></div>
            </dl>
          </section>

          {pedido.notas_cliente && (
            <section className="tarjeta">
              <h2 className="font-semibold">Notas del cliente</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{pedido.notas_cliente}</p>
            </section>
          )}

          {pedido.metodo_pago === "mercadopago" && (
            <section className="tarjeta text-sm">
              <h2 className="font-semibold">Mercado Pago</h2>
              <dl className="mt-2 grid gap-2 sm:grid-cols-3">
                <div><dt className="text-xs text-muted">Estado MP</dt><dd className="font-medium">{pedido.mp_status ?? "sin notificación"}</dd></div>
                <div><dt className="text-xs text-muted">ID de pago</dt><dd className="font-mono text-xs">{pedido.mp_payment_id ?? "—"}</dd></div>
                <div><dt className="text-xs text-muted">Preferencia</dt><dd className="font-mono text-xs break-all">{pedido.mp_preference_id ?? "—"}</dd></div>
              </dl>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <GestionPedido pedidoId={pedido.id} estado={pedido.estado} notas={pedido.notas_admin ?? ""} metodoPago={pedido.metodo_pago} />

          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Cliente</h2>
            <p className="mt-2 font-medium">{pedido.nombre}</p>
            <p className="text-muted">{pedido.email}</p>
            <p className="text-muted">{pedido.telefono}</p>
            {pedido.rut && <p className="text-muted">RUT {pedido.rut}</p>}
            {pedido.usuario_id ? (
              <p className="mt-2 text-xs text-muted">Cliente registrado</p>
            ) : (
              <p className="mt-2 text-xs text-muted">Compra como invitado</p>
            )}
          </section>

          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Entrega</h2>
            {pedido.metodo_entrega === "retiro" ? (
              <p className="mt-2 text-muted">Retiro en tienda</p>
            ) : (
              <>
                <p className="mt-2">{pedido.direccion.calle} {pedido.direccion.numero}{pedido.direccion.depto ? `, ${pedido.direccion.depto}` : ""}</p>
                <p className="text-muted">{pedido.direccion.comuna}, {pedido.direccion.region}</p>
                {pedido.zona_envio && <p className="mt-1 text-xs text-muted">Zona: {pedido.zona_envio}</p>}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
