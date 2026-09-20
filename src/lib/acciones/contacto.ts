"use server";

import { crearClienteServidor } from "@/lib/supabase/servidor";

export interface EstadoContacto {
  ok: boolean;
  mensaje: string;
}

export async function enviarMensajeContacto(
  _previo: EstadoContacto | null,
  datos: FormData,
): Promise<EstadoContacto> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const email = String(datos.get("email") ?? "").trim();
  const telefono = String(datos.get("telefono") ?? "").trim();
  const asunto = String(datos.get("asunto") ?? "").trim();
  const mensaje = String(datos.get("mensaje") ?? "").trim();
  // Campo trampa para bots: los humanos no lo ven ni lo llenan.
  if (String(datos.get("sitio_web") ?? "")) return { ok: true, mensaje: "¡Gracias! Te responderemos pronto." };

  if (!nombre || !email || !mensaje) {
    return { ok: false, mensaje: "Completa nombre, correo y mensaje." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, mensaje: "El correo no parece válido." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("mensajes_contacto").insert({
    nombre,
    email,
    telefono: telefono || null,
    asunto: asunto || null,
    mensaje,
  });
  if (error) return { ok: false, mensaje: "No pudimos enviar el mensaje. Intenta de nuevo o escríbenos por WhatsApp." };
  return { ok: true, mensaje: "¡Gracias! Recibimos tu mensaje y te responderemos pronto." };
}
