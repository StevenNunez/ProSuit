import Link from "next/link";
import { ChipEstado, EncabezadoPagina, Paginacion, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { formatearCLP, formatearFechaHora, numeroPedido } from "@/lib/formato";
import { ESTADOS_PEDIDO, type EstadoPedido, type Pedido } from "@/lib/tipos";

export const metadata = { title: "Pedidos" };
const POR_PAGINA = 25;

export default async function PaginaPedidos({ searchParams }: PageProps<"/admin/pedidos">) {
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && sp.estado in ESTADOS_PEDIDO ? (sp.estado as EstadoPedido) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const pagina = Math.max(1, parseInt(typeof sp.pagina === "string" ? sp.pagina : "1", 10) || 1);

  const supabase = await crearClienteServidor();
  let consulta = supabase.from("pedidos").select("*", { count: "exact" }).order("creado_el", { ascending: false });
  if (estado) consulta = consulta.eq("estado", estado);
  if (q) {
    const numero = parseInt(q.replace(/\D/g, ""), 10);
    consulta = Number.isFinite(numero) && /^\D*\d+$/.test(q)
      ? consulta.eq("numero", numero)
      : consulta.or(`nombre.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const desde = (pagina - 1) * POR_PAGINA;
  const { data, count } = await consulta.range(desde, desde + POR_PAGINA - 1).returns<Pedido[]>();

  // Contadores por estado para las pestañas.
  const { data: todos } = await supabase.from("pedidos").select("estado");
  const conteo = (todos ?? []).reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.estado]: (acc[p.estado] ?? 0) + 1 }), {});

  const url = (cambios: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const final = { estado, q, pagina: 1, ...cambios };
    for (const [k, v] of Object.entries(final)) if (v !== undefined && v !== "" && !(k === "pagina" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `/admin/pedidos?${s}` : "/admin/pedidos";
  };

  return (
    <>
      <EncabezadoPagina titulo="Pedidos" descripcion="Gestiona los pedidos de la tienda: pagos, preparación y envíos." />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={url({ estado: undefined })} className={`chip px-3 py-1.5 ${!estado ? "bg-primary text-white" : "bg-white text-foreground ring-1 ring-border"}`}>
          Todos ({todos?.length ?? 0})
        </Link>
        {(Object.keys(ESTADOS_PEDIDO) as EstadoPedido[]).map((e) => (
          <Link key={e} href={url({ estado: e })} className={`chip px-3 py-1.5 ${estado === e ? "bg-primary text-white" : "bg-white text-foreground ring-1 ring-border"}`}>
            {ESTADOS_PEDIDO[e].etiqueta} ({conteo[e] ?? 0})
          </Link>
        ))}
      </div>

      <form className="mb-4 flex gap-2">
        {estado && <input type="hidden" name="estado" value={estado} />}
        <input name="q" defaultValue={q} placeholder="Buscar por número, nombre o correo…" className="campo max-w-sm" />
        <button type="submit" className="btn-secundario">Buscar</button>
        {q && <Link href={url({ q: undefined })} className="btn-fantasma">Limpiar</Link>}
      </form>

      {!data || data.length === 0 ? (
        <Vacio titulo="No hay pedidos con esos filtros" />
      ) : (
        <Tabla>
          <thead>
            <tr>
              <Th>Pedido</Th><Th>Cliente</Th><Th>Fecha</Th><Th>Entrega</Th><Th>Pago</Th><Th>Estado</Th><Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-sand/40">
                <Td><Link href={`/admin/pedidos/${p.id}`} className="font-semibold text-primary hover:underline">{numeroPedido(p.numero)}</Link></Td>
                <Td><p className="font-medium">{p.nombre}</p><p className="text-xs text-muted">{p.email}</p></Td>
                <Td className="text-muted">{formatearFechaHora(p.creado_el)}</Td>
                <Td className="text-muted">{p.metodo_entrega === "retiro" ? "Retiro" : p.zona_envio ?? "Envío"}</Td>
                <Td className="text-muted">{p.metodo_pago === "mercadopago" ? "Mercado Pago" : "Transferencia"}</Td>
                <Td><ChipEstado estado={p.estado} /></Td>
                <Td className="text-right font-semibold">{formatearCLP(p.total)}</Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
      )}
      <Paginacion pagina={pagina} total={count ?? 0} porPagina={POR_PAGINA} construirUrl={(p) => url({ pagina: p })} />
    </>
  );
}
