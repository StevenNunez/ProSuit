import Link from "next/link";
import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { ChipEstado, EncabezadoPagina, Kpi, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import GraficoVentas from "@/components/admin/GraficoVentas";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP, formatearFecha, nombreVariante, numeroPedido } from "@/lib/formato";
import type { Pedido } from "@/lib/tipos";

const ESTADOS_VENTA = ["pagado", "en_preparacion", "enviado", "entregado"];

export default async function Escritorio() {
  const supabase = await crearClienteServidor();
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
  const hace30 = new Date(ahora.getTime() - 30 * 86400000);
  hace30.setHours(0, 0, 0, 0);

  const [
    { data: ventasMes },
    { data: ventas30 },
    { count: pendientesPago },
    { count: porPreparar },
    { count: productosActivos },
    { count: clientes },
    { data: ultimos },
    { data: stockBajo },
  ] = await Promise.all([
    supabase.from("pedidos").select("total").in("estado", ESTADOS_VENTA).gte("creado_el", inicioMes),
    supabase.from("pedidos").select("total, creado_el").in("estado", ESTADOS_VENTA).gte("creado_el", hace30.toISOString()),
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("estado", "pendiente_pago"),
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("estado", "pagado"),
    supabase.from("productos").select("id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("perfiles").select("id", { count: "exact", head: true }).eq("rol", "cliente"),
    supabase.from("pedidos").select("*").order("creado_el", { ascending: false }).limit(8).returns<Pedido[]>(),
    supabase
      .from("variantes")
      .select("id, talla, color, stock, producto:productos(nombre, slug)")
      .lte("stock", 3)
      .eq("activa", true)
      .order("stock")
      .limit(8),
  ]);

  const totalMes = (ventasMes ?? []).reduce((a, p) => a + p.total, 0);

  // Serie diaria de los últimos 30 días para el gráfico.
  const serie: { fecha: string; total: number; pedidos: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(ahora.getTime() - i * 86400000);
    serie.push({ fecha: d.toISOString().slice(0, 10), total: 0, pedidos: 0 });
  }
  for (const p of ventas30 ?? []) {
    const clave = new Date(p.creado_el).toISOString().slice(0, 10);
    const punto = serie.find((s) => s.fecha === clave);
    if (punto) {
      punto.total += p.total;
      punto.pedidos += 1;
    }
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Escritorio"
        descripcion={`Resumen de la tienda · ${ahora.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}`}
        acciones={
          <>
            <Link href="/admin/productos/nuevo" className="btn-primario">Agregar producto</Link>
            <Link href="/admin/pedidos" className="btn-secundario">Ver pedidos</Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi etiqueta="Ventas del mes" valor={formatearCLP(totalMes)} detalle={`${ventasMes?.length ?? 0} pedidos pagados`} icono={<DollarSign className="size-5" />} />
        <Kpi etiqueta="Por preparar" valor={String(porPreparar ?? 0)} detalle={`${pendientesPago ?? 0} esperando pago`} icono={<ShoppingCart className="size-5" />} />
        <Kpi etiqueta="Productos activos" valor={String(productosActivos ?? 0)} detalle={`${stockBajo?.length ?? 0} variantes con stock bajo`} icono={<Package className="size-5" />} />
        <Kpi etiqueta="Clientes" valor={String(clientes ?? 0)} detalle="Cuentas registradas" icono={<Users className="size-5" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="tarjeta">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ventas últimos 30 días</h2>
            <Link href="/admin/informes" className="text-xs font-medium text-primary hover:underline">Ver informes</Link>
          </div>
          <div className="mt-4">
            <GraficoVentas serie={serie} />
          </div>
        </section>

        <section className="tarjeta">
          <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-warning" /> Stock bajo</h2>
          {!stockBajo || stockBajo.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Todo con stock suficiente.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {stockBajo.map((v) => {
                const producto = Array.isArray(v.producto) ? v.producto[0] : v.producto;
                return (
                  <li key={v.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{producto?.nombre}</p>
                      <p className="text-xs text-muted">{nombreVariante(v)}</p>
                    </div>
                    <span className={`chip ${v.stock === 0 ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-800"}`}>{v.stock} u.</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-xs font-medium text-primary hover:underline">Ver todos</Link>
        </div>
        {!ultimos || ultimos.length === 0 ? (
          <Vacio titulo="Aún no hay pedidos" texto="Cuando alguien compre en la tienda aparecerá aquí." />
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th><Th>Cliente</Th><Th>Fecha</Th><Th>Pago</Th><Th>Estado</Th><Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map((p) => (
                <tr key={p.id} className="hover:bg-sand/40">
                  <Td><Link href={`/admin/pedidos/${p.id}`} className="font-semibold text-primary hover:underline">{numeroPedido(p.numero)}</Link></Td>
                  <Td><p className="font-medium">{p.nombre}</p><p className="text-xs text-muted">{p.email}</p></Td>
                  <Td className="text-muted">{formatearFecha(p.creado_el)}</Td>
                  <Td className="text-muted">{p.metodo_pago === "mercadopago" ? "Mercado Pago" : "Transferencia"}</Td>
                  <Td><ChipEstado estado={p.estado} /></Td>
                  <Td className="text-right font-semibold">{formatearCLP(p.total)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </section>
    </>
  );
}
