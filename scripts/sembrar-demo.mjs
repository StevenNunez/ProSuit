/**
 * Siembra el administrador, el usuario demo y el catálogo de ProSuit.
 *
 *   npm run sembrar
 *
 * Es idempotente: se puede correr las veces que haga falta sin duplicar nada
 * (los ids son deterministas, ver `datos-demo.mjs`).
 *
 * Usa la clave `service_role` (se salta RLS). Las credenciales salen de
 * .env.local, jamás escritas acá:
 *
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL, ADMIN_PASSWORD     → cuenta del dueño de la tienda (rol admin)
 *   DEMO_EMAIL, DEMO_PASSWORD       → cliente demo con pedidos de ejemplo
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { categorias, cupones, idDe, mensajes, pedidos, productos } from "./datos-demo.mjs";

// Carga .env.local sin dependencias externas.
try {
  for (const linea of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // sin .env.local: se usan las variables del entorno
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const demoEmail = process.env.DEMO_EMAIL ?? "demo@prosuit.cl";
const demoPassword = process.env.DEMO_PASSWORD;

if (!url || !serviceRole) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
if (!adminEmail || !adminPassword || !demoPassword) {
  console.error(
    "Faltan credenciales en .env.local. Agrega:\n" +
      "  ADMIN_EMAIL=correo-del-dueno@prosuit.cl\n" +
      "  ADMIN_PASSWORD=una-clave-larga\n" +
      "  DEMO_EMAIL=demo@prosuit.cl\n" +
      "  DEMO_PASSWORD=otra-clave-larga\n",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

/* ── Usuarios ────────────────────────────────────────────────────────────── */

async function asegurarUsuario(email, password, nombre, rol) {
  const { data: lista, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 500 });
  if (error) throw error;
  let usuario = lista.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!usuario) {
    const { data, error: errorCrear } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre },
    });
    if (errorCrear) throw errorCrear;
    usuario = data.user;
    console.log(`  + usuario creado: ${email}`);
  } else {
    await supabase.auth.admin.updateUserById(usuario.id, { password, email_confirm: true });
    console.log(`  = usuario existente: ${email} (contraseña actualizada)`);
  }

  const { error: errorPerfil } = await supabase
    .from("perfiles")
    .upsert({ id: usuario.id, email, nombre, rol }, { onConflict: "id" });
  if (errorPerfil) throw errorPerfil;
  return usuario;
}

/* ── Catálogo ────────────────────────────────────────────────────────────── */

async function sembrarCatalogo() {
  const filasCategorias = categorias.map((c) => ({
    id: idDe(`cat:${c.clave}`),
    nombre: c.nombre,
    slug: c.slug,
    descripcion: c.descripcion,
    imagen_url: c.imagen_url,
    orden: c.orden,
    activa: true,
  }));
  const { error: eCat } = await supabase.from("categorias").upsert(filasCategorias, { onConflict: "id" });
  if (eCat) throw eCat;
  console.log(`  ${filasCategorias.length} categorías`);

  const filasProductos = productos.map((p) => ({
    id: idDe(`prod:${p.clave}`),
    nombre: p.nombre,
    slug: p.slug,
    sku: p.sku,
    descripcion_corta: p.descripcion_corta,
    descripcion: p.descripcion,
    precio: p.precio,
    precio_oferta: p.precio_oferta,
    categoria_id: idDe(`cat:${p.categoria}`),
    imagenes: p.imagenes,
    destacado: p.destacado,
    activo: true,
    permite_personalizacion: true,
  }));
  const { error: eProd } = await supabase.from("productos").upsert(filasProductos, { onConflict: "id" });
  if (eProd) throw eProd;
  console.log(`  ${filasProductos.length} productos`);

  const filasVariantes = productos.flatMap((p) =>
    p.variantes.map(([talla, color, stock], i) => ({
      id: idDe(`var:${p.clave}:${i}`),
      producto_id: idDe(`prod:${p.clave}`),
      talla: talla === "Única" ? null : talla,
      color,
      sku: `${p.sku}-${String(i + 1).padStart(2, "0")}`,
      stock,
      precio_extra: 0,
      activa: true,
      orden: i,
    })),
  );
  const { error: eVar } = await supabase.from("variantes").upsert(filasVariantes, { onConflict: "id" });
  if (eVar) throw eVar;
  console.log(`  ${filasVariantes.length} variantes`);

  const { error: eCup } = await supabase.from("cupones").upsert(cupones, { onConflict: "codigo" });
  if (eCup) throw eCup;
  console.log(`  ${cupones.length} cupones`);
}

