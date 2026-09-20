import { NextResponse, type NextRequest } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { firmaWebhookValida, obtenerPago } from "@/lib/mercadopago";
import type { EstadoPedido } from "@/lib/tipos";

/**
 * Notificaciones de Mercado Pago (Checkout Pro).
 * Configurar en el panel de MP la URL: https://<dominio>/api/mercadopago/webhook
 * con el evento "Pagos". Siempre respondemos 200 para que MP no reintente en bucle.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  let cuerpo: { type?: string; action?: string; data?: { id?: string } } = {};
  try {
    cuerpo = await request.json();
  } catch {
    // Algunas notificaciones antiguas llegan solo por query string.
  }

  const tipo = cuerpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo !== "payment" || !dataId) return NextResponse.json({ ok: true, ignorado: true });

  if (!firmaWebhookValida(request.headers, String(dataId))) {
    return NextResponse.json({ error: "firma inválida" }, { status: 401 });
  }

  try {
    const pago = await obtenerPago(String(dataId));
    const pedidoId = pago.external_reference;
    if (!pedidoId) return NextResponse.json({ ok: true, sinReferencia: true });

    const admin = crearClienteAdmin();
    const { data: pedido } = await admin.from("pedidos").select("id, estado").eq("id", pedidoId).maybeSingle();
    if (!pedido) return NextResponse.json({ ok: true, sinPedido: true });

    // Mapa de estados de MP → estado del pedido. No se pisa un pedido que ya
    // avanzó (en preparación, enviado…) con una notificación tardía.
    const estadoMP = pago.status ?? "";
    let nuevo: EstadoPedido | null = null;
    if (estadoMP === "approved") nuevo = "pagado";
    else if (estadoMP === "rejected" || estadoMP === "cancelled") nuevo = "pendiente_pago";
    else if (estadoMP === "refunded" || estadoMP === "charged_back") nuevo = "reembolsado";

    const avanzado = ["en_preparacion", "enviado", "entregado"].includes(pedido.estado);
    const cambios: Record<string, unknown> = { mp_payment_id: String(pago.id), mp_status: estadoMP };
    if (nuevo && !(avanzado && nuevo !== "reembolsado") && !(pedido.estado === "pagado" && nuevo === "pendiente_pago")) {
      cambios.estado = nuevo;
    }
    await admin.from("pedidos").update(cambios).eq("id", pedidoId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook mercadopago", e);
    // 200 igual: el pago se puede reconciliar desde el panel.
    return NextResponse.json({ ok: false });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
