import Link from "next/link";
import { ChipBooleano, EncabezadoPagina, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import { BotonEliminar, FormularioAccion, Interruptor } from "@/components/admin/Formularios";
import { eliminarZona, guardarZona } from "@/lib/acciones/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP } from "@/lib/formato";
import { regionesChile } from "@/lib/sitio";
import type { ZonaEnvio } from "@/lib/tipos";

export const metadata = { title: "Envíos" };

export default async function PaginaEnvios({ searchParams }: PageProps<"/admin/envios">) {
  const sp = await searchParams;
  const editarId = typeof sp.editar === "string" ? sp.editar : null;
  const supabase = await crearClienteServidor();
  const { data: zonas } = await supabase.from("zonas_envio").select("*").order("orden").returns<ZonaEnvio[]>();
  const editando = zonas?.find((z) => z.id === editarId) ?? null;
  const cubiertas = new Set((zonas ?? []).filter((z) => z.activa).flatMap((z) => z.regiones));
  const sinCobertura = regionesChile.filter((r) => !cubiertas.has(r));

  return (
    <>
      <EncabezadoPagina titulo="Zonas de envío" descripcion="El costo se elige según la región del cliente. El retiro en tienda se configura en Ajustes." />
      {sinCobertura.length > 0 && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Sin cobertura (no se podrá comprar con envío a): {sinCobertura.join(", ")}.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          {!zonas || zonas.length === 0 ? (
            <Vacio titulo="Sin zonas de envío" />
          ) : (
            <Tabla>
              <thead><tr><Th>Zona</Th><Th>Regiones</Th><Th>Costo</Th><Th>Gratis desde</Th><Th>Plazo</Th><Th>Estado</Th><Th></Th></tr></thead>
              <tbody>
                {zonas.map((z) => (
                  <tr key={z.id} className={editarId === z.id ? "bg-primary-soft/40" : "hover:bg-sand/40"}>
                    <Td className="font-semibold">{z.nombre}</Td>
                    <Td className="max-w-xs text-xs text-muted">{z.regiones.length} región{z.regiones.length === 1 ? "" : "es"}</Td>
                    <Td>{formatearCLP(z.costo)}</Td>
                    <Td className="text-muted">{z.gratis_desde !== null ? formatearCLP(z.gratis_desde) : "—"}</Td>
                    <Td className="text-muted">{z.dias_estimados ?? "—"}</Td>
                    <Td><ChipBooleano valor={z.activa} si="Activa" no="Inactiva" /></Td>
                    <Td className="text-right">
                      <Link href={`/admin/envios?editar=${z.id}`} className="mr-3 text-sm font-medium text-primary hover:underline">Editar</Link>
                      <BotonEliminar accion={eliminarZona.bind(null, z.id)} confirmacion={`¿Eliminar la zona "${z.nombre}"?`} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
        </div>

        <aside className="tarjeta h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editando ? `Editar: ${editando.nombre}` : "Nueva zona"}</h2>
            {editando && <Link href="/admin/envios" className="text-xs text-muted hover:text-primary">Cancelar</Link>}
          </div>
          <FormularioAccion key={editando?.id ?? "nueva"} accion={guardarZona} className="mt-4 grid gap-3">
            {editando && <input type="hidden" name="id" value={editando.id} />}
            <div><label className="etiqueta">Nombre *</label><input name="nombre" required className="campo" defaultValue={editando?.nombre ?? ""} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="etiqueta">Costo $</label><input name="costo" type="number" min={0} className="campo" defaultValue={editando?.costo ?? 0} /></div>
              <div><label className="etiqueta">Gratis desde $</label><input name="gratis_desde" type="number" min={0} className="campo" defaultValue={editando?.gratis_desde ?? ""} placeholder="Nunca" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="etiqueta">Plazo estimado</label><input name="dias_estimados" className="campo" defaultValue={editando?.dias_estimados ?? ""} placeholder="3 a 5 días hábiles" /></div>
              <div><label className="etiqueta">Orden</label><input name="orden" type="number" className="campo" defaultValue={editando?.orden ?? 0} /></div>
            </div>
            <div>
              <span className="etiqueta">Regiones</span>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {regionesChile.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="regiones" value={r} defaultChecked={editando?.regiones.includes(r) ?? false} className="size-4 accent-primary" />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <Interruptor nombre="activa" etiqueta="Activa" valor={editando?.activa ?? true} />
          </FormularioAccion>
        </aside>
      </div>
    </>
  );
}
