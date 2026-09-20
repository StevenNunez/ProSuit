"use client";

import { useState } from "react";
import { enlaceWhatsApp } from "@/lib/sitio";

const HORAS = ["15", "16", "17", "18", "19"];
const MINUTOS = ["00", "15", "30", "45"];

/** Réplica del formulario "Reserva tu cita" del sitio original: arma el mensaje y abre WhatsApp. */
export default function ReservaWhatsApp({ numero }: { numero: string }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("15");
  const [minuto, setMinuto] = useState("00");
  const [comentarios, setComentarios] = useState("");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaLegible = fecha ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }) : "por definir";
    const mensaje =
      `Hola ProSuit, quiero reservar una visita.\n` +
      `• Nombre: ${nombre}\n` +
      `• WhatsApp: +56 9 ${telefono}\n` +
      `• Fecha: ${fechaLegible}\n` +
      `• Hora: ${hora}:${minuto}\n` +
      (comentarios ? `• Comentarios: ${comentarios}` : "");
    window.open(enlaceWhatsApp(mensaje, numero), "_blank", "noopener,noreferrer");
  };

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={enviar} className="grid gap-4">
      <div>
        <label className="etiqueta" htmlFor="r-nombre">Nombre completo</label>
        <input id="r-nombre" required className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label className="etiqueta" htmlFor="r-telefono">Número de WhatsApp</label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-sand px-3 text-sm text-muted">+56 9</span>
          <input id="r-telefono" required inputMode="numeric" pattern="[0-9]{8}" maxLength={8} className="campo rounded-l-none" placeholder="12345678" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="r-fecha">Fecha</label>
          <input id="r-fecha" type="date" required min={hoy} className="campo" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <span className="etiqueta">Horario de visita (15:00 – 19:00)</span>
          <div className="flex items-center gap-2">
            <select aria-label="Hora" className="campo" value={hora} onChange={(e) => setHora(e.target.value)}>
              {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span>:</span>
            <select aria-label="Minutos" className="campo" value={minuto} onChange={(e) => setMinuto(e.target.value)}>
              {MINUTOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="r-comentarios">Comentarios</label>
        <textarea id="r-comentarios" rows={3} className="campo" value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Qué necesitas, cantidad aproximada…" />
      </div>
      <button type="submit" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]">Enviar reserva por WhatsApp</button>
    </form>
  );
}
