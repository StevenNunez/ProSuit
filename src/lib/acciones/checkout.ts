"use server";

import { crearClienteAdmin } from "@/lib/supabase/admin";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { crearPreferencia, mercadoPagoConfigurado } from "@/lib/mercadopago";
import { nombreVariante, precioVigente } from "@/lib/formato";
import type { Cupon, Direccion, MetodoEntrega, MetodoPago, PedidoConItems, ZonaEnvio } from "@/lib/tipos";

export interface ItemCheckout {
  varianteId: string;
  cantidad: number;
  personalizacion?: string;
}

export interface DatosCheckout {
  items: ItemCheckout[];
  email: string;
  nombre: string;
  telefono: string;
  rut?: string;
  metodoEntrega: MetodoEntrega;
  direccion: Direccion;
  metodoPago: MetodoPago;
  cupon?: string;
  notas?: string;
}

export interface ResultadoCheckout {
  ok: false;
  error: string;
}

export type ResultadoPedido = ResultadoCheckout | { ok: true; url: string };

/* ── Cálculo compartido (resumen en vivo y creación del pedido) ─────────── */

export interface Resumen {
  lineas: {
    varianteId: string;
    productoId: string;
    nombre: string;
    variante: string;
    imagen: string | null;
    precioUnitario: number;
    cantidad: number;
    personalizacion?: string;
  }[];
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  zona: string | null;
  cupon: string | null;
  avisoCupon: string | null;
}

export async function calcularResumen(
  items: ItemCheckout[],
  metodoEntrega: MetodoEntrega,
  region: string | undefined,
  codigoCupon: string | undefined,
): Promise<Resumen | ResultadoCheckout> {
  if (items.length === 0) return { ok: false, error: "El carrito está vacío." };
  const admin = crearClienteAdmin();

  const ids = items.map((i) => i.varianteId);
  const { data: variantes } = await admin
    .from("variantes")
    .select("id, talla, color, stock, precio_extra, activa, producto:productos(id, nombre, slug, precio, precio_oferta, imagenes, activo)")
    .in("id", ids);

  const lineas: Resumen["lineas"] = [];
  for (const item of items) {
    const v = variantes?.find((x) => x.id === item.varianteId);
    const producto = Array.isArray(v?.producto) ? v?.producto[0] : v?.producto;
    if (!v || !producto || !v.activa || !producto.activo) {
      return { ok: false, error: "Un producto del carrito ya no está disponible. Revísalo e intenta de nuevo." };
    }
    if (item.cantidad < 1) continue;
    if (v.stock < item.cantidad) {
      return { ok: false, error: `Solo quedan ${v.stock} unidades de "${producto.nombre}" (${nombreVariante(v)}).` };
    }
    lineas.push({
      varianteId: v.id,
      productoId: producto.id,
      nombre: producto.nombre,
      variante: nombreVariante(v),
      imagen: producto.imagenes?.[0] ?? null,
      precioUnitario: precioVigente(producto) + (v.precio_extra ?? 0),
      cantidad: item.cantidad,
      personalizacion: item.personalizacion?.trim() || undefined,
    });
  }
  if (lineas.length === 0) return { ok: false, error: "El carrito está vacío." };

  const subtotal = lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0);

  // Cupón
  let descuento = 0;
  let cupon: string | null = null;
  let avisoCupon: string | null = null;
  if (codigoCupon?.trim()) {
    const { data: c } = await admin
      .from("cupones")
      .select("*")
      .ilike("codigo", codigoCupon.trim())
      .maybeSingle<Cupon>();
    const hoy = new Date().toISOString().slice(0, 10);
    if (!c || !c.activo) avisoCupon = "El cupón no existe o está inactivo.";
    else if (c.vence_el && c.vence_el < hoy) avisoCupon = "El cupón está vencido.";
    else if (c.usos_max !== null && c.usos >= c.usos_max) avisoCupon = "El cupón ya alcanzó su límite de usos.";
    else if (subtotal < c.minimo) avisoCupon = `El cupón requiere una compra mínima de $${c.minimo.toLocaleString("es-CL")}.`;
    else {
      descuento = c.tipo === "porcentaje" ? Math.round((subtotal * c.valor) / 100) : Math.min(c.valor, subtotal);
      cupon = c.codigo;
    }
  }

  // Envío
  let envio = 0;
  let zona: string | null = null;
  if (metodoEntrega === "envio") {
    if (!region) return { ok: false, error: "Selecciona la región de envío." };
    const { data: zonas } = await admin.from("zonas_envio").select("*").eq("activa", true).order("orden");
    const z = (zonas as ZonaEnvio[] | null)?.find((z) => z.regiones.includes(region));
    if (!z) return { ok: false, error: "Aún no tenemos envío a esa región. Escríbenos por WhatsApp y lo coordinamos." };
    zona = z.nombre;
    const base = subtotal - descuento;
    envio = z.gratis_desde !== null && base >= z.gratis_desde ? 0 : z.costo;
  }

  return { lineas, subtotal, descuento, envio, total: subtotal - descuento + envio, zona, cupon, avisoCupon };
}

/* ── Crear pedido ───────────────────────────────────────────────────────── */

