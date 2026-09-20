import type { Metadata } from "next";
import Link from "next/link";
import FormularioAuth from "@/components/tienda/FormularioAuth";
import { cambiarContrasena } from "@/lib/acciones/auth";

export const metadata: Metadata = { title: "Cambiar contraseña", robots: { index: false } };

export default function PaginaContrasena() {
  return (
    <div className="contenedor flex justify-center py-16">
      <div className="tarjeta w-full max-w-md">
        <h1 className="font-display text-2xl font-bold">Nueva contraseña</h1>
        <div className="mt-6">
          <FormularioAuth
            accion={cambiarContrasena}
            textoBoton="Guardar contraseña"
            campos={[
              { nombre: "password", etiqueta: "Nueva contraseña", tipo: "password", autoComplete: "new-password", minLength: 8 },
              { nombre: "confirmacion", etiqueta: "Repite la contraseña", tipo: "password", autoComplete: "new-password", minLength: 8 },
            ]}
          />
        </div>
        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/mi-cuenta" className="hover:text-primary">← Volver a mi cuenta</Link>
        </p>
      </div>
    </div>
  );
}
