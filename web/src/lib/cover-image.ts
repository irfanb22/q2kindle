import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import React from "react";

// ── Font loading (cached) ──────────────────────────────────────────────────

let fontDataCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;

  // DM Sans 400 from Google Fonts
  const res = await fetch(
    "https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwA.ttf"
  );
  fontDataCache = await res.arrayBuffer();
  return fontDataCache;
}

let fontBoldCache: ArrayBuffer | null = null;

async function loadFontBold(): Promise<ArrayBuffer> {
  if (fontBoldCache) return fontBoldCache;

  // DM Sans 700 from Google Fonts
  const res = await fetch(
    "https://fonts.gstatic.com/s/dmsans/v15/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAKp1t.ttf"
  );
  fontBoldCache = await res.arrayBuffer();
  return fontBoldCache;
}

// ── Season detection ───────────────────────────────────────────────────────

type Season = "spring" | "summer" | "fall" | "winter";

function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

// ── Placeholder seasonal illustrations (SVG data URIs) ─────────────────────
// These are simple geometric placeholders. Replace with custom artwork later.

const SEASON_ILLUSTRATIONS: Record<Season, string> = {
  spring: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900">
    <rect width="800" height="900" fill="#f5f5f0"/>
    <!-- Stem -->
    <line x1="400" y1="900" x2="400" y2="400" stroke="#2a2a2a" stroke-width="4"/>
    <!-- Leaves on stem -->
    <ellipse cx="380" cy="650" rx="40" ry="15" fill="none" stroke="#2a2a2a" stroke-width="2.5" transform="rotate(-30 380 650)"/>
    <ellipse cx="420" cy="550" rx="40" ry="15" fill="none" stroke="#2a2a2a" stroke-width="2.5" transform="rotate(30 420 550)"/>
    <!-- Flower petals -->
    <ellipse cx="400" cy="320" rx="30" ry="60" fill="none" stroke="#2a2a2a" stroke-width="2.5"/>
    <ellipse cx="400" cy="320" rx="30" ry="60" fill="none" stroke="#2a2a2a" stroke-width="2.5" transform="rotate(45 400 340)"/>
    <ellipse cx="400" cy="320" rx="30" ry="60" fill="none" stroke="#2a2a2a" stroke-width="2.5" transform="rotate(90 400 340)"/>
    <ellipse cx="400" cy="320" rx="30" ry="60" fill="none" stroke="#2a2a2a" stroke-width="2.5" transform="rotate(135 400 340)"/>
    <!-- Center -->
    <circle cx="400" cy="340" r="18" fill="#2a2a2a"/>
  </svg>`,

  summer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900">
    <rect width="800" height="900" fill="#f5f5f0"/>
    <!-- Sun -->
    <circle cx="400" cy="350" r="80" fill="none" stroke="#2a2a2a" stroke-width="3.5"/>
    <circle cx="400" cy="350" r="60" fill="#2a2a2a"/>
    <!-- Rays -->
    <line x1="400" y1="200" x2="400" y2="140" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="400" y1="500" x2="400" y2="560" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="250" y1="350" x2="190" y2="350" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="550" y1="350" x2="610" y2="350" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="294" y1="244" x2="252" y2="202" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="506" y1="456" x2="548" y2="498" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="506" y1="244" x2="548" y2="202" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <line x1="294" y1="456" x2="252" y2="498" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <!-- Ground plants -->
    <line x1="300" y1="750" x2="300" y2="650" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="500" y1="750" x2="500" y2="670" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="400" y1="750" x2="400" y2="630" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="300" cy="640" rx="20" ry="12" fill="none" stroke="#2a2a2a" stroke-width="2"/>
    <ellipse cx="500" cy="660" rx="20" ry="12" fill="none" stroke="#2a2a2a" stroke-width="2"/>
    <ellipse cx="400" cy="620" rx="25" ry="14" fill="none" stroke="#2a2a2a" stroke-width="2"/>
  </svg>`,

  fall: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900">
    <rect width="800" height="900" fill="#f5f5f0"/>
    <!-- Falling leaves -->
    <g transform="translate(250, 200) rotate(-20)">
      <path d="M0,0 Q20,-40 0,-80 Q-20,-40 0,0Z" fill="none" stroke="#2a2a2a" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="0" y2="-80" stroke="#2a2a2a" stroke-width="1.5"/>
    </g>
    <g transform="translate(500, 350) rotate(15)">
      <path d="M0,0 Q25,-50 0,-100 Q-25,-50 0,0Z" fill="#2a2a2a"/>
      <line x1="0" y1="0" x2="0" y2="-100" stroke="#f5f5f0" stroke-width="1.5"/>
    </g>
    <g transform="translate(350, 500) rotate(-35)">
      <path d="M0,0 Q20,-40 0,-80 Q-20,-40 0,0Z" fill="none" stroke="#2a2a2a" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="0" y2="-80" stroke="#2a2a2a" stroke-width="1.5"/>
    </g>
    <g transform="translate(550, 150) rotate(40)">
      <path d="M0,0 Q15,-30 0,-60 Q-15,-30 0,0Z" fill="#2a2a2a"/>
    </g>
    <g transform="translate(200, 450) rotate(-10)">
      <path d="M0,0 Q18,-35 0,-70 Q-18,-35 0,0Z" fill="#2a2a2a"/>
    </g>
    <!-- Bare branch -->
    <path d="M400,900 Q400,700 380,600 Q360,500 300,420" fill="none" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"/>
    <path d="M380,600 Q420,520 480,470" fill="none" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>
    <path d="M350,520 Q320,480 280,460" fill="none" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  winter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900">
    <rect width="800" height="900" fill="#f5f5f0"/>
    <!-- Bare tree -->
    <path d="M400,900 L400,350" stroke="#2a2a2a" stroke-width="5" stroke-linecap="round"/>
    <!-- Main branches -->
    <path d="M400,500 Q350,440 280,400" fill="none" stroke="#2a2a2a" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M400,500 Q450,440 520,400" fill="none" stroke="#2a2a2a" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M400,400 Q340,350 260,330" fill="none" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M400,400 Q460,350 540,330" fill="none" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Smaller branches -->
    <path d="M280,400 Q250,370 220,360" fill="none" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
    <path d="M520,400 Q550,370 580,360" fill="none" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
    <path d="M260,330 Q230,310 200,300" fill="none" stroke="#2a2a2a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M540,330 Q570,310 600,300" fill="none" stroke="#2a2a2a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M400,350 Q370,300 340,280" fill="none" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
    <path d="M400,350 Q430,300 460,280" fill="none" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/>
    <!-- Snowflakes -->
    <circle cx="200" cy="200" r="4" fill="#2a2a2a"/>
    <circle cx="600" cy="250" r="3" fill="#2a2a2a"/>
    <circle cx="350" cy="150" r="3.5" fill="#2a2a2a"/>
    <circle cx="500" cy="180" r="2.5" fill="#2a2a2a"/>
    <circle cx="150" cy="400" r="3" fill="#2a2a2a"/>
    <circle cx="650" cy="450" r="4" fill="#2a2a2a"/>
  </svg>`,
};

// ── Cover image generation ─────────────────────────────────────────────────

export async function generateCoverImage(options: {
  issueNumber: number | null;
  date: string;
  articleCount: number;
  totalReadTime: number;
}): Promise<Buffer> {
  const { issueNumber, date, articleCount, totalReadTime } = options;

  const d = new Date(date);
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  const volume = year - 2025; // 2026 = Vol 1

  const season = getSeason(month);

  const formattedDate = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Load the seasonal SVG as a data URI for the img element
  const svgContent = SEASON_ILLUSTRATIONS[season];
  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

  // Build volume/issue line
  const volIssueLine = issueNumber
    ? `Volume ${volume} \u2022 Issue ${issueNumber}`
    : `Volume ${volume}`;

  const statsLine = `${articleCount} article${articleCount !== 1 ? "s" : ""} \u2022 ~${totalReadTime} min read`;

  // Load fonts
  const [fontData, fontBoldData] = await Promise.all([
    loadFont(),
    loadFontBold(),
  ]);

  // Build the cover layout with React.createElement (server-side, no JSX)
  const element = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f0",
      },
    },
    // Top 70% — illustration
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "70%",
        },
      },
      React.createElement("img", {
        src: svgDataUri,
        width: 800,
        height: 900,
        style: {
          objectFit: "contain" as const,
          maxWidth: "80%",
          maxHeight: "90%",
        },
      })
    ),
    // Bottom 30% — metadata
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "30%",
          padding: "40px",
        },
      },
      // Brand
      React.createElement(
        "div",
        {
          style: {
            fontSize: "52px",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: "#2a2a2a",
            fontWeight: 700,
            marginBottom: "24px",
          },
        },
        "q2kindle"
      ),
      // Divider
      React.createElement("div", {
        style: {
          width: "120px",
          height: "2px",
          backgroundColor: "#999",
          marginBottom: "28px",
        },
      }),
      // Volume / Issue
      React.createElement(
        "div",
        {
          style: {
            fontSize: "38px",
            color: "#444",
            marginBottom: "12px",
          },
        },
        volIssueLine
      ),
      // Date
      React.createElement(
        "div",
        {
          style: {
            fontSize: "34px",
            color: "#666",
            marginBottom: "12px",
          },
        },
        formattedDate
      ),
      // Stats
      React.createElement(
        "div",
        {
          style: {
            fontSize: "30px",
            color: "#888",
          },
        },
        statsLine
      )
    )
  );

  // Render to SVG with satori
  const svg = await satori(element, {
    width: 1600,
    height: 2560,
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
