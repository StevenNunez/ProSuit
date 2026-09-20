"use client";

import { useTransition } from "react";
import { cambiarRol } from "@/lib/acciones/admin";
import type { Rol } from "@/lib/tipos";

export default function BotonRol({ id, rol }: { id: string; rol: Rol }) {
  const [pendiente, iniciar] = useTransition();
  const nuevo: Rol = rol === "admin" ? "cliente" : "admin";
  return (
    <button
      type="button"
      className="ml-2 text-xs text-muted hover:text-primary disabled:opacity-50"
      disabled={pendiente}
      onClick={() => {
        const texto = nuevo === "admin" ? "¿Dar acceso de administrador a este usuario? Podrá ver y editar todo el panel." : "¿Quitar el acceso de administrador?";
        if (confirm(texto)) iniciar(async () => { await cambiarRol(id, nuevo); });
      }}
    >
      {nuevo === "admin" ? "Hacer admin" : "Quitar admin"}
    </button>
  );
}
