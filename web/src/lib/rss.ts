import Parser from "rss-parser";
import type { RssFeedItem } from "./types";

// ── RSS Parser (singleton) ──────────────────────────────────────────────────

type CustomItem = {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
};

const parser: Parser<Record<string, unknown>, CustomItem> = new Parser({
  timeout: 8000, // 8s — leaves headroom under Netlify's 10s limit
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
    ],
  },
});

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_ITEMS = 30;
const STALE_MINUTES = 30;
const SNIPPET_LENGTH = 200;

// ── Public functions ────────────────────────────────────────────────────────

/**
 * Fetch and parse an RSS feed URL.
 * Returns the feed metadata + up to 30 parsed items.
 */
export async function fetchAndParseFeed(
  url: string
): Promise<{ title: string; siteUrl: string | null; items: RssFeedItem[] }> {
  const feed = await parser.parseURL(url);

  const seen = new Set<string>();
  const items: RssFeedItem[] = [];

  for (const entry of feed.items ?? []) {
    if (items.length >= MAX_ITEMS) break;

    const link = entry.link ?? entry.guid;
    if (!link) continue;

    // Dedup by URL within the feed
    if (seen.has(link)) continue;
    seen.add(link);

    items.push({
      url: link,
      title: entry.title ?? "Untitled",
      snippet: extractSnippet(entry.contentSnippet ?? entry.content ?? entry.summary ?? ""),
      image: extractImage(entry),
      author: entry.creator ?? (entry as Record<string, unknown>).author as string ?? null,
      published_at: entry.isoDate ?? entry.pubDate ?? null,
    });
  }

  return {
    title: feed.title ?? new URL(url).hostname,
    siteUrl: feed.link ?? null,
    items,
  };
}

/**
 * Returns true if the feed's cache is stale (>30 min or never fetched).
 */
export function isStale(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return true;
  const age = Date.now() - new Date(lastFetchedAt).getTime();
  return age > STALE_MINUTES * 60 * 1000;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractSnippet(text: string): string {
  const plain = stripHtml(text);
  if (plain.length <= SNIPPET_LENGTH) return plain;
  // Cut at last space before limit to avoid mid-word truncation
  const cut = plain.lastIndexOf(" ", SNIPPET_LENGTH);
  return plain.slice(0, cut > 0 ? cut : SNIPPET_LENGTH) + "…";
}

function extractImage(entry: Parser.Item & CustomItem): string | null {
  // 1. Enclosure (if image type)
  const enc = entry.enclosure;
  if (enc?.url && enc.type?.startsWith("image/")) {
    return enc.url;
  }

  // 2. media:content
  const mc = entry.mediaContent;
  if (mc?.$?.url) return mc.$.url;

  // 3. media:thumbnail
  const mt = entry.mediaThumbnail;
  if (mt?.$?.url) return mt.$.url;

  return null;
}
