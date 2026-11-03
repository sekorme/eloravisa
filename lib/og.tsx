import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared renderer for Open Graph / Twitter card images (1200x630).
 * Used by app/opengraph-image.tsx (site default) and the per-page images
 * such as app/visa-requirements/[slug]/opengraph-image.tsx.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const C = {
  bg: "#08201A",
  bgDeep: "#05130F",
  green: "#5DBF95",
  greenDark: "#1E7A58",
  gold: "#D4AF37",
  white: "#FFFFFF",
  muted: "#A9C9BC",
};

async function loadAssets() {
  const dir = join(process.cwd(), "assets/og");
  const [medium, extraBold, logo] = await Promise.all([
    readFile(join(dir, "Manrope-Medium.ttf")),
    readFile(join(dir, "Manrope-ExtraBold.ttf")),
    readFile(join(process.cwd(), "public/eloravisa.PNG")),
  ]);
  return {
    fonts: [
      { name: "Manrope", data: medium, weight: 500 as const, style: "normal" as const },
      { name: "Manrope", data: extraBold, weight: 800 as const, style: "normal" as const },
    ],
    logoSrc: `data:image/png;base64,${logo.toString("base64")}`,
  };
}

export interface OgCardProps {
  /** Small uppercase line above the headline. */
  eyebrow: string;
  /** Main headline (white). */
  title: string;
  /** Second headline line (brand green). */
  accent?: string;
  /** One-line supporting text. */
  subtitle?: string;
  /** Up to three short facts shown as pills. */
  chips?: string[];
  /** Footer URL text, without protocol. */
  url?: string;
}

/** Shrink long headlines so they stay on two lines at most. */
function titleSize(text: string) {
  if (text.length <= 14) return 92;
  if (text.length <= 22) return 76;
  if (text.length <= 32) return 62;
  return 52;
}

export async function renderOgCard({
  eyebrow,
  title,
  accent,
  subtitle,
  chips = [],
  url = "eloravisa.com",
}: OgCardProps) {
  const { fonts, logoSrc } = await loadAssets();
  const size = titleSize(accent && accent.length > title.length ? accent : title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          fontFamily: "Manrope",
          color: C.white,
          backgroundColor: C.bg,
          backgroundImage: `radial-gradient(circle at 92% 8%, ${C.greenDark} 0%, transparent 46%), radial-gradient(circle at 0% 100%, ${C.bgDeep} 0%, transparent 60%)`,
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 76,
              height: 76,
              borderRadius: 20,
              backgroundColor: C.white,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={76} height={76} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>Elora Visa</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: C.muted }}>Your AI visa companion</div>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.gold,
              marginBottom: 18,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {accent ? (
            <div
              style={{
                display: "flex",
                fontSize: size,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                color: C.green,
              }}
            >
              {accent}
            </div>
          ) : null}
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: C.muted, marginTop: 22, lineHeight: 1.35 }}>
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Footer: chips + url */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {chips.slice(0, 3).map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 500,
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: `2px solid ${C.greenDark}`,
                  backgroundColor: "rgba(93, 191, 149, 0.12)",
                  color: C.white,
                }}
              >
                {chip}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: C.green }}>{url}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
