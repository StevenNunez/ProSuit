"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { esAdmin } from "@/lib/supabase/sesion";
import { slugificar } from "@/lib/formato";
import type { EstadoPedido } from "@/lib/tipos";

export interface EstadoAccion {
  ok: boolean;
  mensaje: string;
}

/**
 * Las acciones usan el cliente con sesión (RLS valida que sea admin) salvo
 * donde se necesita tocar auth.users o storage con permisos elevados.
 */
async function exigirAdmin() {
  if (!(await esAdmin())) throw new Error("No autorizado");
  return crearClienteServidor();
}

const texto = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const entero = (d: FormData, k: string, pred = 0) => {
  const n = parseInt(String(d.get(k) ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : pred;
};
const opcionalEntero = (d: FormData, k: string) => {
  const v = String(d.get(k) ?? "").trim();
  return v === "" ? null : entero(d, k);
};
const booleano = (d: FormData, k: string) => d.get(k) === "on" || d.get(k) === "true";

function revalidarCatalogo() {
  revalidatePath("/", "layout");
}

/* ── Categorías ─────────────────────────────────────────────────────────── */

export async function guardarCategoria(_p: EstadoAccion | null, datos: FormData): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const id = texto(datos, "id");
  const nombre = texto(datos, "nombre");
  if (!nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
  const fila = {
    nombre,
    slug: slugificar(texto(datos, "slug") || nombre),
    descripcion: texto(datos, "descripcion") || null,
    imagen_url: texto(datos, "imagen_url") || null,
    orden: entero(datos, "orden"),
    activa: booleano(datos, "activa"),
  };
  const { error } = id
    ? await supabase.from("categorias").update(fila).eq("id", id)
    : await supabase.from("categorias").insert(fila);
  if (error) return { ok: false, mensaje: error.code === "23505" ? "Ya existe una categoría con ese slug." : error.message };
  revalidarCatalogo();
  return { ok: true, mensaje: "Categoría guardada." };
}

export async function eliminarCategoria(id: string) {
  const supabase = await exigirAdmin();
  await supabase.from("categorias").delete().eq("id", id);
  revalidarCatalogo();
}

/* ── Productos ──────────────────────────────────────────────────────────── */

export interface VarianteEntrada {
  id?: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  precio_extra: number;
  activa: boolean;
}

export interface ProductoEntrada {
  id?: string;
  nombre: string;
  slug: string;
  sku: string;
  descripcion_corta: string;
  descripcion: string;
  precio: number;
  precio_oferta: number | null;
  categoria_id: string | null;
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  permite_personalizacion: boolean;
  variantes: VarianteEntrada[];
}

export async function guardarProducto(entrada: ProductoEntrada): Promise<EstadoAccion & { id?: string }> {
  const supabase = await exigirAdmin();
  if (!entrada.nombre.trim()) return { ok: false, mensaje: "El nombre es obligatorio." };
  if (!(entrada.precio >= 0)) return { ok: false, mensaje: "El precio no es válido." };
  if (entrada.precio_oferta !== null && entrada.precio_oferta >= entrada.precio) {
    return { ok: false, mensaje: "El precio de oferta debe ser menor al precio normal." };
  }

  const fila = {
    nombre: entrada.nombre.trim(),
    slug: slugificar(entrada.slug || entrada.nombre),
    sku: entrada.sku.trim() || null,
    descripcion_corta: entrada.descripcion_corta.trim() || null,
    descripcion: entrada.descripcion.trim() || null,
    precio: Math.round(entrada.precio),
    precio_oferta: entrada.precio_oferta === null ? null : Math.round(entrada.precio_oferta),
    categoria_id: entrada.categoria_id || null,
    imagenes: entrada.imagenes.filter(Boolean),
    destacado: entrada.destacado,
    activo: entrada.activo,
    permite_personalizacion: entrada.permite_personalizacion,
  };

  let id = entrada.id;
  if (id) {
    const { error } = await supabase.from("productos").update(fila).eq("id", id);
    if (error) return { ok: false, mensaje: error.code === "23505" ? "Ya existe un producto con ese slug." : error.message };
  } else {
    const { data, error } = await supabase.from("productos").insert(fila).select("id").single();
    if (error || !data) return { ok: false, mensaje: error?.code === "23505" ? "Ya existe un producto con ese slug." : (error?.message ?? "Error") };
    id = data.id;
  }

  // Variantes: se actualizan las existentes, se crean las nuevas y se borran las que ya no vienen.
  const variantes = entrada.variantes.length
    ? entrada.variantes
    : [{ talla: "", color: "", sku: "", stock: 0, precio_extra: 0, activa: true }];
  const { data: existentes } = await supabase.from("variantes").select("id").eq("producto_id", id);
  const conservar = new Set<string>();

  for (const [orden, v] of variantes.entries()) {
    const filaV = {
      producto_id: id,
      talla: v.talla.trim() || null,
      color: v.color.trim() || null,
      sku: v.sku.trim() || null,
      stock: Math.max(0, Math.round(v.stock || 0)),
      precio_extra: Math.round(v.precio_extra || 0),
      activa: v.activa,
      orden,
    };
    if (v.id) {
      await supabase.from("variantes").update(filaV).eq("id", v.id);
      conservar.add(v.id);
    } else {
      const { data } = await supabase.from("variantes").insert(filaV).select("id").single();
      if (data) conservar.add(data.id);
    }
  }
  const borrar = (existentes ?? []).map((e) => e.id).filter((eid) => !conservar.has(eid));
  if (borrar.length) await supabase.from("variantes").delete().in("id", borrar);

  revalidarCatalogo();
  return { ok: true, mensaje: "Producto guardado.", id };
}

export async function eliminarProducto(id: string) {
  const supabase = await exigirAdmin();
  await supabase.from("productos").delete().eq("id", id);
  revalidarCatalogo();
  redirect("/admin/productos");
}

export async function alternarProducto(id: string, campo: "activo" | "destacado", valor: boolean) {
  const supabase = await exigirAdmin();
  await supabase.from("productos").update({ [campo]: valor }).eq("id", id);
  revalidarCatalogo();
}

/** Sube una imagen al bucket `productos` y devuelve su URL pública. */
export async function subirImagen(datos: FormData): Promise<{ ok: true; url: string } | { ok: false; mensaje: string }> {
  await exigirAdmin();
  const archivo = datos.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) return { ok: false, mensaje: "Selecciona una imagen." };
  if (archivo.size > 5 * 1024 * 1024) return { ok: false, mensaje: "La imagen no puede superar 5 MB." };
  if (!archivo.type.startsWith("image/")) return { ok: false, mensaje: "El archivo debe ser una imagen." };

  const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const ruta = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
  const admin = crearClienteAdmin();
  const { error } = await admin.storage.from("productos").upload(ruta, archivo, {
    contentType: archivo.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false, mensaje: `No se pudo subir: ${error.message}` };
  const { data } = admin.storage.from("productos").getPublicUrl(ruta);
  return { ok: true, url: data.publicUrl };
}

/* ── Cupones ────────────────────────────────────────────────────────────── */

export async function guardarCupon(_p: EstadoAccion | null, datos: FormData): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const id = texto(datos, "id");
  const codigo = texto(datos, "codigo").toUpperCase().replace(/\s+/g, "");
  const valor = entero(datos, "valor");
  const tipo = texto(datos, "tipo") === "monto" ? "monto" : "porcentaje";
  if (!codigo) return { ok: false, mensaje: "El código es obligatorio." };
  if (valor <= 0 || (tipo === "porcentaje" && valor > 100)) return { ok: false, mensaje: "El valor no es válido." };
  const fila = {
    codigo,
    tipo,
    valor,
    minimo: entero(datos, "minimo"),
    usos_max: opcionalEntero(datos, "usos_max"),
    vence_el: texto(datos, "vence_el") || null,
    activo: booleano(datos, "activo"),
  };
  const { error } = id ? await supabase.from("cupones").update(fila).eq("id", id) : await supabase.from("cupones").insert(fila);
  if (error) return { ok: false, mensaje: error.code === "23505" ? "Ya existe un cupón con ese código." : error.message };
  revalidatePath("/admin/cupones");
  return { ok: true, mensaje: "Cupón guardado." };
}

export async function eliminarCupon(id: string) {
  const supabase = await exigirAdmin();
  await supabase.from("cupones").delete().eq("id", id);
  revalidatePath("/admin/cupones");
}

/* ── Zonas de envío ─────────────────────────────────────────────────────── */

export async function guardarZona(_p: EstadoAccion | null, datos: FormData): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const id = texto(datos, "id");
  const nombre = texto(datos, "nombre");
  if (!nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
  const regiones = datos.getAll("regiones").map(String).filter(Boolean);
  const fila = {
    nombre,
    regiones,
    costo: entero(datos, "costo"),
    gratis_desde: opcionalEntero(datos, "gratis_desde"),
    dias_estimados: texto(datos, "dias_estimados") || null,
    activa: booleano(datos, "activa"),
    orden: entero(datos, "orden"),
  };
  const { error } = id ? await supabase.from("zonas_envio").update(fila).eq("id", id) : await supabase.from("zonas_envio").insert(fila);
  if (error) return { ok: false, mensaje: error.message };
  revalidatePath("/admin/envios");
  revalidatePath("/checkout");
  return { ok: true, mensaje: "Zona guardada." };
}

export async function eliminarZona(id: string) {
  const supabase = await exigirAdmin();
  await supabase.from("zonas_envio").delete().eq("id", id);
  revalidatePath("/admin/envios");
}

/* ── Pedidos ────────────────────────────────────────────────────────────── */

const TRANSICIONES_QUE_REPONEN: EstadoPedido[] = ["cancelado", "reembolsado"];

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const { data: pedido } = await supabase.from("pedidos").select("estado").eq("id", id).maybeSingle();
  if (!pedido) return { ok: false, mensaje: "Pedido no encontrado." };

  const admin = crearClienteAdmin();
  const eraActivo = !TRANSICIONES_QUE_REPONEN.includes(pedido.estado as EstadoPedido);
  const seraInactivo = TRANSICIONES_QUE_REPONEN.includes(estado);

  // Al cancelar/reembolsar se devuelve el stock reservado; al reactivar se vuelve a descontar.
  if (eraActivo && seraInactivo) {
    const { data: items } = await admin.from("pedido_items").select("variante_id, cantidad").eq("pedido_id", id);
    for (const i of items ?? []) if (i.variante_id) await admin.rpc("reponer_stock", { p_variante: i.variante_id, p_cantidad: i.cantidad });
  } else if (!eraActivo && !seraInactivo) {
    const { data: items } = await admin.from("pedido_items").select("variante_id, cantidad").eq("pedido_id", id);
    for (const i of items ?? []) if (i.variante_id) await admin.rpc("descontar_stock", { p_variante: i.variante_id, p_cantidad: i.cantidad });
  }

  const { error } = await supabase.from("pedidos").update({ estado }).eq("id", id);
  if (error) return { ok: false, mensaje: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, mensaje: "Estado actualizado." };
}

