/**
 * Datos fijos del sitio. Lo que el cliente puede cambiar solo (teléfono,
 * dirección, datos bancarios) vive en la tabla `ajustes` y se edita desde
 * el panel; acá queda lo estructural.
 */
export const sitio = {
  nombre: "ProSuit",
  lema: "Diseño a la Vista. Calidad al Tacto.",
  descripcion:
    "Confección de uniformes corporativos, ropa laboral y prendas a medida en La Serena, Chile. Diseño personalizado, materiales premium y entrega puntual.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosuit.cl",
  whatsapp: "56937425428",
  telefono: "+56 9 3742 5428",
  email: "contacto@prosuit.cl",
  direccion: "Tihue 1813, La Serena, Región de Coquimbo, Chile",
  instagram: "https://www.instagram.com/prosuit.chile",
  mapaEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d883.6627866555542!2d-71.23200457149387!3d-29.91889183605111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691caf3cdfe3509%3A0xa0357fd1bca748c7!2sTihue%201813%2C%201722322%20La%20Serena%2C%20Coquimbo!5e1!3m2!1ses-419!2scl!4v1762294020937!5m2!1ses-419!2scl",
};

// Mismo orden que el menú del sitio original; lo que iba bajo el "+" queda en la secundaria.
export const navegacion = [
  { href: "/contacto", etiqueta: "Contacto" },
  { href: "/servicios", etiqueta: "Servicios" },
  { href: "/tienda", etiqueta: "Tienda" },
  { href: "/galeria", etiqueta: "Galería" },
  { href: "/equipo", etiqueta: "Equipo" },
  { href: "/recursos", etiqueta: "Recursos" },
] as const;

export const navegacionSecundaria = [
  { href: "/testimonios", etiqueta: "Testimonios" },
  { href: "/sobre", etiqueta: "Sobre" },
  { href: "/faq", etiqueta: "FAQ" },
] as const;

export const regionesChile = [
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región Metropolitana de Santiago",
  "Región del Libertador General Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Aysén",
  "Región de Magallanes y de la Antártica Chilena",
] as const;

export function enlaceWhatsApp(mensaje: string, numero = sitio.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
