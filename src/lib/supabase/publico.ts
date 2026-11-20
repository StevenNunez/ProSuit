import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase sin sesión (rol anónimo) para leer datos públicos:
 * catálogo, zonas de envío y ajustes de la tienda.
 *
 * No toca las cookies, así que las páginas que solo leen esto se pueden
 * pre-generar y servir desde caché (ISR) en vez de armarse en cada visita.
 * Lo que dependa del usuario va por `crearClienteServidor`.
 */
export function crearClientePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
