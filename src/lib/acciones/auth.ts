"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { sitio } from "@/lib/sitio";

export interface EstadoAuth {
  error?: string;
  mensaje?: string;
}

/** Solo permitimos volver a rutas internas para evitar redirecciones abiertas. */
function destinoSeguro(valor: FormDataEntryValue | null, predeterminado: string) {
  const v = String(valor ?? "");
  return v.startsWith("/") && !v.startsWith("//") ? v : predeterminado;
}

export async function iniciarSesion(_previo: EstadoAuth | null, datos: FormData): Promise<EstadoAuth> {
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  const password = String(datos.get("password") ?? "");
  if (!email || !password) return { error: "Ingresa tu correo y contraseña." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user!.id).maybeSingle();
  redirect(destinoSeguro(datos.get("volver"), perfil?.rol === "admin" ? "/admin" : "/mi-cuenta"));
}

export async function registrarse(_previo: EstadoAuth | null, datos: FormData): Promise<EstadoAuth> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  const password = String(datos.get("password") ?? "");
  if (!nombre || !email || !password) return { error: "Completa todos los campos." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${sitio.url}/auth/callback?siguiente=/mi-cuenta`,
    },
  });
  if (error) {
    return { error: error.message.includes("already") ? "Ese correo ya tiene una cuenta. Inicia sesión." : "No pudimos crear la cuenta. Intenta de nuevo." };
  }
  // Si la confirmación por correo está desactivada en Supabase, ya hay sesión.
  if (data.session) redirect("/mi-cuenta");
  return { mensaje: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada." };
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}

export async function recuperarContrasena(_previo: EstadoAuth | null, datos: FormData): Promise<EstadoAuth> {
  const email = String(datos.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Ingresa tu correo." };
  const supabase = await crearClienteServidor();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${sitio.url}/auth/callback?siguiente=/mi-cuenta/contrasena`,
  });
  return { mensaje: "Si el correo existe, te enviamos un enlace para restablecer la contraseña." };
}

export async function cambiarContrasena(_previo: EstadoAuth | null, datos: FormData): Promise<EstadoAuth> {
  const password = String(datos.get("password") ?? "");
  const confirmacion = String(datos.get("confirmacion") ?? "");
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirmacion) return { error: "Las contraseñas no coinciden." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos cambiar la contraseña." };
  return { mensaje: "Contraseña actualizada." };
}

export async function actualizarPerfil(_previo: EstadoAuth | null, datos: FormData): Promise<EstadoAuth> {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };
  const nombre = String(datos.get("nombre") ?? "").trim();
  const telefono = String(datos.get("telefono") ?? "").trim();
  const { error } = await supabase.from("perfiles").update({ nombre, telefono }).eq("id", user.id);
  if (error) return { error: "No pudimos guardar los cambios." };
  return { mensaje: "Datos guardados." };
}
