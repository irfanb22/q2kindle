"use client";

interface KindleMockupProps {
  title: string;
  author: string;
  url: string;
  sanitizedHtml: string | null;
  readTimeMinutes: number | null;
  loading?: boolean;
}

export default function KindleMockup({
  title,
  author,
  url,
  sanitizedHtml,
  readTimeMinutes,
  loading,
}: KindleMockupProps) {
  function extractDomain(urlStr: string): string {
    try {
      return new URL(urlStr).hostname.replace("www.", "");
    } catch {
      return urlStr;
    }
  }

  return (
    <>
      {/* Device frame (bezel) */}
      <div
        style={{
          width: 420,
          height: 620,
          background: "#3a3a3a",
          borderRadius: 24,
          padding: "28px 24px 40px",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.5), 0 12px 48px rgba(0,0,0,0.3)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Screen area */}
        <div
          className="kindle-screen"
          style={{
            width: "100%",
            height: "100%",
            background: "#f5f1e8",
            borderRadius: 4,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "32px 28px",
          }}
        >
          {loading ? (
            /* Loading skeleton */
            <div>
              <div className="kindle-shimmer" style={{ height: 22, width: "75%", marginBottom: 12, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "40%", marginBottom: 24, borderRadius: 3 }} />
              <div style={{ borderBottom: "1px solid #d4cfc3", marginBottom: 20 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "100%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "100%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "90%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "100%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "70%", marginBottom: 20, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "100%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "95%", marginBottom: 10, borderRadius: 3 }} />
              <div className="kindle-shimmer" style={{ height: 13, width: "80%", borderRadius: 3 }} />
            </div>
          ) : sanitizedHtml === null ? (
            /* Failed extraction state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginBottom: 16, opacity: 0.5 }}
              >
                <path
                  d="M12 2L2 22h20L12 2z"
                  stroke="#8a7e6b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 10v4M12 18v.5"
                  stroke="#8a7e6b"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "0.95rem",
                  color: "#4a4437",
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Content could not be extracted
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.75rem",
                  color: "#8a7e6b",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                }}
              >
                {extractDomain(url)}
              </a>
            </div>
          ) : (
            /* Article content */
            <div>
              {/* Title */}
              <h1
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  margin: "0 0 0.5rem",
                }}
              >
                {title}
              </h1>

              {/* Author + read time */}
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.8rem",
                  color: "#666666",
                  marginBottom: "1.75rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #d4cfc3",
                }}
              >
                {author}
                {readTimeMinutes && (
                  <span style={{ color: "#999" }}>
                    {" "}
                    &middot; {readTimeMinutes} min read
                  </span>
                )}
              </div>

              {/* Sanitized article HTML */}
              <div
                className="kindle-content"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          )}
        </div>

        {/* Chin detail — small dot like a home button indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4a4a4a",
          }}
        />
      </div>

      <style jsx>{`
        .kindle-screen::-webkit-scrollbar {
          width: 4px;
        }
        .kindle-screen::-webkit-scrollbar-track {
          background: transparent;
        }
        .kindle-screen::-webkit-scrollbar-thumb {
          background: #c4bfb3;
          border-radius: 2px;
        }

        @keyframes kindleShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .kindle-shimmer {
          background: linear-gradient(90deg, #e8e3d8 25%, #ddd8cb 50%, #e8e3d8 75%);
          background-size: 400px 100%;
          animation: kindleShimmer 1.5s infinite ease-in-out;
        }
      `}</style>

      <style jsx global>{`
        .kindle-content {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 0.95rem;
          line-height: 1.75;
          color: #1a1a1a;
          filter: grayscale(1);
        }
        .kindle-content p {
          margin: 0 0 0.85em;
        }
        .kindle-content h1,
        .kindle-content h2,
        .kindle-content h3 {
          font-weight: 700;
          margin: 1.5em 0 0.5em;
          line-height: 1.3;
        }
        .kindle-content h1 { font-size: 1.25rem; }
        .kindle-content h2 { font-size: 1.1rem; }
        .kindle-content h3 { font-size: 1rem; }
        .kindle-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 2px;
          filter: grayscale(1);
        }
        .kindle-content a {
          color: #1a1a1a;
          text-decoration: underline;
        }
        .kindle-content blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 2px solid #c4bfb3;
          color: #444;
          font-style: italic;
        }
        .kindle-content ul,
        .kindle-content ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
        }
        .kindle-content li {
          margin-bottom: 0.3em;
        }
        .kindle-content pre,
        .kindle-content code {
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          background: #ece8dc;
          padding: 0.15em 0.3em;
          border-radius: 2px;
        }
        .kindle-content pre {
          padding: 0.75em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .kindle-content figure {
          margin: 1em 0;
        }
        .kindle-content figcaption {
          font-size: 0.8rem;
          color: #666;
          text-align: center;
          margin-top: 0.4em;
        }
      `}</style>
    </>
  );
}
