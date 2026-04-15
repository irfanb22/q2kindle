"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { RssFeed, RssFeedItem } from "@/lib/types";

// ── Suggested feeds for new users ──────────────────────────────────────────

const SUGGESTED_FEEDS = [
  { url: "https://feeds.arstechnica.com/arstechnica/index", name: "Ars Technica" },
  { url: "https://www.theverge.com/rss/index.xml", name: "The Verge" },
  { url: "https://aeon.co/feed.rss", name: "Aeon" },
  { url: "https://longreads.com/feed/", name: "Longreads" },
  { url: "https://www.wired.com/feed/rss", name: "Wired" },
  { url: "https://nautil.us/feed/", name: "Nautilus" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getFeedName(feedId: string, feeds: RssFeed[]) { return feeds.find((f) => f.id === feedId)?.title ?? "Unknown"; }
function getFeedColor(feedId: string, feeds: RssFeed[]) { return feeds.find((f) => f.id === feedId)?.color ?? "#888"; }

// Flatten feed items into a display-friendly shape
type DisplayArticle = {
  id: string;       // feedId + item url as unique key
  feedId: string;
  title: string;
  snippet: string;
  imageUrl: string | null;
  sourceUrl: string;
};

function flattenFeeds(feeds: RssFeed[]): DisplayArticle[] {
  const articles: DisplayArticle[] = [];
  for (const feed of feeds) {
    for (const item of feed.items) {
      articles.push({
        id: `${feed.id}::${item.url}`,
        feedId: feed.id,
        title: item.title,
        snippet: item.snippet,
        imageUrl: item.image,
        sourceUrl: item.url,
      });
    }
  }
  // Interleave: round-robin across feeds so the view isn't dominated by one source
  const byFeed: Record<string, DisplayArticle[]> = {};
  for (const a of articles) {
    (byFeed[a.feedId] ??= []).push(a);
  }
  const feedQueues = Object.values(byFeed);
  const interleaved: DisplayArticle[] = [];
  let idx = 0;
  while (interleaved.length < articles.length) {
    for (const q of feedQueues) {
      if (idx < q.length) interleaved.push(q[idx]);
    }
    idx++;
  }
  return interleaved;
}

// ── Mockup G: Classic Newsstand (Wired to Real API) ────────────────────────

const PER_PAGE = 12; // 4×3

export default function NewsstandPage() {
  // Data state
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [queued, setQueued] = useState<Record<string, boolean>>({});
  const [queuingInProgress, setQueuingInProgress] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(0);
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const [showAllFeeds, setShowAllFeeds] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);

  // Default to list view on mobile
  useEffect(() => {
    if (window.innerWidth < 640) setViewMode("list");
  }, []);

  // Fetch feeds on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/feeds");
        if (!res.ok) throw new Error("Failed to load feeds");
        const data = await res.json();
        setFeeds(data.feeds ?? []);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your feeds. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allArticles = flattenFeeds(feeds);
  const filtered = activeFeed ? allArticles.filter((a) => a.feedId === activeFeed) : allArticles;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageArticles = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const VISIBLE_FEED_COUNT = 4;
  const visibleFeeds = showAllFeeds ? feeds : feeds.slice(0, VISIBLE_FEED_COUNT);
  const hasMoreFeeds = feeds.length > VISIBLE_FEED_COUNT;

  const toggleQueue = useCallback(async (article: DisplayArticle) => {
    const wasQueued = queued[article.id];

    // If already queued, just toggle the UI state (un-queue is visual only — article stays in dashboard queue)
    if (wasQueued) {
      setQueued((prev) => ({ ...prev, [article.id]: false }));
      return;
    }

    // Add to queue via extract API
    setQueuingInProgress((prev) => ({ ...prev, [article.id]: true }));
    try {
      const res = await fetch("/api/articles/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.sourceUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // If article already exists in queue, still mark as queued
        if (data.error === "already_queued") {
          setQueued((prev) => {
            const next = { ...prev, [article.id]: true };
            const count = Object.values(next).filter(Boolean).length;
            window.dispatchEvent(new CustomEvent("q2k-queued", { detail: { count } }));
            return next;
          });
          return;
        }
        throw new Error(data.message || "Failed to add");
      }

      setQueued((prev) => {
        const next = { ...prev, [article.id]: true };
        const count = Object.values(next).filter(Boolean).length;
        window.dispatchEvent(new CustomEvent("q2k-queued", { detail: { count } }));
        return next;
      });
    } catch (err) {
      console.error("Failed to queue article:", err);
    } finally {
      setQueuingInProgress((prev) => ({ ...prev, [article.id]: false }));
    }
  }, [queued]);

  const goPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Split into rows of 4
  const rows: DisplayArticle[][] = [];
  for (let i = 0; i < pageArticles.length; i += 4) rows.push(pageArticles.slice(i, i + 4));

  // Loading state
  if (loading) {
    return (
      <div style={{ animation: "fadeUp 0.6s ease both" }} className="relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Newsstand
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-dim)", fontStyle: "italic" }}>
            Add what catches your eye
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-border-light)", background: "var(--color-surface)" }}>
              <div style={{ aspectRatio: "4/3", background: "var(--color-surface-inset)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded" style={{ background: "var(--color-surface-inset)", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div className="h-2 rounded" style={{ background: "var(--color-surface-inset)", width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ animation: "fadeUp 0.6s ease both" }} className="relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Newsstand
          </h1>
        </div>
        <div className="text-center py-16">
          <p className="text-sm mb-4" style={{ color: "var(--color-text-dim)" }}>{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state — no feeds subscribed yet
  if (feeds.length === 0) {
    return (
      <div style={{ animation: "fadeUp 0.6s ease both" }} className="relative">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Newsstand
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-dim)", fontStyle: "italic" }}>
            Add what catches your eye
          </p>
        </div>
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--color-accent-pale)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--color-accent)" strokeWidth="1.5" />
              <line x1="7" y1="8" x2="17" y2="8" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="12" x2="13" y2="12" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="16" x2="10" y2="16" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-lg mb-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}>No sources yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-dim)" }}>Subscribe to your first RSS feed to start browsing.</p>
          <button onClick={() => setShowSourcesModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}>
            Add a source
          </button>
        </div>
        {showSourcesModal && <SourcesModal feeds={feeds} onClose={() => setShowSourcesModal(false)} onFeedsChange={setFeeds} />}
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.6s ease both" }} className="relative">
      {/* ── Side arrows (desktop only) ── */}
      {totalPages > 1 && (
        <>
          <button
            onClick={() => goPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="hidden lg:flex fixed top-1/2 left-4 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="var(--color-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            onClick={() => goPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="hidden lg:flex fixed top-1/2 right-4 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="var(--color-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>
      )}

      {/* ── Header ── */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "-0.02em" }}>
          Newsstand
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-dim)", fontStyle: "italic" }}>
          Add what catches your eye
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => setShowSourcesModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors duration-150 cursor-pointer"
          style={{ color: "var(--color-accent)", borderColor: "var(--color-accent)", background: "var(--color-accent-pale)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Sources
        </button>

        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <button onClick={() => { setActiveFeed(null); setPage(0); }} className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{ background: !activeFeed ? "var(--color-accent)" : "var(--color-surface)", color: !activeFeed ? "var(--color-accent-text)" : "var(--color-text-muted)", border: !activeFeed ? "none" : "1px solid var(--color-border-light)" }}>
            All
          </button>
          {visibleFeeds.map((feed) => (
            <button key={feed.id} onClick={() => { setActiveFeed(feed.id === activeFeed ? null : feed.id); setPage(0); }}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{ background: activeFeed === feed.id ? "var(--color-accent)" : "var(--color-surface)", color: activeFeed === feed.id ? "var(--color-accent-text)" : "var(--color-text-muted)", border: activeFeed === feed.id ? "none" : "1px solid var(--color-border-light)" }}>
              {feed.title}
            </button>
          ))}
          {hasMoreFeeds && !showAllFeeds && (
            <button onClick={() => setShowAllFeeds(true)} className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
              style={{ color: "var(--color-text-dim)", background: "var(--color-surface-inset)" }}>
              +{feeds.length - VISIBLE_FEED_COUNT} more
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
          <button onClick={() => setViewMode("grid")} className="p-1.5 transition-colors duration-150 cursor-pointer"
            style={{ background: viewMode === "grid" ? "var(--color-accent-pale)" : "transparent", color: viewMode === "grid" ? "var(--color-accent)" : "var(--color-text-dim)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button onClick={() => setViewMode("list")} className="p-1.5 transition-colors duration-150 cursor-pointer"
            style={{ background: viewMode === "list" ? "var(--color-accent-pale)" : "transparent", color: viewMode === "list" ? "var(--color-accent)" : "var(--color-text-dim)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

      </div>

      {/* ── No articles yet (feeds exist but all empty) ── */}
      {allArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--color-text-dim)" }}>
            Your feeds are loading articles. Refresh in a moment.
          </p>
        </div>
      ) : (
        <>
          {/* ── Grid View ── */}
          {viewMode === "grid" ? (
            <div key={page}>
              {rows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 py-4" style={{ animation: `cardFadeIn 0.4s ease ${rowIndex * 0.08}s both` }}>
                    {row.map((article) => (
                      <GridCard key={article.id} article={article} feeds={feeds} isQueued={!!queued[article.id]} isQueuing={!!queuingInProgress[article.id]} onToggleQueue={() => toggleQueue(article)} showSource={!activeFeed} />
                    ))}
                  </div>
                  {rowIndex < rows.length - 1 && (
                    <div className="relative" style={{ height: "3px" }}>
                      <div className="absolute inset-x-0 top-0" style={{ height: "2px", background: "linear-gradient(to right, transparent, var(--color-border), var(--color-border), transparent)" }} />
                      <div className="absolute inset-x-0 top-[2px]" style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(0,0,0,0.04), rgba(0,0,0,0.04), transparent)" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* ── List View (River-style) ── */
            <div key={page}>
              {pageArticles.map((article, i) => (
                <ListRow key={article.id} article={article} feeds={feeds} index={i} isQueued={!!queued[article.id]} isQueuing={!!queuingInProgress[article.id]} onToggleQueue={() => toggleQueue(article)} showSource={!activeFeed} />
              ))}
            </div>
          )}

          {/* ── Bottom pagination (all screens) ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-10 mb-4">
              <button onClick={() => goPage(Math.max(0, page - 1))} disabled={page === 0}
                className="flex items-center gap-1.5 text-sm transition-colors duration-150 cursor-pointer disabled:opacity-25 disabled:cursor-default"
                style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--color-text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Previous stand
              </button>
              <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>{page + 1} / {totalPages}</span>
              <button onClick={() => goPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="flex items-center gap-1.5 text-sm transition-colors duration-150 cursor-pointer disabled:opacity-25 disabled:cursor-default"
                style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "var(--color-text-muted)" }}>
                Next stand
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
        </>
      )}

      {showSourcesModal && <SourcesModal feeds={feeds} onClose={() => setShowSourcesModal(false)} onFeedsChange={setFeeds} />}
    </div>
  );
}

// ── Grid Card ───────────────────────────────────────────────────────────────
// Hover: card pops up + image goes to color (entire card hover, not just image)

function GridCard({ article, feeds, isQueued, isQueuing, onToggleQueue, showSource }: { article: DisplayArticle; feeds: RssFeed[]; isQueued: boolean; isQueuing: boolean; onToggleQueue: () => void; showSource: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden border relative"
      style={{
        background: "var(--color-surface)",
        borderColor: hovered ? "var(--color-border)" : "var(--color-border-light)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl} alt=""
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              filter: hovered ? "grayscale(0)" : "grayscale(1) contrast(1.05)",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--color-surface-inset)" }}>
            <span className="text-2xl font-bold" style={{ color: getFeedColor(article.feedId, feeds), opacity: 0.3 }}>
              {getFeedName(article.feedId, feeds)[0]}
            </span>
          </div>
        )}
        {showSource && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.9)", color: getFeedColor(article.feedId, feeds), backdropFilter: "blur(4px)", letterSpacing: "0.08em" }}>
            {getFeedName(article.feedId, feeds)}
          </div>
        )}
        {/* Queue button */}
        <div className="absolute top-2.5 right-2.5">
          <QueueButton isQueued={isQueued} isQueuing={isQueuing} onToggle={onToggleQueue} />
        </div>
      </div>
      <div className="p-3">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] leading-snug block transition-colors duration-150"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            color: "var(--color-text)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {article.title}
        </a>
        <p className="text-[11px] mt-1.5" style={{ color: "var(--color-text-dim)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
          {article.snippet}
        </p>
      </div>
    </div>
  );
}

// ── List Row (River-style) ──────────────────────────────────────────────────
// Title is clickable link to source, + button for queuing

function ListRow({ article, feeds, index, isQueued, isQueuing, onToggleQueue, showSource }: { article: DisplayArticle; feeds: RssFeed[]; index: number; isQueued: boolean; isQueuing: boolean; onToggleQueue: () => void; showSource: boolean }) {
  return (
    <div
      className="flex gap-4 py-5 border-b"
      style={{ borderColor: "var(--color-border-light)", animation: `cardFadeIn 0.3s ease ${index * 0.03}s both` }}
    >
      <div className="flex-1 min-w-0">
        {showSource && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: getFeedColor(article.feedId, feeds) }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-dim)" }}>
              {getFeedName(article.feedId, feeds)}
            </span>
          </div>
        )}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg leading-snug block transition-colors duration-150 hover:underline"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--color-text)", textDecorationColor: "var(--color-border)" }}
        >
          {article.title}
        </a>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-dim)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.snippet}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-2">
        {article.imageUrl ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.imageUrl} alt="" className="w-full h-full object-cover" style={{ filter: "grayscale(0.8)" }} />
          </div>
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "var(--color-surface-inset)" }}>
            <span className="text-xl font-bold" style={{ color: getFeedColor(article.feedId, feeds), opacity: 0.3 }}>
              {getFeedName(article.feedId, feeds)[0]}
            </span>
          </div>
        )}
        <QueueButton isQueued={isQueued} isQueuing={isQueuing} onToggle={onToggleQueue} />
      </div>
    </div>
  );
}

// ── Queue Button (simple toggle: + ↔ checkmark, with loading spinner) ──────

function QueueButton({ isQueued, isQueuing, onToggle }: { isQueued: boolean; isQueuing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!isQueuing) onToggle(); }}
      disabled={isQueuing}
      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-wait"
      style={{
        background: isQueued ? "var(--color-accent)" : "rgba(255,255,255,0.85)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        backdropFilter: "blur(4px)",
      }}
    >
      {isQueuing ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <circle cx="12" cy="12" r="9" stroke="var(--color-text-dim)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 20" />
        </svg>
      ) : isQueued ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="6" x2="12" y2="18" stroke="var(--color-text-dim)" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="12" x2="18" y2="12" stroke="var(--color-text-dim)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

// ── Sources Modal ───────────────────────────────────────────────────────────

function SourcesModal({ feeds, onClose, onFeedsChange }: { feeds: RssFeed[]; onClose: () => void; onFeedsChange: (feeds: RssFeed[]) => void }) {
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleAdd() {
    if (!url.trim()) return;
    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddError(data.message || "Failed to add feed");
        return;
      }

      onFeedsChange([...feeds, data.feed]);
      setAddSuccess(true);
      setTimeout(() => { setAddSuccess(false); setUrl(""); }, 1200);
    } catch {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(feedId: string) {
    setRemoving(feedId);
    try {
      const res = await fetch("/api/feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: feedId }),
      });

      if (!res.ok) {
        console.error("Failed to remove feed");
        return;
      }

      onFeedsChange(feeds.filter((f) => f.id !== feedId));
      setConfirmingRemove(null);
    } catch (err) {
      console.error("Failed to remove feed:", err);
    } finally {
      setRemoving(null);
    }
  }

  async function handleAddSuggested(suggestedUrl: string) {
    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: suggestedUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddError(data.message || "Failed to add feed");
        return;
      }

      onFeedsChange([...feeds, data.feed]);
    } catch {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  // Suggested feeds that the user hasn't already subscribed to
  const unsubscribedSuggestions = SUGGESTED_FEEDS.filter(
    (s) => !feeds.some((f) => f.feed_url === s.url)
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto" style={{ background: "var(--color-surface)", animation: "modalSlideUp 0.3s ease both", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg cursor-pointer" style={{ color: "var(--color-text-dim)" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>

        {/* Add section */}
        <h2 className="text-xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}>Sources</h2>
        <p className="text-sm mb-5" style={{ color: "var(--color-text-dim)" }}>Add a new feed or manage your existing sources.</p>
        <div className="flex gap-2 mb-2">
          <input type="url" value={url} onChange={(e) => { setUrl(e.target.value); setAddError(null); }} placeholder="https://example.com/feed.xml"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none transition-all duration-150"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,95,45,0.12)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
          <button onClick={handleAdd} disabled={adding || !url.trim()} className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}>
            {adding ? "Adding…" : addSuccess ? "Added!" : "Add"}
          </button>
        </div>
        {addError && <p className="text-xs mb-4" style={{ color: "var(--color-danger)" }}>{addError}</p>}
        {!addError && <div className="mb-4" />}

        {/* Your sources */}
        {feeds.length > 0 && (
          <>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--color-text-dim)" }}>Your sources · {feeds.length}</p>
            <div className="space-y-2">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-150"
                  style={{
                    borderColor: confirmingRemove === feed.id ? "var(--color-danger-border)" : "var(--color-border-light)",
                    background: confirmingRemove === feed.id ? "var(--color-danger-pale)" : "var(--color-bg)",
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: feed.color }}>{feed.title[0]}</div>
                  {confirmingRemove === feed.id ? (
                    /* Inline "are you sure?" — replaces name/url */
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--color-danger)" }}>Remove {feed.title}?</p>
                      </div>
                      <button
                        onClick={() => handleRemove(feed.id)}
                        disabled={removing === feed.id}
                        className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50"
                        style={{ background: "var(--color-danger)", color: "#fff" }}
                      >
                        {removing === feed.id ? "…" : "Remove"}
                      </button>
                      <button
                        onClick={() => setConfirmingRemove(null)}
                        className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ color: "var(--color-text-dim)", border: "1px solid var(--color-border)" }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    /* Normal row */
                    <>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium">{feed.title}</p><p className="text-xs truncate" style={{ color: "var(--color-text-dim)" }}>{feed.feed_url}</p></div>
                      <button
                        onClick={() => setConfirmingRemove(feed.id)}
                        className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                        style={{ color: "var(--color-text-dim)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; e.currentTarget.style.background = "var(--color-danger-pale)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-dim)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Suggested feeds */}
        {unsubscribedSuggestions.length > 0 && (
          <>
            <p className="text-xs font-medium uppercase tracking-wider mb-3 mt-6" style={{ color: "var(--color-text-dim)" }}>Suggested feeds</p>
            <div className="space-y-2">
              {unsubscribedSuggestions.slice(0, 3).map((suggestion) => (
                <button key={suggestion.url} className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--color-border-light)", background: "var(--color-bg)" }}
                  disabled={adding}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.background = "var(--color-accent-pale)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-light)"; e.currentTarget.style.background = "var(--color-bg)"; }}
                  onClick={() => handleAddSuggested(suggestion.url)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#888" }}>{suggestion.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium">{suggestion.name}</p><p className="text-xs truncate" style={{ color: "var(--color-text-dim)" }}>{suggestion.url}</p></div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>, document.body,
  );
}
