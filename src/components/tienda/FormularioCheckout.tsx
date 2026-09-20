"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Building2, CreditCard, Store, Truck } from "lucide-react";
import { useCarrito, subtotalCarrito, useCarritoHidratado } from "@/lib/carrito";
import { calcularResumen, crearPedido, type Resumen } from "@/lib/acciones/checkout";
import { formatearCLP } from "@/lib/formato";
import { regionesChile } from "@/lib/sitio";
import type { AjustesRetiro, AjustesTransferencia, MetodoEntrega, MetodoPago, ZonaEnvio } from "@/lib/tipos";

interface Props {
  zonas: ZonaEnvio[];
  transferencia: AjustesTransferencia;
  retiro: AjustesRetiro;
  mercadoPagoDisponible: boolean;
  usuario: { email: string; nombre: string; telefono: string } | null;
}

export default function FormularioCheckout({ zonas, transferencia, retiro, mercadoPagoDisponible, usuario }: Props) {
  const items = useCarrito((e) => e.items);
  const vaciar = useCarrito((e) => e.vaciar);
  const montado = useCarritoHidratado();

  const [email, setEmail] = useState(usuario?.email ?? "");
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [rut, setRut] = useState("");
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>("envio");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [depto, setDepto] = useState("");
  const [comuna, setComuna] = useState("");
  const [region, setRegion] = useState<string>("Región de Coquimbo");
  const [notas, setNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(mercadoPagoDisponible ? "mercadopago" : "transferencia");
  const [cuponTexto, setCuponTexto] = useState("");
  const [cupon, setCupon] = useState("");
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciarEnvio] = useTransition();
  const [calculando, iniciarCalculo] = useTransition();

  // Recalcula envío/cupón en el servidor cada vez que cambia algo relevante.
  useEffect(() => {
    if (!montado || items.length === 0) return;
    iniciarCalculo(async () => {
      const r = await calcularResumen(
        items.map((i) => ({ varianteId: i.varianteId, cantidad: i.cantidad, personalizacion: i.personalizacion })),
        metodoEntrega,
        metodoEntrega === "envio" ? region : undefined,
        cupon || undefined,
      );
      if ("ok" in r) {
        setErrorResumen(r.error);
        setResumen(null);
      } else {
        setErrorResumen(null);
        setResumen(r);
      }
    });
  }, [montado, items, metodoEntrega, region, cupon]);

  if (!montado) return <p className="text-muted">Cargando…</p>;

  if (items.length === 0) {
    return (
      <div className="tarjeta max-w-lg text-center">
        <p className="font-semibold">Tu carrito está vacío.</p>
        <Link href="/tienda" className="btn-primario mt-4">Ir a la tienda</Link>
      </div>
    );
  }

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    iniciarEnvio(async () => {
      const r = await crearPedido({
        items: items.map((i) => ({ varianteId: i.varianteId, cantidad: i.cantidad, personalizacion: i.personalizacion })),
        email,
        nombre,
        telefono,
        rut,
        metodoEntrega,
        direccion: metodoEntrega === "envio" ? { calle, numero, depto, comuna, region, notas } : {},
        metodoPago,
        cupon: cupon || undefined,
        notas,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      vaciar();
      window.location.assign(r.url);
    });
  };

  const zonaRegion = zonas.find((z) => z.regiones.includes(region));

  return (
    <form onSubmit={enviar} className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <section className="tarjeta">
          <h2 className="font-display text-lg font-semibold">1. Tus datos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="etiqueta" htmlFor="email">Correo electrónico *</label>
              <input id="email" type="email" required className="campo" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <p className="mt-1 text-xs text-muted">Te enviaremos la confirmación y el seguimiento a este correo.</p>
            </div>
            <div>
              <label className="etiqueta" htmlFor="nombre">Nombre y apellido *</label>
              <input id="nombre" required className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="telefono">Teléfono / WhatsApp *</label>
              <input id="telefono" required className="campo" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="rut">RUT (opcional, para boleta/factura)</label>
              <input id="rut" className="campo" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" />
            </div>
          </div>
        </section>

        <section className="tarjeta">
          <h2 className="font-display text-lg font-semibold">2. Entrega</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <OpcionRadio activo={metodoEntrega === "envio"} onClick={() => setMetodoEntrega("envio")} icono={<Truck className="size-5" />} titulo="Envío a domicilio" texto="A todo Chile. Se calcula según tu región." />
            {retiro.activo && (
              <OpcionRadio activo={metodoEntrega === "retiro"} onClick={() => setMetodoEntrega("retiro")} icono={<Store className="size-5" />} titulo="Retiro en tienda" texto={`Gratis · ${retiro.direccion}`} />
            )}
          </div>

          {metodoEntrega === "envio" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="etiqueta" htmlFor="region">Región *</label>
                <select id="region" className="campo" value={region} onChange={(e) => setRegion(e.target.value)}>
                  {regionesChile.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {zonaRegion && (
                  <p className="mt-1 text-xs text-muted">
                    {zonaRegion.nombre}: {formatearCLP(zonaRegion.costo)}
                    {zonaRegion.gratis_desde ? ` · gratis desde ${formatearCLP(zonaRegion.gratis_desde)}` : ""}
                    {zonaRegion.dias_estimados ? ` · ${zonaRegion.dias_estimados}` : ""}
                  </p>
                )}
              </div>
              <div>
                <label className="etiqueta" htmlFor="comuna">Comuna *</label>
                <input id="comuna" required className="campo" value={comuna} onChange={(e) => setComuna(e.target.value)} autoComplete="address-level2" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="calle">Calle *</label>
                <input id="calle" required className="campo" value={calle} onChange={(e) => setCalle(e.target.value)} autoComplete="address-line1" />
              </div>
              <div>
                <label className="etiqueta" htmlFor="numero">Número</label>
                <input id="numero" className="campo" value={numero} onChange={(e) => setNumero(e.target.value)} />
              </div>
              <div>
                <label className="etiqueta" htmlFor="depto">Depto / oficina / referencia</label>
                <input id="depto" className="campo" value={depto} onChange={(e) => setDepto(e.target.value)} />
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-sand/70 p-3 text-sm text-muted">
              Te avisaremos por WhatsApp cuando tu pedido esté listo para retirar. Horario: {retiro.horario}.
            </p>
          )}

          <div className="mt-4">
            <label className="etiqueta" htmlFor="notas">Notas para el pedido</label>
            <textarea id="notas" rows={2} className="campo" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Instrucciones de entrega, detalles de personalización…" />
          </div>
        </section>

        <section className="tarjeta">
          <h2 className="font-display text-lg font-semibold">3. Pago</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {mercadoPagoDisponible && (
              <OpcionRadio activo={metodoPago === "mercadopago"} onClick={() => setMetodoPago("mercadopago")} icono={<CreditCard className="size-5" />} titulo="Mercado Pago" texto="Tarjetas de crédito, débito y más. Pago inmediato." />
            )}
            {transferencia.activa && (
              <OpcionRadio activo={metodoPago === "transferencia"} onClick={() => setMetodoPago("transferencia")} icono={<Building2 className="size-5" />} titulo="Transferencia bancaria" texto="Te mostramos los datos al confirmar. Validamos en horario hábil." />
            )}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="tarjeta">
          <h2 className="font-display text-lg font-semibold">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-border">
            {items.map((i) => (
              <li key={i.clave} className="flex gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {i.imagen && <Image src={i.imagen} alt="" fill sizes="56px" className="object-cover" />}
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{i.cantidad}</span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{i.nombre}</p>
                  <p className="text-xs text-muted">{i.variante}{i.personalizacion ? ` · ${i.personalizacion}` : ""}</p>
                </div>
                <p className="text-sm font-semibold">{formatearCLP(i.precio * i.cantidad)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <input className="campo" placeholder="Cupón de descuento" value={cuponTexto} onChange={(e) => setCuponTexto(e.target.value.toUpperCase())} />
            <button type="button" className="btn-secundario shrink-0" onClick={() => setCupon(cuponTexto.trim())}>Aplicar</button>
          </div>
          {resumen?.avisoCupon && <p className="mt-1 text-xs text-danger">{resumen.avisoCupon}</p>}
          {resumen?.cupon && <p className="mt-1 text-xs text-success">Cupón {resumen.cupon} aplicado.</p>}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatearCLP(resumen?.subtotal ?? subtotalCarrito(items))}</dd></div>
            {resumen && resumen.descuento > 0 && (
              <div className="flex justify-between text-success"><dt>Descuento</dt><dd>−{formatearCLP(resumen.descuento)}</dd></div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Envío</dt>
              <dd>{calculando ? "…" : metodoEntrega === "retiro" ? "Gratis (retiro)" : resumen ? (resumen.envio === 0 ? "Gratis" : formatearCLP(resumen.envio)) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Total</dt><dd>{formatearCLP(resumen?.total ?? subtotalCarrito(items))}</dd>
            </div>
          </dl>

          {errorResumen && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-danger">{errorResumen}</p>}
          {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-danger">{error}</p>}

          <button type="submit" className="btn-primario mt-5 w-full py-3.5 text-base" disabled={enviando || calculando || !!errorResumen}>
            {enviando ? "Procesando…" : metodoPago === "mercadopago" ? "Pagar con Mercado Pago" : "Confirmar pedido"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Al confirmar aceptas nuestras condiciones de venta. Precios con IVA incluido.</p>
        </div>
      </aside>
    </form>
  );
}

function OpcionRadio({ activo, onClick, icono, titulo, texto }: { activo: boolean; onClick: () => void; icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${activo ? "border-primary bg-primary-soft/60 ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
    >
      <span className={`mt-0.5 ${activo ? "text-primary" : "text-muted"}`}>{icono}</span>
      <span>
        <span className="block font-semibold">{titulo}</span>
        <span className="block text-xs text-muted">{texto}</span>
      </span>
    </button>
  );
}
