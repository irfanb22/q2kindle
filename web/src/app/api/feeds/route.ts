import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndParseFeed, isStale } from "@/lib/rss";
import { validateUrl } from "@/lib/url-validation";
import type { RssFeed, RssFeedItem } from "@/lib/types";

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_FEEDS = 10;
const MAX_STALE_REFRESH = 3; // Cap per request to stay under Netlify 10s timeout

const FEED_COLORS = [
  "#ff4e00", "#5100ff", "#1a6b5c", "#c0392b", "#000000",
  "#b22222", "#1e90ff", "#e67e22", "#8e44ad", "#2ecc71",
];

// ── GET — list feeds with cached articles ───────────────────────────────────

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch all feeds for user
    const { data: rows, error } = await supabase
      .from("rss_feeds")
      .select("id, feed_url, title, site_url, color, items_cache, last_fetched_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "db_error", message: error.message }, { status: 500 });
    }

    const feeds = rows ?? [];

    // Identify stale feeds and refresh up to MAX_STALE_REFRESH
    const staleFeeds = feeds.filter((f) => isStale(f.last_fetched_at));
    const toRefresh = staleFeeds.slice(0, MAX_STALE_REFRESH);

    if (toRefresh.length > 0) {
      const results = await Promise.allSettled(
        toRefresh.map(async (feed) => {
          try {
            const parsed = await fetchAndParseFeed(feed.feed_url);

            // Update cache in DB
            await supabase
              .from("rss_feeds")
              .update({
                items_cache: parsed.items,
                last_fetched_at: new Date().toISOString(),
              })
              .eq("id", feed.id);

            // Update in-memory for response
            feed.items_cache = parsed.items;
            feed.last_fetched_at = new Date().toISOString();
          } catch (err) {
            // Feed fetch failed — keep stale cache, log it
            console.error(`Failed to refresh feed ${feed.feed_url}:`, err);
          }
        })
      );

      // Log any failures for debugging
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Feed refresh rejected for ${toRefresh[i].feed_url}:`, r.reason);
        }
      });
    }

    // Map DB rows to clean API response
    const response: RssFeed[] = feeds.map((f) => ({
      id: f.id,
      feed_url: f.feed_url,
      title: f.title,
      site_url: f.site_url,
      color: f.color,
      items: (f.items_cache ?? []) as RssFeedItem[],
      last_fetched_at: f.last_fetched_at,
      created_at: f.created_at,
    }));

    return NextResponse.json({ feeds: response });
  } catch (err) {
    console.error("GET /api/feeds error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to load feeds" }, { status: 500 });
  }
}

// ── POST — add a new feed ───────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse and validate input
    const body = await request.json();
    let { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "missing_url", message: "Feed URL is required" }, { status: 400 });
    }

    // Normalize URL
    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    url = url.replace(/\/+$/, ""); // strip trailing slashes

    // SSRF check
    const urlCheck = await validateUrl(url);
    if (!urlCheck.valid) {
      return NextResponse.json({ error: "invalid_url", message: urlCheck.error }, { status: 400 });
    }

    // Check feed count limit
    const { count, error: countError } = await supabase
      .from("rss_feeds")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return NextResponse.json({ error: "db_error", message: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_FEEDS) {
      return NextResponse.json(
        { error: "limit_reached", message: `You can subscribe to a maximum of ${MAX_FEEDS} feeds` },
        { status: 400 }
      );
    }

    // Fetch and parse the RSS feed to validate it and get metadata + items
    let parsed;
    try {
      parsed = await fetchAndParseFeed(url);
    } catch (err) {
      console.error("RSS parse error:", err);
      return NextResponse.json(
        { error: "invalid_feed", message: "This URL doesn't appear to be a valid RSS feed" },
        { status: 400 }
      );
    }

    // Auto-assign color
    const color = FEED_COLORS[(count ?? 0) % FEED_COLORS.length];

    // Insert
    const { data: feed, error: insertError } = await supabase
      .from("rss_feeds")
      .insert({
        user_id: user.id,
        feed_url: url,
        title: parsed.title,
        site_url: parsed.siteUrl,
        color,
        items_cache: parsed.items,
        last_fetched_at: new Date().toISOString(),
      })
      .select("id, feed_url, title, site_url, color, items_cache, last_fetched_at, created_at")
      .single();

    if (insertError) {
      // Postgres unique violation = already subscribed
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "already_subscribed", message: "You're already subscribed to this feed" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: "db_error", message: insertError.message }, { status: 500 });
    }

    const response: RssFeed = {
      id: feed.id,
      feed_url: feed.feed_url,
      title: feed.title,
      site_url: feed.site_url,
      color: feed.color,
      items: (feed.items_cache ?? []) as RssFeedItem[],
      last_fetched_at: feed.last_fetched_at,
      created_at: feed.created_at,
    };

    return NextResponse.json({ feed: response });
  } catch (err) {
    console.error("POST /api/feeds error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to add feed" }, { status: 500 });
  }
}

// ── DELETE — remove a feed ──────────────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "missing_id", message: "Feed ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("rss_feeds")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "db_error", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/feeds error:", err);
    return NextResponse.json({ error: "server_error", message: "Failed to remove feed" }, { status: 500 });
  }
}