export async function crearPedido(datos: DatosCheckout): Promise<ResultadoPedido> {
  const email = datos.email.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Ingresa un correo válido." };
  if (!nombre) return { ok: false, error: "Ingresa tu nombre." };
  if (!datos.telefono.trim()) return { ok: false, error: "Ingresa un teléfono de contacto." };
  if (datos.metodoEntrega === "envio") {
    const d = datos.direccion;
    if (!d.calle?.trim() || !d.comuna?.trim() || !d.region?.trim()) {
      return { ok: false, error: "Completa la dirección de envío (calle, comuna y región)." };
    }
  }

  const ajustes = await obtenerAjustes();
  if (datos.metodoPago === "transferencia" && !ajustes.transferencia.activa) {
    return { ok: false, error: "El pago por transferencia no está disponible." };
  }
  if (datos.metodoPago === "mercadopago" && !mercadoPagoConfigurado()) {
    return { ok: false, error: "El pago con Mercado Pago no está disponible por ahora. Elige transferencia." };
  }

  const resumen = await calcularResumen(datos.items, datos.metodoEntrega, datos.direccion.region, datos.cupon);
  if ("ok" in resumen) return resumen;

  const admin = crearClienteAdmin();
  const { usuario } = await obtenerSesion();

  // Reservar stock (atómico por variante); si algo falla, se repone lo ya descontado.
  const descontadas: { id: string; cantidad: number }[] = [];
  for (const l of resumen.lineas) {
    const { data: ok } = await admin.rpc("descontar_stock", { p_variante: l.varianteId, p_cantidad: l.cantidad });
    if (!ok) {
      for (const d of descontadas) await admin.rpc("reponer_stock", { p_variante: d.id, p_cantidad: d.cantidad });
      return { ok: false, error: `Se agotó "${l.nombre}" (${l.variante}) mientras completabas la compra.` };
    }
    descontadas.push({ id: l.varianteId, cantidad: l.cantidad });
  }

  const { data: pedido, error } = await admin
    .from("pedidos")
    .insert({
      usuario_id: usuario?.id ?? null,
      email,
      nombre,
      telefono: datos.telefono.trim(),
      rut: datos.rut?.trim() || null,
      direccion: datos.metodoEntrega === "envio" ? datos.direccion : {},
      metodo_entrega: datos.metodoEntrega,
      zona_envio: resumen.zona,
      subtotal: resumen.subtotal,
      descuento: resumen.descuento,
      envio: resumen.envio,
      total: resumen.total,
      cupon_codigo: resumen.cupon,
      metodo_pago: datos.metodoPago,
      estado: "pendiente_pago",
      notas_cliente: datos.notas?.trim() || null,
    })
    .select("*")
    .single();

  if (error || !pedido) {
    for (const d of descontadas) await admin.rpc("reponer_stock", { p_variante: d.id, p_cantidad: d.cantidad });
    console.error("crearPedido", error);
    return { ok: false, error: "No pudimos registrar el pedido. Intenta de nuevo." };
  }

  const { error: errorItems } = await admin.from("pedido_items").insert(
    resumen.lineas.map((l) => ({
      pedido_id: pedido.id,
      producto_id: l.productoId,
      variante_id: l.varianteId,
      nombre: l.nombre,
      variante: l.variante,
      imagen_url: l.imagen,
      precio_unitario: l.precioUnitario,
      cantidad: l.cantidad,
      personalizacion: l.personalizacion ?? null,
    })),
  );
  if (errorItems) console.error("pedido_items", errorItems);
  if (resumen.cupon) await admin.rpc("usar_cupon", { p_codigo: resumen.cupon });

  const completo: PedidoConItems = {
    ...pedido,
    items: resumen.lineas.map((l, i) => ({
      id: String(i),
      pedido_id: pedido.id,
      producto_id: l.productoId,
      variante_id: l.varianteId,
      nombre: l.nombre,
      variante: l.variante,
      imagen_url: l.imagen,
      precio_unitario: l.precioUnitario,
      cantidad: l.cantidad,
      personalizacion: l.personalizacion ?? null,
    })),
  };

  let destino = `/pedido/${pedido.id}?t=${pedido.token_acceso}`;
  if (datos.metodoPago === "mercadopago") {
    try {
      const pref = await crearPreferencia(completo);
      await admin.from("pedidos").update({ mp_preference_id: pref.id }).eq("id", pedido.id);
      destino = pref.url;
    } catch (e) {
      console.error("Mercado Pago", e);
      // El pedido queda creado; el cliente puede reintentar el pago desde su página.
      destino = `/pedido/${pedido.id}?t=${pedido.token_acceso}&resultado=error`;
    }
  }

  return { ok: true, url: destino };
}

/** Vuelve a generar el link de pago de un pedido pendiente (desde la página del pedido). */
export async function reintentarPago(pedidoId: string, token: string): Promise<ResultadoPedido> {
  const admin = crearClienteAdmin();
  const { data: pedido } = await admin.from("pedidos").select("*, items:pedido_items(*)").eq("id", pedidoId).eq("token_acceso", token).maybeSingle<PedidoConItems>();
  if (!pedido || pedido.estado !== "pendiente_pago" || pedido.metodo_pago !== "mercadopago") {
    return { ok: false, error: "Este pedido no admite reintentar el pago." };
  }
  if (!mercadoPagoConfigurado()) return { ok: false, error: "Mercado Pago no está disponible por ahora." };
  try {
    const pref = await crearPreferencia(pedido);
    await admin.from("pedidos").update({ mp_preference_id: pref.id }).eq("id", pedido.id);
    return { ok: true, url: pref.url };
  } catch (e) {
    console.error("reintentarPago", e);
    return { ok: false, error: "No pudimos conectar con Mercado Pago. Intenta más tarde." };
  }
}
