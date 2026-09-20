import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioAuth from "@/components/tienda/FormularioAuth";
import { registrarse } from "@/lib/acciones/auth";
import { obtenerSesion } from "@/lib/supabase/sesion";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function PaginaRegistro() {
  const { usuario } = await obtenerSesion();
  if (usuario) redirect("/mi-cuenta");

  return (
    <div className="contenedor flex justify-center py-16">
      <div className="tarjeta w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">Guarda tus datos y revisa el historial de tus pedidos.</p>
        <div className="mt-6">
          <FormularioAuth
            accion={registrarse}
            textoBoton="Crear cuenta"
            campos={[
              { nombre: "nombre", etiqueta: "Nombre y apellido", autoComplete: "name" },
              { nombre: "email", etiqueta: "Correo electrónico", tipo: "email", autoComplete: "email" },
              { nombre: "password", etiqueta: "Contraseña (mínimo 8 caracteres)", tipo: "password", autoComplete: "new-password", minLength: 8 },
            ]}
          />
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
