import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Categoria, ProductoConRelaciones, ZonaEnvio } from "@/lib/tipos";

const SELECT_PRODUCTO = "*, categoria:categorias(id,nombre,slug), variantes(*)";

export interface FiltrosCatalogo {
  categoria?: string; // slug
  q?: string;
  orden?: "recientes" | "precio_asc" | "precio_desc" | "nombre";
  destacados?: boolean;
  limite?: number;
}

export async function listarCategorias(): Promise<Categoria[]> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .eq("activa", true)
    .order("orden")
    .order("nombre");
  return data ?? [];
}

export async function listarProductos(filtros: FiltrosCatalogo = {}): Promise<ProductoConRelaciones[]> {
  const supabase = await crearClienteServidor();
  let consulta = supabase.from("productos").select(SELECT_PRODUCTO).eq("activo", true);

  if (filtros.categoria) {
    const { data: cat } = await supabase
      .from("categorias")
      .select("id")
      .eq("slug", filtros.categoria)
      .maybeSingle();
    if (!cat) return [];
    consulta = consulta.eq("categoria_id", cat.id);
  }
  if (filtros.q) {
    const termino = `%${filtros.q.trim()}%`;
    consulta = consulta.or(`nombre.ilike.${termino},descripcion_corta.ilike.${termino}`);
  }
  if (filtros.destacados) consulta = consulta.eq("destacado", true);

  switch (filtros.orden) {
    case "precio_asc":
      consulta = consulta.order("precio", { ascending: true });
      break;
    case "precio_desc":
      consulta = consulta.order("precio", { ascending: false });
      break;
    case "nombre":
      consulta = consulta.order("nombre");
      break;
    default:
      consulta = consulta.order("destacado", { ascending: false }).order("creado_el", { ascending: false });
  }
  if (filtros.limite) consulta = consulta.limit(filtros.limite);

  const { data } = await consulta;
  return ordenarVariantes((data ?? []) as ProductoConRelaciones[]);
}

export async function obtenerProductoPorSlug(slug: string): Promise<ProductoConRelaciones | null> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("productos")
    .select(SELECT_PRODUCTO)
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (!data) return null;
  return ordenarVariantes([data as ProductoConRelaciones])[0];
}

export async function productosRelacionados(producto: ProductoConRelaciones, cantidad = 4) {
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("productos")
    .select(SELECT_PRODUCTO)
    .eq("activo", true)
    .neq("id", producto.id)
    .limit(cantidad);
  if (producto.categoria_id) consulta = consulta.eq("categoria_id", producto.categoria_id);
  const { data } = await consulta;
  return ordenarVariantes((data ?? []) as ProductoConRelaciones[]);
}

export async function listarZonasEnvio(): Promise<ZonaEnvio[]> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("zonas_envio").select("*").eq("activa", true).order("orden");
  return data ?? [];
}

function ordenarVariantes(productos: ProductoConRelaciones[]) {
  for (const p of productos) {
    p.variantes = (p.variantes ?? [])
      .filter((v) => v.activa)
      .sort((a, b) => a.orden - b.orden || (a.talla ?? "").localeCompare(b.talla ?? ""));
  }
  return productos;
}

export function stockTotal(p: ProductoConRelaciones) {
  return (p.variantes ?? []).reduce((acc, v) => acc + v.stock, 0);
}
