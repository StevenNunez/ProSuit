"use client";

import { useTransition } from "react";
import { marcarMensaje } from "@/lib/acciones/admin";

export default function BotonLeido({ id, leido }: { id: string; leido: boolean }) {
  const [pendiente, iniciar] = useTransition();
  return (
    <button
      type="button"
      className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
      disabled={pendiente}
      onClick={() => iniciar(() => marcarMensaje(id, !leido))}
    >
      {leido ? "Marcar como no leído" : "Marcar como leído"}
    </button>
  );
}
