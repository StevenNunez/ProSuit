import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la clave service_role: se salta RLS. Solo para el servidor y
 * solo donde hace falta (crear pedidos, webhook de Mercado Pago).
 */
export function crearClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