/* ── Pedidos y mensajes de ejemplo ───────────────────────────────────────── */

function precioVigente(p) {
  return p.precio_oferta && p.precio_oferta < p.precio ? p.precio_oferta : p.precio;
}

async function sembrarPedidos(demo) {
  const direccion = { calle: "Av. del Mar", numero: "2150", depto: "Of. 301", comuna: "La Serena", region: "Región de Coquimbo" };

  for (const [n, p] of pedidos.entries()) {
    const id = idDe(`pedido:${p.clave}`);
    const creado = new Date(Date.now() - p.hace * 86400000 - n * 3600000).toISOString();

    const items = p.items.map(([claveProd, idxVar, cantidad]) => {
      const prod = productos.find((x) => x.clave === claveProd);
      const [talla, color] = prod.variantes[idxVar];
      const variante = [talla === "Única" ? null : talla, color].filter(Boolean).join(" · ") || "Única";
      return {
        id: idDe(`item:${p.clave}:${claveProd}:${idxVar}`),
        pedido_id: id,
        producto_id: idDe(`prod:${claveProd}`),
        variante_id: idDe(`var:${claveProd}:${idxVar}`),
        nombre: prod.nombre,
        variante,
        imagen_url: prod.imagenes[0],
        precio_unitario: precioVigente(prod),
        cantidad,
        personalizacion: claveProd === "polera-pique" ? "Bordar logo en pecho izquierdo" : null,
      };
    });

    const subtotal = items.reduce((a, i) => a + i.precio_unitario * i.cantidad, 0);
    const descuento = p.cupon === "BIENVENIDA10" ? Math.round(subtotal * 0.1) : 0;
    const envio = p.metodo_entrega === "envio" ? (subtotal - descuento >= 60000 ? 0 : 3500) : 0;

    const { error } = await supabase.from("pedidos").upsert(
      {
        id,
        numero: 1000 + n + 1,
        usuario_id: demo.id,
        email: demo.email,
        nombre: "Cliente Demo",
        telefono: "+56 9 1234 5678",
        rut: "12.345.678-9",
        direccion: p.metodo_entrega === "envio" ? direccion : {},
        metodo_entrega: p.metodo_entrega,
        zona_envio: p.metodo_entrega === "envio" ? "La Serena y Coquimbo" : null,
        subtotal,
        descuento,
        envio,
        total: subtotal - descuento + envio,
        cupon_codigo: p.cupon ?? null,
        metodo_pago: p.metodo_pago,
        estado: p.estado,
        mp_payment_id: p.metodo_pago === "mercadopago" && p.estado !== "pendiente_pago" ? `demo-${1000 + n + 1}` : null,
        mp_status: p.metodo_pago === "mercadopago" && p.estado !== "pendiente_pago" ? (p.estado === "cancelado" ? "cancelled" : "approved") : null,
        notas_cliente: n === 1 ? "Entregar en horario de oficina, por favor." : null,
        creado_el: creado,
      },
      { onConflict: "id" },
    );
    if (error) throw error;

    await supabase.from("pedido_items").delete().eq("pedido_id", id);
    const { error: eItems } = await supabase.from("pedido_items").insert(items);
    if (eItems) throw eItems;
  }
  // La secuencia de números debe quedar por encima de los sembrados.
  await supabase.rpc("reajustar_numero_pedidos").then(() => {}, () => {});
  console.log(`  ${pedidos.length} pedidos de ejemplo`);

  for (const m of mensajes) {
    const { error } = await supabase.from("mensajes_contacto").upsert(
      { id: idDe(`msg:${m.email}`), nombre: m.nombre, email: m.email, telefono: m.telefono, asunto: m.asunto, mensaje: m.mensaje, leido: false, creado_el: new Date(Date.now() - m.hace * 86400000).toISOString() },
      { onConflict: "id" },
    );
    if (error) throw error;
  }
  console.log(`  ${mensajes.length} mensajes de contacto`);
}

/* ── Ejecución ───────────────────────────────────────────────────────────── */

console.log("Usuarios…");
await asegurarUsuario(adminEmail, adminPassword, "Administrador ProSuit", "admin");
const demo = await asegurarUsuario(demoEmail, demoPassword, "Cliente Demo", "cliente");
console.log("Catálogo…");
await sembrarCatalogo();
console.log("Pedidos y mensajes…");
await sembrarPedidos(demo);
console.log("\nListo.");
console.log(`  Panel:  /admin   → ${adminEmail}`);
console.log(`  Cliente demo: /mi-cuenta → ${demoEmail}`);
