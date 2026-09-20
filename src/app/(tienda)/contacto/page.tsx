import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { IconoInstagram } from "@/components/ui/IconosRedes";
import Portada from "@/components/tienda/Portada";
import ReservaWhatsApp from "@/components/tienda/ReservaWhatsApp";
import { FormularioContacto } from "@/components/tienda/FormularioContacto";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { sitio } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Contacto · Taller de uniformes en La Serena",
  description: "Cotiza uniformes clínicos, escolares o corporativos. Taller en Tihue 1813, La Serena. WhatsApp +56 9 3742 5428. Reserva tu visita para ver telas y muestras.",
  alternates: { canonical: "/contacto" },
};

export default async function PaginaContacto() {
  const { tienda } = await obtenerAjustes();

  return (
    <>
      <Portada
        subtitulo="Contacto"
        titulo="Especialistas en la confección de prendas de vestir"
        descripcion="Aquí encontrarás todos nuestros canales de contacto para que puedas comunicarte con nosotros de forma rápida y directa."
        migas={[{ href: "/contacto", etiqueta: "Contacto" }]}
      />

      <section className="contenedor grid gap-10 py-16 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Dirección</p><p className="text-muted">{tienda.direccion}</p></div>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Teléfono / WhatsApp</p><a href={`https://wa.me/${tienda.whatsapp}`} className="text-muted hover:text-primary">{tienda.telefono}</a></div>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Correo</p><a href={`mailto:${tienda.email}`} className="text-muted hover:text-primary">{tienda.email}</a></div>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Horario</p><p className="text-muted">{tienda.horario}</p></div>
            </li>
            <li className="flex gap-3">
              <IconoInstagram className="mt-0.5 size-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Instagram</p><a href={tienda.instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">@prosuit.chile</a></div>
            </li>
          </ul>
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={sitio.mapaEmbed}
              title="Ubicación de ProSuit en La Serena"
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="tarjeta">
            <h2 className="font-display text-xl font-semibold">Reserva tu visita</h2>
            <p className="mt-1 text-sm text-muted">Ven al taller a ver telas y muestras. Te confirmamos por WhatsApp.</p>
            <div className="mt-5"><ReservaWhatsApp numero={tienda.whatsapp} /></div>
          </div>
          <div className="tarjeta">
            <h2 className="font-display text-xl font-semibold">Escríbenos</h2>
            <p className="mt-1 text-sm text-muted">Cotizaciones, consultas o pedidos especiales.</p>
            <div className="mt-5"><FormularioContacto /></div>
          </div>
        </div>
      </section>
    </>
  );
}
