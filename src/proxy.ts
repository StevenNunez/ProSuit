import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y protege las zonas
 * privadas: /admin (solo administradores) y /mi-cuenta (usuarios logueados).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esAdminRuta = pathname.startsWith("/admin");
  const esCuentaRuta = pathname.startsWith("/mi-cuenta");
  const esPrivada = esAdminRuta || esCuentaRuta;

  // Visitante sin sesión en una página pública: nada que refrescar ni proteger.
  const tieneSesion = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!esPrivada && !tieneSesion) return NextResponse.next();

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(paraSetear) {
          paraSetear.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          paraSetear.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Páginas públicas: solo refrescar la sesión si venció. getSession() lee la
  // cookie sin ir a la red (salvo que toque renovar el token); antes se llamaba
  // a getUser() en cada página y en cada prefetch, y eso iba a Supabase siempre.
  if (!esPrivada) {
    await supabase.auth.getSession();
    return respuesta;
  }

  // Zonas privadas: getUser() valida el token contra Supabase; no usar getSession() acá.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("volver", pathname);
    return NextResponse.redirect(url);
  }

  if (esAdminRuta && user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil?.rol !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/mi-cuenta";
      return NextResponse.redirect(url);
    }
  }

  return respuesta;
}

export const config = {
  matcher: [
    // Todo menos estáticos, imágenes y el webhook de Mercado Pago.
    "/((?!_next/static|_next/image|favicon.ico|img/|api/mercadopago/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
