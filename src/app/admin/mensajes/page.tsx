import { EncabezadoPagina, Vacio } from "@/components/admin/ui";
import { BotonEliminar } from "@/components/admin/Formularios";
import BotonLeido from "@/components/admin/BotonLeido";
import { eliminarMensaje } from "@/lib/acciones/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearFechaHora } from "@/lib/formato";
import type { MensajeContacto } from "@/lib/tipos";

export const metadata = { title: "Mensajes" };

export default async function PaginaMensajes() {
  const supabase = await crearClienteServidor();
  const { data: mensajes } = await supabase
    .from("mensajes_contacto")
    .select("*")
    .order("leido")
    .order("creado_el", { ascending: false })
    .limit(200)
    .returns<MensajeContacto[]>();

  return (
    <>
      <EncabezadoPagina titulo="Mensajes de contacto" descripcion="Lo que llega desde el formulario del sitio." />
      {!mensajes || mensajes.length === 0 ? (
        <Vacio titulo="Sin mensajes" texto="Cuando alguien escriba por el formulario aparecerá aquí." />
      ) : (
        <ul className="space-y-3">
          {mensajes.map((m) => (
            <li key={m.id} className={`tarjeta ${m.leido ? "opacity-75" : "border-l-4 border-l-primary"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.nombre} {!m.leido && <span className="chip ml-1 bg-primary-soft text-primary">Nuevo</span>}</p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a>
                    {m.telefono && <> · <a href={`https://wa.me/${m.telefono.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{m.telefono}</a></>}
                    {" · "}{formatearFechaHora(m.creado_el)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BotonLeido id={m.id} leido={m.leido} />
                  <BotonEliminar accion={eliminarMensaje.bind(null, m.id)} confirmacion="¿Eliminar este mensaje?" />
                </div>
              </div>
              {m.asunto && <p className="mt-3 text-sm font-medium">{m.asunto}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-foreground/85">{m.mensaje}</p>
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.asunto ?? "Tu mensaje a ProSuit")}`} className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Responder por correo →</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
