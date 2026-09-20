import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y protege las zonas
 * privadas: /admin (solo administradores) y /mi-cuenta (usuarios logueados).
 */
export async function proxy(request: NextRequest) {
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

  // getUser() valida el token contra Supabase; no usar getSession() acá.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esAdminRuta = pathname.startsWith("/admin");
  const esCuentaRuta = pathname.startsWith("/mi-cuenta");

  if ((esAdminRuta || esCuentaRuta) && !user) {
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
