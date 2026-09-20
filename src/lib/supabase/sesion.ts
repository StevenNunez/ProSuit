import { cache } from "react";
import { crearClienteServidor } from "./servidor";
import type { Perfil } from "@/lib/tipos";

/** Usuario actual y su perfil (memorizado por request). */
export const obtenerSesion = cache(async () => {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { usuario: null, perfil: null as Perfil | null };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Perfil>();

  return { usuario: user, perfil };
});

export async function esAdmin() {
  const { perfil } = await obtenerSesion();
  return perfil?.rol === "admin";
}
