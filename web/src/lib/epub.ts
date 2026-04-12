import type { EpubPreferences } from "./types";
import { generateCoverImage } from "./cover-image";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const epubModule = require("epub-gen-memory");
const generateEpub = epubModule.default ?? epubModule;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function stripImages(html: string): string {
  return html
    .replace(/<picture[^>]*>[\s\S]*?<\/picture>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<img[^>]*>/gi, "");
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function buildCss(): string {
  return `body { line-height: 1.7; margin: 1em; color: #1a1a1a; }
h1 { font-size: 1.35em; margin: 0 0 0.3em; }
.meta { color: #666; font-size: 0.82em; margin-bottom: 1.8em; }
p { margin: 0 0 0.75em; text-indent: 0; }`;
}

export type EpubArticle = {
  title?: string | null;
  url: string;
  author?: string | null;
  content: string;
  read_time_minutes?: number | null;
  published_at?: string | null;
};

export async function generateKindleEpub(options: {
  articles: EpubArticle[];
  preferences: EpubPreferences;
  issueNumber: number | null;
}): Promise<{ buffer: Buffer; title: string; filename: string }> {
  const { articles, preferences, issueNumber } = options;
  const dateStr = new Date().toISOString().split("T")[0];

  // Calculate total read time for cover
  const totalReadTime = articles.reduce(
    (sum, a) => sum + (a.read_time_minutes || 0),
    0
  );

  // Build article chapters
  const articleChapters = articles.map((article, i) => {
    const titleText = article.title || extractDomain(article.url);
    const readTime = article.read_time_minutes
      ? `${article.read_time_minutes} min`
      : "";
    const tocTitle = [titleText, readTime].filter(Boolean).join(" · ");

    // Build metadata parts based on preferences
    const metaParts: string[] = [];
    if (preferences.showAuthor) {
      const authorDisplay = article.author || extractDomain(article.url);
      metaParts.push(authorDisplay);
    }
    if (preferences.showReadTime && readTime) {
      metaParts.push(`${readTime} read`);
    }
    if (preferences.showPublishedDate && article.published_at) {
      const formattedDate = formatDate(article.published_at);
      if (formattedDate) {
        metaParts.push(formattedDate);
      }
    }

    const metaLine =
      metaParts.length > 0
        ? `<p class="meta">${escapeHtml(metaParts.join(" · "))}</p>\n`
        : "";

    // Optionally strip images
    let articleContent = article.content;
    if (!preferences.includeImages) {
      articleContent = stripImages(articleContent);
    }

    return {
      title: tocTitle,
      content: `${metaLine}${articleContent}`,
      filename: `article_${i}.xhtml`,
    };
  });

  const title = `q2Kindle - ${dateStr}`;

  // Generate cover image for Kindle library thumbnail
  // Falls back to no cover if generation fails (e.g. Google Fonts down)
  let coverFile: File | undefined;
  try {
    const coverImageBuffer = await generateCoverImage({
      issueNumber,
      date: dateStr,
      articleCount: articles.length,
      totalReadTime,
    });
    coverFile = new File(
      [new Uint8Array(coverImageBuffer)],
      "cover.png",
      { type: "image/png" }
    );
  } catch (coverError) {
    console.error(
      "Cover image generation failed, proceeding without cover:",
      coverError instanceof Error ? coverError.message : coverError
    );
  }

  const rawResult = await generateEpub(
    {
      title,
      author: "q2Kindle",
      ...(coverFile ? { cover: coverFile } : {}),
      css: buildCss(),
      ignoreFailedDownloads: true,
      fetchTimeout: 10000,
      verbose: false,
    },
    articleChapters
  );

  let buffer: Buffer;
  if (Buffer.isBuffer(rawResult)) {
    buffer = rawResult;
  } else if (rawResult instanceof Uint8Array) {
    buffer = Buffer.from(rawResult);
  } else {
    throw new Error(
      `Unexpected epub result type: ${rawResult?.constructor?.name}`
    );
  }

  return {
    buffer,
    title,
    filename: `q2kindle-${dateStr}.epub`,
  };
}
