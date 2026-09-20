import Link from "next/link";
import { EncabezadoPagina, Kpi, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import GraficoVentas from "@/components/admin/GraficoVentas";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP } from "@/lib/formato";

export const metadata = { title: "Informes" };
const ESTADOS_VENTA = ["pagado", "en_preparacion", "enviado", "entregado"];
const PERIODOS = [
  { dias: 7, etiqueta: "7 días" },
  { dias: 30, etiqueta: "30 días" },
  { dias: 90, etiqueta: "90 días" },
  { dias: 365, etiqueta: "12 meses" },
];

/** Inicio del período (00:00 de hace `dias - 1` días) y marca de "ahora". */
function rangoDias(dias: number) {
  const ahora = Date.now();
  const desde = new Date(ahora - (dias - 1) * 86400000);
  desde.setHours(0, 0, 0, 0);
  return { ahora, desde };
}

export default async function PaginaInformes({ searchParams }: PageProps<"/admin/informes">) {
  const sp = await searchParams;
  const dias = PERIODOS.some((p) => p.dias === Number(sp.dias)) ? Number(sp.dias) : 30;
  const { ahora, desde } = rangoDias(dias);

  const supabase = await crearClienteServidor();
  const [{ data: pedidos }, { data: items }] = await Promise.all([
    supabase.from("pedidos").select("id, total, envio, descuento, estado, metodo_pago, metodo_entrega, creado_el, cupon_codigo").gte("creado_el", desde.toISOString()),
    supabase
      .from("pedido_items")
      .select("producto_id, nombre, cantidad, precio_unitario, pedido:pedidos!inner(estado, creado_el)")
      .gte("pedido.creado_el", desde.toISOString()),
  ]);

  const pagados = (pedidos ?? []).filter((p) => ESTADOS_VENTA.includes(p.estado));
  const ingresos = pagados.reduce((a, p) => a + p.total, 0);
  const envios = pagados.reduce((a, p) => a + p.envio, 0);
  const descuentos = pagados.reduce((a, p) => a + p.descuento, 0);
  const cancelados = (pedidos ?? []).filter((p) => p.estado === "cancelado").length;
  const pendientes = (pedidos ?? []).filter((p) => p.estado === "pendiente_pago").length;

  // Serie diaria
  const serie: { fecha: string; total: number; pedidos: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    serie.push({ fecha: new Date(ahora - i * 86400000).toISOString().slice(0, 10), total: 0, pedidos: 0 });
  }
  for (const p of pagados) {
    const punto = serie.find((s) => s.fecha === new Date(p.creado_el).toISOString().slice(0, 10));
    if (punto) { punto.total += p.total; punto.pedidos += 1; }
  }

  // Productos más vendidos (solo pedidos pagados)
  const ranking = new Map<string, { nombre: string; unidades: number; ingresos: number; productoId: string | null }>();
  for (const i of items ?? []) {
    const pedido = Array.isArray(i.pedido) ? i.pedido[0] : i.pedido;
    if (!pedido || !ESTADOS_VENTA.includes(pedido.estado)) continue;
    const clave = i.producto_id ?? i.nombre;
    const r = ranking.get(clave) ?? { nombre: i.nombre, unidades: 0, ingresos: 0, productoId: i.producto_id };
    r.unidades += i.cantidad;
    r.ingresos += i.cantidad * i.precio_unitario;
    ranking.set(clave, r);
  }
  const masVendidos = Array.from(ranking.values()).sort((a, b) => b.unidades - a.unidades).slice(0, 10);

  const porPago = { mercadopago: pagados.filter((p) => p.metodo_pago === "mercadopago").length, transferencia: pagados.filter((p) => p.metodo_pago === "transferencia").length };
  const porEntrega = { envio: pagados.filter((p) => p.metodo_entrega === "envio").length, retiro: pagados.filter((p) => p.metodo_entrega === "retiro").length };

  return (
    <>
      <EncabezadoPagina
        titulo="Informes"
        descripcion="Ventas confirmadas (pagadas, en preparación, enviadas o entregadas)."
        acciones={
          <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
            {PERIODOS.map((p) => (
              <Link key={p.dias} href={`/admin/informes?dias=${p.dias}`} className={`rounded-md px-3 py-1.5 text-sm font-medium ${dias === p.dias ? "bg-primary text-white" : "hover:bg-sand"}`}>{p.etiqueta}</Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi etiqueta="Ingresos" valor={formatearCLP(ingresos)} detalle={`${pagados.length} pedidos`} />
        <Kpi etiqueta="Ticket promedio" valor={formatearCLP(pagados.length ? Math.round(ingresos / pagados.length) : 0)} />
        <Kpi etiqueta="Envíos cobrados" valor={formatearCLP(envios)} detalle={`Descuentos: ${formatearCLP(descuentos)}`} />
        <Kpi etiqueta="Sin concretar" valor={String(pendientes + cancelados)} detalle={`${pendientes} pendientes · ${cancelados} cancelados`} />
      </div>

      <section className="tarjeta mt-6">
        <h2 className="font-semibold">Ventas por día</h2>
        <div className="mt-4"><GraficoVentas serie={serie} /></div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 font-semibold">Productos más vendidos</h2>
          {masVendidos.length === 0 ? (
            <Vacio titulo="Sin ventas en el período" />
          ) : (
            <Tabla>
              <thead><tr><Th>#</Th><Th>Producto</Th><Th className="text-right">Unidades</Th><Th className="text-right">Ingresos</Th></tr></thead>
              <tbody>
                {masVendidos.map((p, i) => (
                  <tr key={p.nombre + i} className="hover:bg-sand/40">
                    <Td className="text-muted">{i + 1}</Td>
                    <Td>{p.productoId ? <Link href={`/admin/productos/${p.productoId}`} className="font-medium hover:text-primary">{p.nombre}</Link> : p.nombre}</Td>
                    <Td className="text-right">{p.unidades}</Td>
                    <Td className="text-right font-semibold">{formatearCLP(p.ingresos)}</Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
        </section>
        <div className="space-y-4">
          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Medio de pago</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-muted">Mercado Pago</dt><dd className="font-semibold">{porPago.mercadopago}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Transferencia</dt><dd className="font-semibold">{porPago.transferencia}</dd></div>
            </dl>
          </section>
          <section className="tarjeta text-sm">
            <h2 className="font-semibold">Entrega</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-muted">Envío a domicilio</dt><dd className="font-semibold">{porEntrega.envio}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Retiro en tienda</dt><dd className="font-semibold">{porEntrega.retiro}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
