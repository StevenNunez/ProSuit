import Link from "next/link";
import { ChipBooleano, EncabezadoPagina, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import { BotonEliminar, FormularioAccion, Interruptor } from "@/components/admin/Formularios";
import { eliminarCupon, guardarCupon } from "@/lib/acciones/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP, formatearFecha } from "@/lib/formato";
import type { Cupon } from "@/lib/tipos";

export const metadata = { title: "Cupones" };

export default async function PaginaCupones({ searchParams }: PageProps<"/admin/cupones">) {
  const sp = await searchParams;
  const editarId = typeof sp.editar === "string" ? sp.editar : null;
  const supabase = await crearClienteServidor();
  const { data: cupones } = await supabase.from("cupones").select("*").order("creado_el", { ascending: false }).returns<Cupon[]>();
  const editando = cupones?.find((c) => c.id === editarId) ?? null;
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <>
      <EncabezadoPagina titulo="Cupones de descuento" descripcion="Códigos que el cliente ingresa al pagar." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {!cupones || cupones.length === 0 ? (
            <Vacio titulo="Sin cupones" texto="Crea el primero con el formulario." />
          ) : (
            <Tabla>
              <thead><tr><Th>Código</Th><Th>Descuento</Th><Th>Mínimo</Th><Th>Usos</Th><Th>Vence</Th><Th>Estado</Th><Th></Th></tr></thead>
              <tbody>
                {cupones.map((c) => {
                  const vencido = !!c.vence_el && c.vence_el < hoy;
                  const agotado = c.usos_max !== null && c.usos >= c.usos_max;
                  return (
                    <tr key={c.id} className={editarId === c.id ? "bg-primary-soft/40" : "hover:bg-sand/40"}>
                      <Td className="font-mono font-semibold">{c.codigo}</Td>
                      <Td>{c.tipo === "porcentaje" ? `${c.valor}%` : formatearCLP(c.valor)}</Td>
                      <Td className="text-muted">{c.minimo ? formatearCLP(c.minimo) : "—"}</Td>
                      <Td className="text-muted">{c.usos}{c.usos_max !== null ? ` / ${c.usos_max}` : ""}</Td>
                      <Td className="text-muted">{c.vence_el ? formatearFecha(c.vence_el) : "—"}</Td>
                      <Td>
                        {vencido ? <span className="chip bg-gray-100 text-gray-600">Vencido</span> : agotado ? <span className="chip bg-gray-100 text-gray-600">Agotado</span> : <ChipBooleano valor={c.activo} />}
                      </Td>
                      <Td className="text-right">
                        <Link href={`/admin/cupones?editar=${c.id}`} className="mr-3 text-sm font-medium text-primary hover:underline">Editar</Link>
                        <BotonEliminar accion={eliminarCupon.bind(null, c.id)} confirmacion={`¿Eliminar el cupón ${c.codigo}?`} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Tabla>
          )}
        </div>

        <aside className="tarjeta h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editando ? `Editar ${editando.codigo}` : "Nuevo cupón"}</h2>
            {editando && <Link href="/admin/cupones" className="text-xs text-muted hover:text-primary">Cancelar</Link>}
          </div>
          <FormularioAccion key={editando?.id ?? "nuevo"} accion={guardarCupon} className="mt-4 grid gap-3">
            {editando && <input type="hidden" name="id" value={editando.id} />}
            <div><label className="etiqueta">Código *</label><input name="codigo" required className="campo font-mono uppercase" defaultValue={editando?.codigo ?? ""} placeholder="BIENVENIDA10" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="etiqueta">Tipo</label>
                <select name="tipo" className="campo" defaultValue={editando?.tipo ?? "porcentaje"}>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Monto fijo ($)</option>
                </select>
              </div>
              <div><label className="etiqueta">Valor *</label><input name="valor" type="number" min={1} required className="campo" defaultValue={editando?.valor ?? ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="etiqueta">Compra mínima $</label><input name="minimo" type="number" min={0} className="campo" defaultValue={editando?.minimo ?? 0} /></div>
              <div><label className="etiqueta">Usos máximos</label><input name="usos_max" type="number" min={1} className="campo" defaultValue={editando?.usos_max ?? ""} placeholder="Sin límite" /></div>
            </div>
            <div><label className="etiqueta">Vence el</label><input name="vence_el" type="date" className="campo" defaultValue={editando?.vence_el ?? ""} /></div>
            <Interruptor nombre="activo" etiqueta="Activo" valor={editando?.activo ?? true} />
          </FormularioAccion>
        </aside>
      </div>
    </>
  );
}
