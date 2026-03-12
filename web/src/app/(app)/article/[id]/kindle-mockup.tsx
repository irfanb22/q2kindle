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
          width: "100%",
          maxWidth: 420,
          aspectRatio: "420 / 620",
          background: "#4a453e",
          borderRadius: 24,
          padding: "28px 24px 40px",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.12), 0 12px 48px rgba(0,0,0,0.06)",
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
            background: "#5a554e",
          }}
        />
      </div>
    </>
  );
}
