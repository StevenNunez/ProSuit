import "server-only";
import { createHmac } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PedidoConItems } from "@/lib/tipos";
import { numeroPedido } from "@/lib/formato";
import { sitio } from "@/lib/sitio";

export function mercadoPagoConfigurado() {
  return !!process.env.MP_ACCESS_TOKEN;
}

function cliente() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 8000 } });
}

/** Crea la preferencia de Checkout Pro y devuelve la URL a la que redirigir. */
export async function crearPreferencia(pedido: PedidoConItems) {
  const base = sitio.url.replace(/\/$/, "");
  const volver = `${base}/pedido/${pedido.id}?t=${pedido.token_acceso}`;

  const preferencia = await new Preference(cliente()).create({
    body: {
      // Mercado Pago no acepta ítems con precio negativo, así que con cupón se
      // manda un solo ítem por el total; sin cupón va el detalle línea por línea.
      items:
        pedido.descuento > 0
          ? [
              {
                id: pedido.id,
                title: `Pedido ${numeroPedido(pedido.numero)} · ProSuit (${pedido.items.length} productos)`,
                quantity: 1,
                unit_price: pedido.total,
                currency_id: "CLP",
              },
            ]
          : [
              ...pedido.items.map((i) => ({
                id: i.variante_id ?? i.id,
                title: i.variante ? `${i.nombre} (${i.variante})` : i.nombre,
                quantity: i.cantidad,
                unit_price: i.precio_unitario,
                currency_id: "CLP",
                picture_url: i.imagen_url?.startsWith("http") ? i.imagen_url : undefined,
              })),
              ...(pedido.envio > 0
                ? [{ id: "envio", title: "Envío", quantity: 1, unit_price: pedido.envio, currency_id: "CLP" }]
                : []),
            ],
      payer: {
        name: pedido.nombre,
        email: pedido.email,
        phone: pedido.telefono ? { number: pedido.telefono } : undefined,
      },
      external_reference: pedido.id,
      statement_descriptor: "PROSUIT",
      back_urls: {
        success: `${volver}&resultado=exito`,
        pending: `${volver}&resultado=pendiente`,
        failure: `${volver}&resultado=error`,
      },
      auto_return: "approved",
      notification_url: `${base}/api/mercadopago/webhook`,
      metadata: { numero: numeroPedido(pedido.numero) },
    },
  });

  const url = process.env.MP_SANDBOX === "true" ? preferencia.sandbox_init_point : preferencia.init_point;
  if (!url || !preferencia.id) throw new Error("Mercado Pago no devolvió la URL de pago");
  return { id: preferencia.id, url };
}

export async function obtenerPago(id: string) {
  return new Payment(cliente()).get({ id });
}

/**
 * Valida la firma del webhook (x-signature) si hay MP_WEBHOOK_SECRET.
 * Formato documentado por Mercado Pago: "ts=...,v1=..." sobre
 * "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 */
export function firmaWebhookValida(cabeceras: Headers, dataId: string | null) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) return true; // sin secreto configurado no se valida (útil en pruebas)
  const firma = cabeceras.get("x-signature");
  const requestId = cabeceras.get("x-request-id");
  if (!firma || !dataId) return false;

  const partes = Object.fromEntries(
    firma.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifiesto = `id:${dataId.toLowerCase()};request-id:${requestId ?? ""};ts:${ts};`;
  const esperado = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  return esperado === v1;
}
