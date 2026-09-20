"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoPedido, guardarNotasPedido } from "@/lib/acciones/admin";
import { ESTADOS_PEDIDO, type EstadoPedido, type MetodoPago } from "@/lib/tipos";

interface Props {
  pedidoId: string;
  estado: EstadoPedido;
  notas: string;
  metodoPago: MetodoPago;
}

/** Flujo típico para los botones rápidos: qué viene después de cada estado. */
const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; etiqueta: string }>> = {
  pendiente_pago: { estado: "pagado", etiqueta: "Marcar como pagado" },
  pagado: { estado: "en_preparacion", etiqueta: "Comenzar preparación" },
  en_preparacion: { estado: "enviado", etiqueta: "Marcar como enviado" },
  enviado: { estado: "entregado", etiqueta: "Marcar como entregado" },
};

export default function GestionPedido({ pedidoId, estado, notas, metodoPago }: Props) {
  const [seleccion, setSeleccion] = useState<EstadoPedido>(estado);
  const [textoNotas, setTextoNotas] = useState(notas);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const aplicar = (nuevo: EstadoPedido) => {
    if (nuevo === "cancelado" && !confirm("¿Cancelar el pedido? Se repondrá el stock reservado.")) return;
    iniciar(async () => {
      const r = await cambiarEstadoPedido(pedidoId, nuevo);
      setMensaje(r.mensaje);
      if (r.ok) setSeleccion(nuevo);
    });
  };

  const siguiente = SIGUIENTE[estado];

  return (
    <section className="tarjeta">
      <h2 className="font-semibold">Gestión</h2>

      {siguiente && (
        <button type="button" className="btn-primario mt-3 w-full" disabled={pendiente} onClick={() => aplicar(siguiente.estado)}>
          {siguiente.etiqueta}
        </button>
      )}
      {estado === "pendiente_pago" && metodoPago === "transferencia" && (
        <p className="mt-2 text-xs text-muted">Confirma el pago cuando veas la transferencia en la cuenta.</p>
      )}

      <div className="mt-4">
        <label className="etiqueta" htmlFor="estado">Cambiar estado</label>
        <div className="flex gap-2">
          <select id="estado" className="campo" value={seleccion} onChange={(e) => setSeleccion(e.target.value as EstadoPedido)}>
            {(Object.keys(ESTADOS_PEDIDO) as EstadoPedido[]).map((e) => (
              <option key={e} value={e}>{ESTADOS_PEDIDO[e].etiqueta}</option>
            ))}
          </select>
          <button type="button" className="btn-secundario shrink-0" disabled={pendiente || seleccion === estado} onClick={() => aplicar(seleccion)}>
            Aplicar
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="etiqueta" htmlFor="notas">Notas internas</label>
        <textarea id="notas" rows={3} className="campo" value={textoNotas} onChange={(e) => setTextoNotas(e.target.value)} placeholder="N° de seguimiento, acuerdos con el cliente…" />
        <button
          type="button"
          className="btn-secundario mt-2"
          disabled={pendiente || textoNotas === notas}
          onClick={() => iniciar(async () => setMensaje((await guardarNotasPedido(pedidoId, textoNotas)).mensaje))}
        >
          Guardar notas
        </button>
      </div>

      {estado !== "cancelado" && estado !== "reembolsado" && (
        <button type="button" className="mt-4 text-xs text-danger hover:underline" disabled={pendiente} onClick={() => aplicar("cancelado")}>
          Cancelar pedido
        </button>
      )}
      {mensaje && <p className="mt-3 text-xs text-muted">{mensaje}</p>}
    </section>
  );
}
