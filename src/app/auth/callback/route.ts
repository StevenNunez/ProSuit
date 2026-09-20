import { NextResponse, type NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/** Intercambia el código de los enlaces de correo (confirmación, recuperación) por una sesión. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("code");
  const siguienteParam = url.searchParams.get("siguiente") ?? "/mi-cuenta";
  const siguiente = siguienteParam.startsWith("/") && !siguienteParam.startsWith("//") ? siguienteParam : "/mi-cuenta";

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(siguiente, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=enlace", url.origin));
}
