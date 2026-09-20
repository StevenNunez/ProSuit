import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioAuth from "@/components/tienda/FormularioAuth";
import { iniciarSesion } from "@/lib/acciones/auth";
import { obtenerSesion } from "@/lib/supabase/sesion";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false } };

export default async function PaginaLogin({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const { usuario, perfil } = await obtenerSesion();
  if (usuario) redirect(perfil?.rol === "admin" ? "/admin" : "/mi-cuenta");
  const volver = typeof sp.volver === "string" ? sp.volver : "";

  return (
    <div className="contenedor flex justify-center py-16">
      <div className="tarjeta w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted">Accede para ver tus pedidos y comprar más rápido.</p>
        {sp.error === "enlace" && (
          <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-danger">El enlace no es válido o ya expiró.</p>
        )}
        <div className="mt-6">
          <FormularioAuth
            accion={iniciarSesion}
            textoBoton="Entrar"
            ocultos={volver ? { volver } : undefined}
            campos={[
              { nombre: "email", etiqueta: "Correo electrónico", tipo: "email", autoComplete: "email" },
              { nombre: "password", etiqueta: "Contraseña", tipo: "password", autoComplete: "current-password" },
            ]}
          />
        </div>
        <div className="mt-5 flex flex-col gap-2 text-center text-sm text-muted">
          <Link href="/recuperar" className="hover:text-primary">¿Olvidaste tu contraseña?</Link>
          <p>
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-primary hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
