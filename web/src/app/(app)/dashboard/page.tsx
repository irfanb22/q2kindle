"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Article = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  status: string;
  created_at: string;
};

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchArticles = useCallback(async () => {
    const { data } = await supabase
      .from("articles")
      .select("id, url, title, author, status, created_at")
      .eq("status", "queued")
      .order("created_at", { ascending: false });

    if (data) setArticles(data);
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation
    try {
      new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);

    const normalizedUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

    // For now, add the URL directly to the queue.
    // Phase 2 will add server-side article extraction.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("articles")
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        title: extractDomain(normalizedUrl),
        status: "queued",
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setUrl("");
      fetchArticles();
    }
  }

  async function handleRemove(id: string) {
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  function extractDomain(urlStr: string): string {
    try {
      return new URL(urlStr).hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  const queueCount = articles.length;

  return (
    <div style={{ animation: 'fadeUp 0.6s ease both' }}>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-1"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed', letterSpacing: '-0.02em' }}>
          Reading Queue
        </h1>
        <p className="text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          {queueCount === 0
            ? "Add articles to send to your Kindle"
            : `${queueCount} article${queueCount !== 1 ? "s" : ""} queued`}
        </p>
      </div>

      {/* URL input */}
      <form onSubmit={handleAddUrl} className="mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="Paste an article URL…"
            className="flex-1 rounded-xl border px-4 py-3 text-base outline-none transition-all duration-200"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: '#141414',
              borderColor: '#262626',
              color: '#ededed',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#22c55e';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#262626';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: loading ? '#16a34a' : '#22c55e',
              color: '#0a0a0a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.3)',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#16a34a'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#22c55e'; }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Adding…
              </span>
            ) : (
              "Add"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
              <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" opacity="0.7"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-sm" style={{ color: '#ef4444', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </span>
          </div>
        )}
      </form>

      {/* Article queue */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#888888" strokeWidth="3"/>
            <path className="opacity-75" fill="#888888" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20" style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: 'rgba(136,136,136,0.08)', border: '1px solid rgba(136,136,136,0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#555555" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm mb-1" style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
            Your queue is empty
          </p>
          <p className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
            Paste an article URL above to get started
          </p>
        </div>
      ) : (
        <div>
          <div className="space-y-2" style={{ animation: 'fadeUp 0.6s ease 0.1s both' }}>
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-xl border px-5 py-4 transition-colors duration-150"
                style={{
                  borderColor: '#1a1a1a',
                  background: '#141414',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#141414'}
              >
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#ededed', fontWeight: 500 }}>
                    {article.title || extractDomain(article.url)}
                  </p>
                  <p className="text-xs truncate mt-0.5"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                    {article.url}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                    {timeAgo(article.created_at)}
                  </span>
                  <button
                    onClick={() => handleRemove(article.id)}
                    className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                    style={{ color: '#555555' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#555555';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Remove from queue"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Send button */}
          <div className="mt-8 flex justify-end" style={{ animation: 'fadeUp 0.6s ease 0.2s both' }}>
            <button
              className="rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: '#22c55e',
                color: '#0a0a0a',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.3)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#16a34a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#22c55e'}
              onClick={() => {
                // Phase 4: EPUB generation + email sending
                alert("Send to Kindle coming in Phase 4!");
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Send {queueCount} to Kindle
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
