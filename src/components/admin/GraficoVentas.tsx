"use client";

import { useState } from "react";
import { formatearCLP } from "@/lib/formato";

interface Punto {
  fecha: string;
  total: number;
  pedidos: number;
}

/** Gráfico de barras liviano en SVG (sin dependencias) para la serie diaria de ventas. */
export default function GraficoVentas({ serie }: { serie: Punto[] }) {
  const [activo, setActivo] = useState<number | null>(null);
  const maximo = Math.max(1, ...serie.map((p) => p.total));
  const ancho = 600;
  const alto = 180;
  const margenInf = 22;
  const paso = ancho / serie.length;
  const anchoBarra = Math.max(4, paso * 0.62);
  const total = serie.reduce((a, p) => a + p.total, 0);
  const pedidos = serie.reduce((a, p) => a + p.pedidos, 0);

  const etiquetaFecha = (f: string) => {
    const d = new Date(`${f}T12:00:00`);
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-6 text-sm">
        <div><p className="text-xs text-muted">Total del período</p><p className="font-display text-xl font-bold">{formatearCLP(total)}</p></div>
        <div><p className="text-xs text-muted">Pedidos pagados</p><p className="font-display text-xl font-bold">{pedidos}</p></div>
        <div><p className="text-xs text-muted">Ticket promedio</p><p className="font-display text-xl font-bold">{formatearCLP(pedidos ? Math.round(total / pedidos) : 0)}</p></div>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${ancho} ${alto}`} className="h-48 w-full" role="img" aria-label="Ventas diarias de los últimos 30 días">
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={0} x2={ancho} y1={(alto - margenInf) * (1 - f)} y2={(alto - margenInf) * (1 - f)} stroke="var(--border)" strokeDasharray="3 4" />
          ))}
          {serie.map((p, i) => {
            const h = ((alto - margenInf) * p.total) / maximo;
            const x = i * paso + (paso - anchoBarra) / 2;
            const y = alto - margenInf - h;
            const esActivo = activo === i;
            return (
              <g key={p.fecha} onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
                <rect x={i * paso} y={0} width={paso} height={alto - margenInf} fill="transparent" />
                <rect x={x} y={y} width={anchoBarra} height={Math.max(h, p.total > 0 ? 2 : 0)} rx={3} fill={esActivo ? "var(--accent)" : "var(--primary)"} opacity={p.total > 0 ? 1 : 0.15} />
                {(i % 5 === 0 || i === serie.length - 1) && (
                  <text x={i * paso + paso / 2} y={alto - 6} textAnchor="middle" fontSize={10} fill="var(--muted)">{etiquetaFecha(p.fecha)}</text>
                )}
              </g>
            );
          })}
        </svg>
        {activo !== null && (
          <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-lg bg-foreground px-3 py-1.5 text-xs text-white shadow">
            {etiquetaFecha(serie[activo].fecha)}: <strong>{formatearCLP(serie[activo].total)}</strong> · {serie[activo].pedidos} pedido{serie[activo].pedidos === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
}
