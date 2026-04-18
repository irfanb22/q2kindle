"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

// ── Types & Dummy Data (shared across mockups) ─────────────────────────────

type Feed = { id: string; name: string; url: string; color: string };
type Article = { id: string; feedId: string; title: string; snippet: string; imageUrl: string; sourceUrl: string };
type QueueState = "idle" | "animating" | "queued";

const FEEDS: Feed[] = [
  { id: "f1", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", color: "#ff4e00" },
  { id: "f2", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", color: "#5100ff" },
  { id: "f3", name: "Aeon", url: "https://aeon.co/feed.rss", color: "#1a6b5c" },
  { id: "f4", name: "Longreads", url: "https://longreads.com/feed/", color: "#c0392b" },
  { id: "f5", name: "Wired", url: "https://www.wired.com/feed/rss", color: "#000" },
  { id: "f6", name: "The Atlantic", url: "https://www.theatlantic.com/feed/all/", color: "#b22222" },
  { id: "f7", name: "Nautilus", url: "https://nautil.us/feed/", color: "#1e90ff" },
];

const ALL_ARTICLES: Article[] = [
  { id: "a1", feedId: "f1", title: "The Quiet Revolution in Battery Chemistry", snippet: "Solid-state batteries promise to double energy density while eliminating fire risk. Here's where the science actually stands.", imageUrl: "https://picsum.photos/seed/a1/600/400", sourceUrl: "https://arstechnica.com" },
  { id: "a2", feedId: "f2", title: "Apple's Next Big Bet Isn't a Product", snippet: "Sources say Apple is quietly building an AI agent framework that could reshape how we interact with every app.", imageUrl: "https://picsum.photos/seed/a5/600/400", sourceUrl: "https://theverge.com" },
  { id: "a3", feedId: "f3", title: "The Case Against Productivity Culture", snippet: "We've optimized every waking hour. But what if efficiency is making us worse at the things that matter?", imageUrl: "https://picsum.photos/seed/a10/600/400", sourceUrl: "https://aeon.co" },
  { id: "a4", feedId: "f4", title: "The Last Bookseller on the Mississippi", snippet: "In a river town that time forgot, one woman keeps a bookstore alive against all odds and all economic sense.", imageUrl: "https://picsum.photos/seed/a13/600/400", sourceUrl: "https://longreads.com" },
  { id: "a5", feedId: "f1", title: "Why Your ISP Wants to Kill Net Neutrality", snippet: "The latest push to roll back open internet rules has a new twist involving AI traffic.", imageUrl: "https://picsum.photos/seed/a2/600/400", sourceUrl: "https://arstechnica.com" },
  { id: "a6", feedId: "f2", title: "The Mechanical Keyboard Sustainability Problem", snippet: "Custom keycaps, rare switches, group buys that never ship — the hobby is booming, but at what cost?", imageUrl: "https://picsum.photos/seed/a6/600/400", sourceUrl: "https://theverge.com" },
  { id: "a7", feedId: "f3", title: "What Ancient Rome Teaches About Uncertainty", snippet: "The Stoics had a word for thriving in chaos. Modern psychology is catching up to their insights.", imageUrl: "https://picsum.photos/seed/a9/600/400", sourceUrl: "https://aeon.co" },
  { id: "a8", feedId: "f4", title: "A Year Without a Smartphone", snippet: "It started as an experiment. Then the withdrawal kicked in. Then something unexpected happened.", imageUrl: "https://picsum.photos/seed/a14/600/400", sourceUrl: "https://longreads.com" },
  { id: "a9", feedId: "f5", title: "The Architects of the AI Safety Movement", snippet: "Inside the small community of researchers trying to prevent an AI catastrophe before it happens.", imageUrl: "https://picsum.photos/seed/a17/600/400", sourceUrl: "https://wired.com" },
  { id: "a10", feedId: "f6", title: "America's Quiet Literacy Crisis", snippet: "One in five adults can't read a bus schedule. The consequences touch everything from healthcare to democracy.", imageUrl: "https://picsum.photos/seed/a18/600/400", sourceUrl: "https://theatlantic.com" },
  { id: "a11", feedId: "f1", title: "Inside the Mass Extinction of Browser Extensions", snippet: "Manifest V3 is reshaping what extensions can do. For some developers, it's the end of the road.", imageUrl: "https://picsum.photos/seed/a3/600/400", sourceUrl: "https://arstechnica.com" },
  { id: "a12", feedId: "f2", title: "How TikTok Rewired the Music Industry", snippet: "From bedroom producers to Billboard charts — the platform changed how hits are made and who makes them.", imageUrl: "https://picsum.photos/seed/a7/600/400", sourceUrl: "https://theverge.com" },
  { id: "a13", feedId: "f3", title: "Why We Dream of Houses We've Never Lived In", snippet: "Neuroscience is beginning to understand why our sleeping minds construct familiar architectures.", imageUrl: "https://picsum.photos/seed/a11/600/400", sourceUrl: "https://aeon.co" },
  { id: "a14", feedId: "f4", title: "The World's Most Prolific Art Forger", snippet: "He fooled galleries and auction houses for decades. Then he confessed — and nobody believed him.", imageUrl: "https://picsum.photos/seed/a15/600/400", sourceUrl: "https://longreads.com" },
  { id: "a15", feedId: "f7", title: "The Ocean's Memory of Ancient Climates", snippet: "Deep-sea sediment cores are revealing a climate record that challenges what we thought we knew.", imageUrl: "https://picsum.photos/seed/a19/600/400", sourceUrl: "https://nautil.us" },
  { id: "a16", feedId: "f5", title: "The Teenagers Building Their Own Social Network", snippet: "Fed up with algorithmic feeds, a group of high schoolers built something radically different.", imageUrl: "https://picsum.photos/seed/a20/600/400", sourceUrl: "https://wired.com" },
  { id: "a17", feedId: "f1", title: "The Strange Afterlife of Decommissioned Satellites", snippet: "A growing industry is figuring out what to do with thousands of dead satellites orbiting Earth.", imageUrl: "https://picsum.photos/seed/a4/600/400", sourceUrl: "https://arstechnica.com" },
  { id: "a18", feedId: "f2", title: "The Rise of 'Doom Spending'", snippet: "Gen Z is spending money they don't have on things they don't need, and economists are paying attention.", imageUrl: "https://picsum.photos/seed/a8/600/400", sourceUrl: "https://theverge.com" },
  { id: "a19", feedId: "f3", title: "The Philosophy of Walking in Circles", snippet: "Without landmarks, humans walk in loops. What does this say about how we navigate meaning?", imageUrl: "https://picsum.photos/seed/a12/600/400", sourceUrl: "https://aeon.co" },
  { id: "a20", feedId: "f4", title: "Running Toward the Edge of the Earth", snippet: "An ultramarathoner crosses the Sahara. A meditation on endurance, solitude, and what it means to keep going.", imageUrl: "https://picsum.photos/seed/a16/600/400", sourceUrl: "https://longreads.com" },
  { id: "a21", feedId: "f6", title: "The Hidden Costs of Free Returns", snippet: "Online shopping's most beloved perk is creating an environmental nightmare nobody talks about.", imageUrl: "https://picsum.photos/seed/a21/600/400", sourceUrl: "https://theatlantic.com" },
  { id: "a22", feedId: "f7", title: "Why Time Feels Different When You're Bored", snippet: "The neuroscience of temporal perception reveals surprising truths about attention and memory.", imageUrl: "https://picsum.photos/seed/a22/600/400", sourceUrl: "https://nautil.us" },
  { id: "a23", feedId: "f5", title: "The Race to Build a Quantum Internet", snippet: "It won't replace the internet we have. It will enable something we can barely imagine.", imageUrl: "https://picsum.photos/seed/a23/600/400", sourceUrl: "https://wired.com" },
  { id: "a24", feedId: "f1", title: "How to Build a Mass Spectrometer in Your Garage", snippet: "One hobbyist's journey from curiosity to citizen science, with surprising results along the way.", imageUrl: "https://picsum.photos/seed/a24/600/400", sourceUrl: "https://arstechnica.com" },
  { id: "a25", feedId: "f6", title: "The Disappearing Art of Doing Nothing", snippet: "Boredom was once a feature, not a bug. What we've lost in the age of infinite content.", imageUrl: "https://picsum.photos/seed/a25/600/400", sourceUrl: "https://theatlantic.com" },
  { id: "a26", feedId: "f3", title: "What Trees Know That We Don't", snippet: "Forest ecologists are discovering that trees communicate, trade, and even wage war underground.", imageUrl: "https://picsum.photos/seed/a26/600/400", sourceUrl: "https://aeon.co" },
  { id: "a27", feedId: "f2", title: "The Dark Side of Password Managers", snippet: "They're more secure than the alternative, but a new class of attacks is exploiting our trust in them.", imageUrl: "https://picsum.photos/seed/a27/600/400", sourceUrl: "https://theverge.com" },
  { id: "a28", feedId: "f4", title: "Letters From the Last Video Store", snippet: "A small-town rental shop survives by becoming a community center, therapy office, and time capsule.", imageUrl: "https://picsum.photos/seed/a28/600/400", sourceUrl: "https://longreads.com" },
  { id: "a29", feedId: "f7", title: "The Mathematics of Origami", snippet: "Folding paper is secretly one of the most powerful tools in engineering and space exploration.", imageUrl: "https://picsum.photos/seed/a29/600/400", sourceUrl: "https://nautil.us" },
  { id: "a30", feedId: "f5", title: "Inside the Lab Growing Human Organs", snippet: "Bio-printed kidneys are no longer science fiction. The first transplant trials begin next year.", imageUrl: "https://picsum.photos/seed/a30/600/400", sourceUrl: "https://wired.com" },
  { id: "a31", feedId: "f6", title: "Why We Can't Stop Watching Strangers Cook", snippet: "Food content is the internet's universal language. A cultural critic investigates why.", imageUrl: "https://picsum.photos/seed/a31/600/400", sourceUrl: "https://theatlantic.com" },
  { id: "a32", feedId: "f1", title: "The CPU Architecture That Time Forgot", snippet: "RISC-V is staging a quiet comeback, and the chip industry is paying attention.", imageUrl: "https://picsum.photos/seed/a32/600/400", sourceUrl: "https://arstechnica.com" },
];

function getFeedName(id: string) { return FEEDS.find((f) => f.id === id)?.name ?? "Unknown"; }
function getFeedColor(id: string) { return FEEDS.find((f) => f.id === id)?.color ?? "#888"; }

// ── Mockup H: The Flipbook ─────────────────────────────────────────────────
// One article at a time, filling the viewport.
// Like flipping through a stack of magazines at a bookstore.

export default function FlipbookPage() {
  const [index, setIndex] = useState(0);
  const [queueStates, setQueueStates] = useState<Record<string, QueueState>>({});
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const [showAllFeeds, setShowAllFeeds] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [transitioning, setTransitioning] = useState(false);

  const filtered = activeFeed ? ALL_ARTICLES.filter((a) => a.feedId === activeFeed) : ALL_ARTICLES;
  const article = filtered[index];
  const total = filtered.length;

  const VISIBLE_FEED_COUNT = 4;
  const visibleFeeds = showAllFeeds ? FEEDS : FEEDS.slice(0, VISIBLE_FEED_COUNT);
  const hasMoreFeeds = FEEDS.length > VISIBLE_FEED_COUNT;

  const toggleQueue = useCallback((id: string) => {
    setQueueStates((prev) => {
      const current = prev[id] ?? "idle";
      if (current === "queued") return { ...prev, [id]: "idle" };
      if (current === "animating") return prev;
      setTimeout(() => {
        setQueueStates((p) => ({ ...p, [id]: "queued" }));
      }, 800);
      return { ...prev, [id]: "animating" };
    });
  }, []);

  const go = useCallback((dir: "next" | "prev") => {
    if (transitioning) return;
    const next = dir === "next" ? Math.min(total - 1, index + 1) : Math.max(0, index - 1);
    if (next === index) return;
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      setIndex(next);
      setTransitioning(false);
    }, 250);
  }, [index, total, transitioning]);

  // Reset index when filter changes
  useEffect(() => { setIndex(0); }, [activeFeed]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go("next"); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go("prev"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  const qs = article ? (queueStates[article.id] ?? "idle") : "idle";

  return (
    <div style={{ animation: "fadeUp 0.6s ease both" }} className="relative min-h-[80vh]">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
          Newsstand
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSourcesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Add Source
          </button>
          <button
            onClick={() => setShowManageModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{ border: "1px solid var(--color-border)", color: "var(--color-text-dim)" }}
          >
            Manage
          </button>
        </div>
      </div>

      {/* ── Feed filter chips ── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setActiveFeed(null)}
          className="px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer"
          style={{
            background: !activeFeed ? "var(--color-text)" : "transparent",
            color: !activeFeed ? "var(--color-bg)" : "var(--color-text-dim)",
            border: `1px solid ${!activeFeed ? "var(--color-text)" : "var(--color-border)"}`,
          }}
        >
          All
        </button>
        {visibleFeeds.map((feed) => (
          <button
            key={feed.id}
            onClick={() => setActiveFeed(activeFeed === feed.id ? null : feed.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer"
            style={{
              background: activeFeed === feed.id ? "var(--color-text)" : "transparent",
              color: activeFeed === feed.id ? "var(--color-bg)" : "var(--color-text-dim)",
              border: `1px solid ${activeFeed === feed.id ? "var(--color-text)" : "var(--color-border)"}`,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: feed.color, flexShrink: 0 }} />
            {feed.name}
          </button>
        ))}
        {hasMoreFeeds && !showAllFeeds && (
          <button
            onClick={() => setShowAllFeeds(true)}
            className="px-3 py-1 rounded-full text-sm font-medium transition-all cursor-pointer"
            style={{ color: "var(--color-text-dim)", border: "1px solid var(--color-border)" }}
          >
            +{FEEDS.length - VISIBLE_FEED_COUNT} more
          </button>
        )}
      </div>

      {/* ── Main content: single article ── */}
      {article && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning
              ? `translateX(${direction === "next" ? "-20px" : "20px"})`
              : "translateX(0)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {/* Left: Large image */}
          <div className="relative">
            <div
              className="w-full rounded-xl overflow-hidden"
              style={{ aspectRatio: "3/2" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover transition-all duration-700"
                style={{ filter: "grayscale(1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = "grayscale(0)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = "grayscale(1)"; }}
              />
            </div>
          </div>

          {/* Right: Article details */}
          <div className="flex flex-col gap-5 py-2">
            {/* Source */}
            <div className="flex items-center gap-2">
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: getFeedColor(article.feedId), flexShrink: 0 }} />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--color-text-dim)" }}>
                {getFeedName(article.feedId)}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}
            >
              {article.title}
            </h2>

            {/* Snippet — full, not truncated */}
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-text-dim)" }}>
              {article.snippet}
            </p>

            {/* Read original link */}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: "var(--color-accent)" }}
            >
              Read original
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>

            {/* Queue button — large and prominent */}
            <button
              onClick={() => toggleQueue(article.id)}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer w-full sm:w-auto"
              style={{
                background: qs === "queued"
                  ? "var(--color-accent)"
                  : qs === "animating"
                  ? "var(--color-accent)"
                  : "var(--color-surface)",
                color: qs === "idle" ? "var(--color-text)" : "#fff",
                border: qs === "idle" ? "1px solid var(--color-border)" : "1px solid var(--color-accent)",
                transform: qs === "animating" ? "scale(1.03)" : "scale(1)",
              }}
            >
              {qs === "idle" && (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Add to Queue
                </>
              )}
              {qs === "animating" && (
                <span style={{ animation: "cardFadeIn 0.3s ease both" }}>Queued!</span>
              )}
              {qs === "queued" && (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "cardFadeIn 0.3s ease both" }}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  In Queue
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Side arrows (desktop) ── */}
      {total > 1 && (
        <>
          <button
            onClick={() => go("prev")}
            disabled={index === 0}
            className="hidden lg:flex fixed top-1/2 left-4 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="var(--color-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            onClick={() => go("next")}
            disabled={index >= total - 1}
            className="hidden lg:flex fixed top-1/2 right-4 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-default"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="var(--color-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>
      )}

      {/* ── Bottom navigation (mobile + counter) ── */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10 lg:mt-12">
          <button
            onClick={() => go("prev")}
            disabled={index === 0}
            className="lg:hidden flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer disabled:opacity-30"
            style={{ color: "var(--color-text-dim)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Prev
          </button>
          <span className="text-sm tabular-nums" style={{ color: "var(--color-text-dim)", fontVariantNumeric: "tabular-nums" }}>
            {index + 1} of {total}
          </span>
          <button
            onClick={() => go("next")}
            disabled={index >= total - 1}
            className="lg:hidden flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer disabled:opacity-30"
            style={{ color: "var(--color-text-dim)" }}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}

      {/* ── Keyboard hint (desktop) ── */}
      <div className="hidden lg:flex items-center justify-center gap-3 mt-6">
        <span className="text-xs" style={{ color: "var(--color-text-dim)", opacity: 0.5 }}>
          Use ← → arrow keys to navigate
        </span>
      </div>

      {/* ── Add Source Modal ── */}
      {showSourcesModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSourcesModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", animation: "cardFadeIn 0.3s ease both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>Add a Source</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Paste an RSS feed URL…"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              />
              <p className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                Enter a blog or publication URL. We&apos;ll find the RSS feed automatically.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowSourcesModal(false)} className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{ color: "var(--color-text-dim)" }}>Cancel</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ background: "var(--color-accent)", color: "#fff" }}>Add Source</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Manage Sources Modal ── */}
      {showManageModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowManageModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", animation: "cardFadeIn 0.3s ease both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>Manage Sources</h2>
            <div className="space-y-2">
              {FEEDS.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--color-bg)" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: feed.color }} />
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{feed.name}</span>
                  </div>
                  <button className="text-xs cursor-pointer" style={{ color: "var(--color-text-dim)" }}>Remove</button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setShowManageModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ background: "var(--color-accent)", color: "#fff" }}>Done</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
