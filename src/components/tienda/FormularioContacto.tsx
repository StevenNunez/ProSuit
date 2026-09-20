"use client";

import { useActionState } from "react";
import { enviarMensajeContacto, type EstadoContacto } from "@/lib/acciones/contacto";

const Obligatorio = () => <span className="text-red-600"> *</span>;

interface Props {
  /** "original" replica el formulario WPForms de la portada; "completo" agrega teléfono. */
  variante?: "original" | "completo";
}

export function FormularioContacto({ variante = "completo" }: Props) {
  const [estado, accion, pendiente] = useActionState<EstadoContacto | null, FormData>(
    enviarMensajeContacto,
    null,
  );

  if (estado?.ok) {
    return (
      <div className="rounded-lg bg-emerald-50 p-6 text-center text-emerald-900">
        <p className="font-semibold">{estado.mensaje}</p>
      </div>
    );
  }

  const claseCampo = "w-full rounded border border-gray-400 bg-white px-3 py-2.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
  const claseEtiqueta = "mb-1.5 block text-base text-foreground";

  return (
    <form action={accion} className="grid gap-6">
      <div>
        <label className={claseEtiqueta} htmlFor="c-nombre">Nombre<Obligatorio /></label>
        <input id="c-nombre" name="nombre" required className={claseCampo} autoComplete="name" />
      </div>
      <div>
        <label className={claseEtiqueta} htmlFor="c-email">Correo electrónico<Obligatorio /></label>
        <input id="c-email" name="email" type="email" required className={claseCampo} autoComplete="email" />
      </div>
      {variante === "completo" && (
        <div>
          <label className={claseEtiqueta} htmlFor="c-telefono">Teléfono</label>
          <input id="c-telefono" name="telefono" className={claseCampo} autoComplete="tel" placeholder="+56 9 …" />
        </div>
      )}
      <div>
        <label className={claseEtiqueta} htmlFor="c-asunto">Asunto</label>
        <input id="c-asunto" name="asunto" className={claseCampo} />
      </div>
      <div>
        <label className={claseEtiqueta} htmlFor="c-mensaje">Mensaje<Obligatorio /></label>
        <textarea id="c-mensaje" name="mensaje" required rows={9} className={claseCampo} />
      </div>
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {estado && !estado.ok && <p className="text-sm text-danger">{estado.mensaje}</p>}
      <div>
        <button
          type="submit"
          className="rounded bg-[#066aab] px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#055a91] disabled:opacity-50"
          disabled={pendiente}
        >
          {pendiente ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
