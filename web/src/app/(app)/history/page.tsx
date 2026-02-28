"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SendHistory } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<SendHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function loadHistory() {
      const supabase = supabaseRef.current;
      const { data } = await supabase
        .from("send_history")
        .select("id, article_count, issue_number, status, error_message, sent_at, articles_data")
        .order("sent_at", { ascending: false })
        .limit(10);

      if (data) setHistory(data);
      setLoading(false);
    }

    loadHistory();
  }, []);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (diffHours < 168) {
      // within 7 days
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function extractDomain(urlStr: string): string {
    try {
      return new URL(urlStr).hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  }

  return (
    <div style={{ animation: "fadeUp 0.6s ease both" }}>
      <div className="mb-8">
        <h1
          className="text-3xl mb-1"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Send History
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
        >
          Your recent sends to Kindle
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              style={{ stroke: "var(--color-text-muted)" }}
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              style={{ fill: "var(--color-text-muted)" }}
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : history.length === 0 ? (
        <div
          className="text-center py-20"
          style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{
              background: "rgba(136,136,136,0.08)",
              border: "1px solid rgba(136,136,136,0.1)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                style={{ stroke: "var(--color-text-dim)" }}
                strokeWidth="1.5"
              />
              <path
                d="M12 7v5l3 3"
                style={{ stroke: "var(--color-text-dim)" }}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            className="text-sm mb-1"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
          >
            No sends yet
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)" }}
          >
            Your send history will appear here
          </p>
        </div>
      ) : (
        <div
          className="space-y-2"
          style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
        >
          {history.map((entry) => {
            const isSuccess = entry.status === "success";
            const hasArticleData = entry.articles_data && entry.articles_data.length > 0;
            const isExpanded = expandedId === entry.id;

            return (
              <div key={entry.id}>
                {/* Summary row */}
                <div
                  className={`flex items-center justify-between border px-5 py-4 transition-colors duration-150 ${hasArticleData ? "cursor-pointer" : ""}`}
                  style={{
                    borderColor: isExpanded ? "var(--color-border)" : "var(--color-border-light)",
                    background: "var(--color-surface)",
                    borderRadius: isExpanded ? "12px 12px 0 0" : "12px",
                  }}
                  onClick={() => hasArticleData && setExpandedId(isExpanded ? null : entry.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--color-surface)")
                  }
                >
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                      style={{
                        background: isSuccess
                          ? "var(--color-accent-pale)"
                          : "var(--color-danger-pale)",
                        border: `1px solid ${isSuccess ? "var(--color-accent-border, rgba(45,95,45,0.2))" : "var(--color-danger-border, rgba(239,68,68,0.2))"}`,
                      }}
                    >
                      {isSuccess ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M4 8.5l3 3 5-6"
                            style={{ stroke: "var(--color-accent)" }}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M5 5l6 6M11 5l-6 6"
                            style={{ stroke: "var(--color-danger)" }}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--color-text)",
                          fontWeight: 500,
                        }}
                      >
                        {entry.issue_number
                          ? `Issue #${entry.issue_number} — `
                          : ""}
                        {entry.article_count} article
                        {entry.article_count !== 1 ? "s" : ""} sent
                      </p>
                      {entry.error_message && (
                        <p
                          className="text-xs mt-0.5 max-w-md truncate"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: "var(--color-danger)",
                          }}
                        >
                          {entry.error_message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-dim)",
                      }}
                    >
                      {formatDate(entry.sent_at)}
                    </span>
                    {hasArticleData && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="transition-transform duration-200"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          color: "var(--color-text-dim)",
                        }}
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Expanded article list */}
                {isExpanded && entry.articles_data && (
                  <div
                    className="border border-t-0 px-5 py-3"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface-inset)",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    <div className="space-y-1">
                      {entry.articles_data.map((article, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-1.5">
                          <span
                            className="text-xs shrink-0 w-5 text-right"
                            style={{ color: "var(--color-text-dim)", fontFamily: "var(--font-body)" }}
                          >
                            {idx + 1}.
                          </span>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm truncate transition-colors duration-150"
                            style={{
                              fontFamily: "var(--font-body)",
                              color: "var(--color-text)",
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "var(--color-accent)";
                              e.currentTarget.style.textDecoration = "underline";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "var(--color-text)";
                              e.currentTarget.style.textDecoration = "none";
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {article.title || extractDomain(article.url)}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
