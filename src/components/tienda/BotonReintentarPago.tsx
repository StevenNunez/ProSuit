"use client";

import { useState, useTransition } from "react";
import { reintentarPago } from "@/lib/acciones/checkout";

export default function BotonReintentarPago({ pedidoId, token }: { pedidoId: string; token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <div className="mt-4">
      <button
        type="button"
        className="btn-primario"
        disabled={pendiente}
        onClick={() =>
          iniciar(async () => {
            const r = await reintentarPago(pedidoId, token);
            if (!r.ok) setError(r.error);
            else window.location.assign(r.url);
          })
        }
      >
        {pendiente ? "Conectando…" : "Pagar ahora con Mercado Pago"}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
