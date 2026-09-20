import { crearClienteServidor } from "@/lib/supabase/servidor";
import { sitio } from "@/lib/sitio";
import type { AjustesRetiro, AjustesTienda, AjustesTransferencia } from "@/lib/tipos";

const PREDETERMINADOS = {
  tienda: {
    nombre: sitio.nombre,
    email: sitio.email,
    telefono: sitio.telefono,
    whatsapp: sitio.whatsapp,
    direccion: sitio.direccion,
    instagram: sitio.instagram,
    horario: "Lun a Vie 10:00 – 19:00",
  } satisfies AjustesTienda,
  transferencia: {
    activa: true,
    banco: "",
    tipo_cuenta: "",
    numero: "",
    rut: "",
    titular: sitio.nombre,
    email: sitio.email,
  } satisfies AjustesTransferencia,
  retiro: {
    activo: true,
    direccion: "Tihue 1813, La Serena",
    horario: "Lun a Vie 10:00 – 19:00",
  } satisfies AjustesRetiro,
};

export type ClaveAjuste = keyof typeof PREDETERMINADOS;

export async function obtenerAjustes() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("ajustes").select("clave, valor");
  const mapa = new Map((data ?? []).map((f) => [f.clave, f.valor]));
  return {
    tienda: { ...PREDETERMINADOS.tienda, ...(mapa.get("tienda") ?? {}) } as AjustesTienda,
    transferencia: {
      ...PREDETERMINADOS.transferencia,
      ...(mapa.get("transferencia") ?? {}),
    } as AjustesTransferencia,
    retiro: { ...PREDETERMINADOS.retiro, ...(mapa.get("retiro") ?? {}) } as AjustesRetiro,
  };
}
