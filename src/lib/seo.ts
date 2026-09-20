import { sitio } from "@/lib/sitio";

/** Palabras clave del rubro: se usan en metadata y en los textos base. */
export const palabrasClave = [
  "uniformes La Serena",
  "confección de uniformes",
  "uniformes clínicos",
  "ambos clínicos",
  "batas médicas",
  "uniformes de enfermería",
  "uniformes escolares",
  "uniformes corporativos",
  "ropa de trabajo",
  "bordado de logo",
  "uniformes a medida",
  "confección a pedido Coquimbo",
];

export const tituloPrincipal = "Uniformes clínicos, escolares y corporativos a medida en La Serena";

export const descripcionPrincipal =
  "ProSuit confecciona uniformes para médicos, enfermeras, colegios, empresas e industria en La Serena, Chile. Batas, ambos, delantales y ropa de trabajo a pedido, con tallas personalizadas y bordado de tu logo. Envío a todo Chile.";

/** JSON-LD del negocio: tienda de ropa local con dirección real. */
export function datosNegocio() {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "LocalBusiness"],
    "@id": `${sitio.url}/#negocio`,
    name: sitio.nombre,
    url: sitio.url,
    logo: `${sitio.url}/img/logo-1200.png`,
    image: `${sitio.url}/opengraph-image`,
    description: descripcionPrincipal,
    slogan: sitio.lema,
    telephone: sitio.telefono,
    email: sitio.email,
    priceRange: "$$",
    currenciesAccepted: "CLP",
    paymentAccepted: "Tarjeta de crédito, Tarjeta de débito, Transferencia bancaria, Mercado Pago",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Tihue 1813",
      addressLocality: "La Serena",
      addressRegion: "Región de Coquimbo",
      postalCode: "1722322",
      addressCountry: "CL",
    },
    geo: { "@type": "GeoCoordinates", latitude: -29.91889, longitude: -71.23200 },
    areaServed: { "@type": "Country", name: "Chile" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    sameAs: [sitio.instagram],
    makesOffer: [
      "Uniformes clínicos y batas médicas",
      "Ambos de enfermería",
      "Uniformes escolares",
      "Uniformes corporativos",
      "Ropa de trabajo industrial",
      "Bordado de logo",
    ].map((nombre) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: nombre } })),
  };
}

export function datosSitioWeb() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${sitio.url}/#sitio`,
    url: sitio.url,
    name: sitio.nombre,
    inLanguage: "es-CL",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${sitio.url}/tienda?q={termino}` },
      "query-input": "required name=termino",
    },
  };
}
