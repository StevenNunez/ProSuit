"use client";

import { useActionState, useTransition, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import type { EstadoAccion } from "@/lib/acciones/admin";

/** Formulario genérico del panel: envía FormData a una acción y muestra el resultado. */
export function FormularioAccion({
  accion,
  children,
  textoBoton = "Guardar",
  className = "",
  alGuardar,
}: {
  accion: (previo: EstadoAccion | null, datos: FormData) => Promise<EstadoAccion>;
  children: ReactNode;
  textoBoton?: string;
  className?: string;
  alGuardar?: () => void;
}) {
  const [estado, despachar, pendiente] = useActionState<EstadoAccion | null, FormData>(async (p, d) => {
    const r = await accion(p, d);
    if (r.ok) alGuardar?.();
    return r;
  }, null);

  return (
    <form action={despachar} className={className}>
      {children}
      {estado && (
        <p className={`mt-3 rounded-lg p-2.5 text-sm ${estado.ok ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-danger"}`}>{estado.mensaje}</p>
      )}
      <button type="submit" className="btn-primario mt-4" disabled={pendiente}>
        {pendiente ? "Guardando…" : textoBoton}
      </button>
    </form>
  );
}

export function BotonEliminar({ accion, confirmacion = "¿Eliminar este registro?", etiqueta }: { accion: () => Promise<void>; confirmacion?: string; etiqueta?: string }) {
  const [pendiente, iniciar] = useTransition();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger disabled:opacity-50"
      disabled={pendiente}
      onClick={() => { if (confirm(confirmacion)) iniciar(accion); }}
    >
      <Trash2 className="size-3.5" /> {etiqueta ?? "Eliminar"}
    </button>
  );
}

export function Interruptor({ nombre, etiqueta, valor, descripcion }: { nombre: string; etiqueta: string; valor: boolean; descripcion?: string }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm">
      <span>
        <span className="font-medium">{etiqueta}</span>
        {descripcion && <span className="block text-xs text-muted">{descripcion}</span>}
      </span>
      <input type="checkbox" name={nombre} defaultChecked={valor} className="size-5 accent-primary" />
    </label>
  );
}
