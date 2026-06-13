import { ImageResponse } from "next/og";

/** Image de prévisualisation pour les partages (LinkedIn, X, etc.). */
export const alt = "Lexigarde, audit RGPD express de votre site web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8fafc",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marque */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e40af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l7 4v5c0 4.4-3 8-7 9-4-1-7-4.6-7-9V7l7-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span style={{ fontSize: "44px", fontWeight: 600, color: "#0f172a" }}>
            Lexigarde
          </span>
        </div>

        {/* Promesse */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 600,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Votre site est-il
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 600,
              color: "#1e40af",
              letterSpacing: "-0.02em",
            }}
          >
            conforme au RGPD ?
          </div>
          <div style={{ fontSize: "30px", color: "#475569", marginTop: "12px" }}>
            Un diagnostic clair en 30 secondes : score, constats juridiques, plan d&apos;action.
          </div>
        </div>

        {/* Pied : référentiels */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["RGPD", "CNIL", "ANSSI", "LCEN"].map((r) => (
            <div
              key={r}
              style={{
                fontSize: "24px",
                color: "#1e40af",
                background: "#eff6ff",
                padding: "8px 20px",
                borderRadius: "8px",
              }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
