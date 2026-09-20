"use client";

import { useActionState } from "react";
import type { EstadoAuth } from "@/lib/acciones/auth";

interface Campo {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
  valor?: string;
}

interface Props {
  accion: (previo: EstadoAuth | null, datos: FormData) => Promise<EstadoAuth>;
  campos: Campo[];
  textoBoton: string;
  ocultos?: Record<string, string>;
}

export default function FormularioAuth({ accion, campos, textoBoton, ocultos }: Props) {
  const [estado, despachar, pendiente] = useActionState<EstadoAuth | null, FormData>(accion, null);

  return (
    <form action={despachar} className="grid gap-4">
      {ocultos && Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {campos.map((c) => (
        <div key={c.nombre}>
          <label className="etiqueta" htmlFor={`f-${c.nombre}`}>{c.etiqueta}</label>
          <input
            id={`f-${c.nombre}`}
            name={c.nombre}
            type={c.tipo ?? "text"}
            required
            className="campo"
            autoComplete={c.autoComplete}
            placeholder={c.placeholder}
            minLength={c.minLength}
            defaultValue={c.valor}
          />
        </div>
      ))}
      {estado?.error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-danger">{estado.error}</p>}
      {estado?.mensaje && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{estado.mensaje}</p>}
      <button type="submit" className="btn-primario w-full" disabled={pendiente}>
        {pendiente ? "Un momento…" : textoBoton}
      </button>
    </form>
  );
}