export async function guardarNotasPedido(id: string, notas: string): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("pedidos").update({ notas_admin: notas.trim() || null }).eq("id", id);
  if (error) return { ok: false, mensaje: error.message };
  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true, mensaje: "Notas guardadas." };
}

/* ── Mensajes ───────────────────────────────────────────────────────────── */

export async function marcarMensaje(id: string, leido: boolean) {
  const supabase = await exigirAdmin();
  await supabase.from("mensajes_contacto").update({ leido }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function eliminarMensaje(id: string) {
  const supabase = await exigirAdmin();
  await supabase.from("mensajes_contacto").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

/* ── Ajustes ────────────────────────────────────────────────────────────── */

export async function guardarAjustes(_p: EstadoAccion | null, datos: FormData): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const tienda = {
    nombre: texto(datos, "tienda.nombre") || "ProSuit",
    email: texto(datos, "tienda.email"),
    telefono: texto(datos, "tienda.telefono"),
    whatsapp: texto(datos, "tienda.whatsapp").replace(/\D/g, ""),
    direccion: texto(datos, "tienda.direccion"),
    instagram: texto(datos, "tienda.instagram"),
    horario: texto(datos, "tienda.horario"),
  };
  const transferencia = {
    activa: booleano(datos, "transferencia.activa"),
    banco: texto(datos, "transferencia.banco"),
    tipo_cuenta: texto(datos, "transferencia.tipo_cuenta"),
    numero: texto(datos, "transferencia.numero"),
    rut: texto(datos, "transferencia.rut"),
    titular: texto(datos, "transferencia.titular"),
    email: texto(datos, "transferencia.email"),
  };
  const retiro = {
    activo: booleano(datos, "retiro.activo"),
    direccion: texto(datos, "retiro.direccion"),
    horario: texto(datos, "retiro.horario"),
  };
  const { error } = await supabase.from("ajustes").upsert([
    { clave: "tienda", valor: tienda, publico: true },
    { clave: "transferencia", valor: transferencia, publico: true },
    { clave: "retiro", valor: retiro, publico: true },
  ]);
  if (error) return { ok: false, mensaje: error.message };
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Ajustes guardados." };
}

/* ── Administradores ────────────────────────────────────────────────────── */

export async function cambiarRol(id: string, rol: "admin" | "cliente"): Promise<EstadoAccion> {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("perfiles").update({ rol }).eq("id", id);
  if (error) return { ok: false, mensaje: error.message };
  revalidatePath("/admin/clientes");
  return { ok: true, mensaje: rol === "admin" ? "Ahora es administrador." : "Ya no es administrador." };
}
