import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tituloPrincipal } from "@/lib/seo";

export const alt = "ProSuit · Uniformes clínicos, escolares y corporativos a medida en La Serena";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir en WhatsApp, Instagram, Facebook y Google: logo + propuesta de valor. */
export default async function ImagenOG() {
  const logo = await readFile(join(process.cwd(), "public/img/logo-1200.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f0ede4",
          color: "#161219",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 64px", width: 760 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#2c0453", fontWeight: 700 }}>
            La Serena · Chile
          </div>
          <div style={{ marginTop: 18, fontSize: 60, lineHeight: 1.08, fontWeight: 800 }}>{tituloPrincipal}</div>
          <div style={{ marginTop: 26, fontSize: 26, lineHeight: 1.4, color: "#3d3746" }}>
            Batas, ambos, delantales, uniformes escolares y ropa de trabajo. Tallas personalizadas y bordado de tu logo.
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 14 }}>
            {["Salud", "Colegios", "Empresas", "Industria"].map((t) => (
              <div key={t} style={{ background: "#2c0453", color: "white", borderRadius: 999, padding: "10px 22px", fontSize: 22, fontWeight: 700 }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, background: "white" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={360} height={360} />
        </div>
      </div>
    ),
    { ...size },
  );
}
