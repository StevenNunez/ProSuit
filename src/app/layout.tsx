import type { Metadata } from "next";
import { Open_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { sitio } from "@/lib/sitio";
import { datosNegocio, datosSitioWeb, descripcionPrincipal, palabrasClave, tituloPrincipal } from "@/lib/seo";

// Mismas familias que el sitio original: Oswald en títulos, Open Sans en texto.
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(sitio.url),
  title: {
    default: `${sitio.nombre} · ${tituloPrincipal}`,
    template: `%s · ${sitio.nombre}`,
  },
  description: descripcionPrincipal,
  keywords: palabrasClave,
  applicationName: sitio.nombre,
  authors: [{ name: sitio.nombre, url: sitio.url }],
  creator: sitio.nombre,
  category: "shopping",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: sitio.url,
    siteName: sitio.nombre,
    title: `${sitio.nombre} · ${tituloPrincipal}`,
    description: descripcionPrincipal,
  },
  twitter: {
    card: "summary_large_image",
    title: `${sitio.nombre} · ${tituloPrincipal}`,
    description: descripcionPrincipal,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${openSans.variable} ${oswald.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([datosNegocio(), datosSitioWeb()]) }}
        />
      </body>
    </html>
  );
}
