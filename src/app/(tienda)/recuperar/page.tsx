import type { Metadata } from "next";
import Link from "next/link";
import FormularioAuth from "@/components/tienda/FormularioAuth";
import { recuperarContrasena } from "@/lib/acciones/auth";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function PaginaRecuperar() {
  return (
    <div className="contenedor flex justify-center py-16">
      <div className="tarjeta w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-muted">Te enviaremos un enlace para crear una nueva.</p>
        <div className="mt-6">
          <FormularioAuth
            accion={recuperarContrasena}
            textoBoton="Enviar enlace"
            campos={[{ nombre: "email", etiqueta: "Correo electrónico", tipo: "email", autoComplete: "email" }]}
          />
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="hover:text-primary">← Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
