import { ImageResponse } from "next/og";
import { getDictionary, hasLocale } from "./dictionaries";

export const alt = "QuoteFlow — Smart quotes for service businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage(
  props: { params: Promise<{ lang: string }> },
) {
  const { lang } = await props.params;
  const locale = hasLocale(lang) ? lang : "en";
  const dict = await getDictionary(locale);

  const headline =
    locale === "es"
      ? "Cotizaciones inteligentes para empresas de servicios"
      : "Smart quotes for service businesses";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#060814",
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,140,255,0.35), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 5% 95%, rgba(167,139,250,0.15), transparent 60%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(135deg, rgba(124,140,255,0.18), rgba(34,211,238,0.12))",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="og-logo-grad"
                  x1="0"
                  y1="0"
                  x2="24"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#7c8cff" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path
                d="M5 5h10a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h11"
                stroke="url(#og-logo-grad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          QuoteFlow
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.04)",
              fontSize: "18px",
              color: "rgba(255,255,255,0.75)",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#22d3ee",
                boxShadow: "0 0 12px rgba(34,211,238,0.7)",
              }}
            />
            {dict.hero.badge}
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              background:
                "linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #a5f3fc 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.65)",
              maxWidth: "780px",
            }}
          >
            {dict.metadata.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 28px",
            borderRadius: "999px",
            background:
              "linear-gradient(135deg, #7c8cff 0%, #22d3ee 100%)",
            boxShadow: "0 12px 40px -10px rgba(124,140,255,0.55)",
            fontSize: "22px",
            fontWeight: 500,
            color: "#ffffff",
            width: "fit-content",
          }}
        >
          {dict.ctaFinal.primaryCta} →
        </div>
      </div>
    ),
    { ...size },
  );
}