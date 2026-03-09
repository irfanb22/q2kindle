import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import React from "react";

// ── Font loading (cached) ──────────────────────────────────────────────────

const fontCache: Record<string, ArrayBuffer> = {};

async function loadGoogleFont(
  family: string,
  weight: number
): Promise<ArrayBuffer> {
  const key = `${family}-${weight}`;
  if (fontCache[key]) return fontCache[key];

  // Fetch the CSS from Google Fonts API — use a TTF-compatible user agent
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  // Use an older user-agent so Google Fonts returns TTF (not WOFF2)
  // Satori requires TTF/OTF format
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
    },
  });
  const css = await cssRes.text();

  // Extract the font file URL from the CSS
  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not find font URL for ${family} ${weight}`);
  }

  const fontRes = await fetch(match[1]);
  fontCache[key] = await fontRes.arrayBuffer();
  return fontCache[key];
}

// ── Cover image generation ─────────────────────────────────────────────────

export async function generateCoverImage(options: {
  issueNumber: number | null;
  date: string;
  articleCount: number;
  totalReadTime: number;
}): Promise<Buffer> {
  const { issueNumber, date, articleCount, totalReadTime } = options;

  const d = new Date(date);
  const year = d.getFullYear();
  const volume = year - 2025; // 2026 = Vol 1

  const formattedDate = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const volIssueLine = issueNumber
    ? `Volume ${volume} \u2022 Issue ${issueNumber}`
    : `Volume ${volume}`;

  const statsLine = `${articleCount} article${articleCount !== 1 ? "s" : ""} \u2022 ${totalReadTime} min read`;

  // Load fonts
  const [fontData, fontBoldData] = await Promise.all([
    loadGoogleFont("DM Sans", 400),
    loadGoogleFont("DM Sans", 700),
  ]);

  const WIDTH = 1600;
  const HEIGHT = 2400;
  const MARGIN = 120;

  // Bold typographic cover — black on white, e-ink optimized
  const element = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#F2F2F2",
        padding: `${MARGIN}px`,
      },
    },
    // Title — Q2KINDLE (dominant)
    React.createElement(
      "div",
      {
        style: {
          fontSize: "200px",
          fontWeight: 700,
          color: "#111111",
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          marginBottom: "80px",
        },
      },
      "Q2KINDLE"
    ),
    // Date
    React.createElement(
      "div",
      {
        style: {
          fontSize: "70px",
          fontWeight: 400,
          color: "#111111",
          marginBottom: "40px",
        },
      },
      formattedDate
    ),
    // Volume / Issue
    React.createElement(
      "div",
      {
        style: {
          fontSize: "55px",
          fontWeight: 400,
          color: "#111111",
          marginBottom: "40px",
        },
      },
      volIssueLine
    ),
    // Stats
    React.createElement(
      "div",
      {
        style: {
          fontSize: "48px",
          fontWeight: 400,
          color: "#111111",
        },
      },
      statsLine
    )
  );

  // Render to SVG with satori
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "DM Sans",
        data: fontData,
        weight: 400,
        style: "normal" as const,
      },
      {
        name: "DM Sans",
        data: fontBoldData,
        weight: 700,
        style: "normal" as const,
      },
    ],
  });

  // Convert SVG to PNG with resvg
  const resvg = new Resvg(svg, {
    font: { loadSystemFonts: false },
  });
  const rendered = resvg.render();
  return rendered.asPng();
}
