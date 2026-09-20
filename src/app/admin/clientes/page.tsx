import { EncabezadoPagina, Tabla, Td, Th, Vacio } from "@/components/admin/ui";
import BotonRol from "@/components/admin/BotonRol";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerSesion } from "@/lib/supabase/sesion";
import { formatearCLP, formatearFecha } from "@/lib/formato";
import type { Perfil } from "@/lib/tipos";

export const metadata = { title: "Clientes" };

export default async function PaginaClientes({ searchParams }: PageProps<"/admin/clientes">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await crearClienteServidor();
  const { usuario } = await obtenerSesion();

  let consulta = supabase.from("perfiles").select("*").order("creado_el", { ascending: false });
  if (q) consulta = consulta.or(`nombre.ilike.%${q}%,email.ilike.%${q}%`);
  const [{ data: perfiles }, { data: pedidos }] = await Promise.all([
    consulta.returns<Perfil[]>(),
    supabase.from("pedidos").select("usuario_id, email, total, estado, creado_el"),
  ]);

  // Resumen de compras por cliente (por usuario o por correo para invitados).
  const resumen = new Map<string, { pedidos: number; total: number; ultimo: string }>();
  for (const p of pedidos ?? []) {
    const clave = p.usuario_id ?? `email:${p.email}`;
    const r = resumen.get(clave) ?? { pedidos: 0, total: 0, ultimo: p.creado_el };
    r.pedidos += 1;
    if (["pagado", "en_preparacion", "enviado", "entregado"].includes(p.estado)) r.total += p.total;
    if (p.creado_el > r.ultimo) r.ultimo = p.creado_el;
    resumen.set(clave, r);
  }
  const invitados = Array.from(resumen.entries())
    .filter(([k]) => k.startsWith("email:"))
    .map(([k, r]) => ({ email: k.slice(6), ...r }))
    .filter((i) => !q || i.email.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.ultimo.localeCompare(a.ultimo));

  return (
    <>
      <EncabezadoPagina titulo="Clientes" descripcion="Cuentas registradas y compradores invitados." />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o correo…" className="campo max-w-sm" />
        <button type="submit" className="btn-secundario">Buscar</button>
      </form>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Registrados ({perfiles?.length ?? 0})</h2>
      {!perfiles || perfiles.length === 0 ? (
        <Vacio titulo="Sin clientes registrados" />
      ) : (
        <Tabla>
          <thead><tr><Th>Cliente</Th><Th>Teléfono</Th><Th>Registro</Th><Th>Pedidos</Th><Th>Total comprado</Th><Th>Rol</Th></tr></thead>
          <tbody>
            {perfiles.map((p) => {
              const r = resumen.get(p.id);
              return (
                <tr key={p.id} className="hover:bg-sand/40">
                  <Td><p className="font-semibold">{p.nombre || "—"}</p><p className="text-xs text-muted">{p.email}</p></Td>
                  <Td className="text-muted">{p.telefono || "—"}</Td>
                  <Td className="text-muted">{formatearFecha(p.creado_el)}</Td>
                  <Td>{r?.pedidos ?? 0}</Td>
                  <Td className="font-semibold">{formatearCLP(r?.total ?? 0)}</Td>
                  <Td>
                    <span className={`chip ${p.rol === "admin" ? "bg-primary-soft text-primary" : "bg-gray-100 text-gray-700"}`}>{p.rol === "admin" ? "Administrador" : "Cliente"}</span>
                    {p.id !== usuario?.id && <BotonRol id={p.id} rol={p.rol} />}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Tabla>
      )}

      {invitados.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-muted">Compras como invitado ({invitados.length})</h2>
          <Tabla>
            <thead><tr><Th>Correo</Th><Th>Pedidos</Th><Th>Total comprado</Th><Th>Última compra</Th></tr></thead>
            <tbody>
              {invitados.map((i) => (
                <tr key={i.email} className="hover:bg-sand/40">
                  <Td className="font-medium">{i.email}</Td>
                  <Td>{i.pedidos}</Td>
                  <Td className="font-semibold">{formatearCLP(i.total)}</Td>
                  <Td className="text-muted">{formatearFecha(i.ultimo)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </>
      )}
    </>
  );
}
