"use client";

import { useState, useEffect } from "react";

interface Audience {
  total: number;
  subscribed: number;
  unsubscribed: number;
}

interface SendLog {
  id: string;
  subject: string;
  preview_text: string | null;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function AdminEmailPage() {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [audienceRes, logsRes] = await Promise.all([
          fetch("/api/admin/email/audience"),
          fetch("/api/admin/email/logs"),
        ]);

        if (audienceRes.status === 403 || logsRes.status === 403) {
          setDenied(true);
          setLoading(false);
          return;
        }

        if (audienceRes.ok) {
          setAudience(await audienceRes.json());
        }
        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
      setLoading(false);
    }

    load();
  }, []);

  async function sendTestEmail() {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "test",
          subject: "q2kindle — Test Email",
          previewText: "This is a test email from q2kindle.",
          bodyHtml: `
            <p style="margin:0 0 16px;">Hey there,</p>
            <p style="margin:0 0 16px;">This is a <strong>test email</strong> from your q2kindle admin dashboard. If you're reading this, email delivery via Resend is working.</p>
            <p style="margin:0 0 24px;">— q2kindle</p>
          `,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ ok: true, message: data.message });
      } else {
        setTestResult({ ok: false, message: data.error || "Send failed" });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : "Network error",
      });
    }
    setTestSending(false);
  }

  function togglePreview() {
    if (previewHtml) {
      setPreviewHtml(null);
      return;
    }
    // Show a sample rendered preview
    setPreviewHtml(`
      <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
        <p style="margin:0 0 16px;">Hey there,</p>
        <p style="margin:0 0 16px;">This is a <strong>test email</strong> from your q2kindle admin dashboard. If you're reading this, email delivery via Resend is working.</p>
        <p style="margin:0 0 24px;">— q2kindle</p>
      </div>
    `);
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
    );
  }

  if (denied) {
    return (
      <div
        className="text-center py-20"
        style={{ animation: "fadeUp 0.6s ease both" }}
      >
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{
            background: "var(--color-danger-pale)",
            border: "1px solid var(--color-danger-border)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              style={{ stroke: "var(--color-danger)" }}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          Access denied. Admin privileges required.
        </p>
      </div>
    );
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
          Email Dashboard
        </h1>
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          Marketing email stats and send history
        </p>
      </div>

      {/* Audience cards */}
      {audience && (
        <div
          className="grid grid-cols-3 gap-3 mb-8"
          style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
        >
          <StatCard label="Total Users" value={audience.total} />
          <StatCard
            label="Subscribed"
            value={audience.subscribed}
            accent
          />
          <StatCard label="Unsubscribed" value={audience.unsubscribed} />
        </div>
      )}

      {/* Test email */}
      <div
        className="mb-8 border rounded-xl overflow-hidden"
        style={{
          borderColor: "var(--color-border-light)",
          background: "var(--color-surface)",
          animation: "fadeUp 0.6s ease 0.15s both",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text)",
                fontWeight: 500,
              }}
            >
              Test Email Delivery
            </p>
            <p
              className="text-xs mt-0.5"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-dim)",
              }}
            >
              Sends a test email to your account via Resend
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              className="px-3 py-1.5 text-xs rounded-lg border"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                borderColor: "var(--color-border-light)",
                color: "var(--color-text-muted)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {previewHtml ? "Hide Preview" : "Preview"}
            </button>
            <button
              onClick={sendTestEmail}
              disabled={testSending}
              className="px-4 py-1.5 text-xs rounded-lg"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                background: testSending
                  ? "var(--color-border-light)"
                  : "var(--color-accent)",
                color: "#fff",
                border: "none",
                cursor: testSending ? "not-allowed" : "pointer",
                opacity: testSending ? 0.7 : 1,
              }}
            >
              {testSending ? "Sending..." : "Send Test Email"}
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className="px-5 py-3 text-xs"
            style={{
              fontFamily: "var(--font-body)",
              borderTop: "1px solid var(--color-border-light)",
              color: testResult.ok
                ? "var(--color-success)"
                : "var(--color-danger)",
              background: testResult.ok
                ? "var(--color-success-pale)"
                : "var(--color-danger-pale)",
            }}
          >
            {testResult.message}
          </div>
        )}

        {previewHtml && (
          <div
            style={{
              borderTop: "1px solid var(--color-border-light)",
              padding: "24px",
              background: "#f4f4f4",
            }}
          >
            <div
              style={{
                maxWidth: 600,
                margin: "0 auto",
                background: "#ffffff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "32px 40px 24px",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <span
                  style={{
                    fontFamily: "Georgia,'Times New Roman',serif",
                    fontSize: 24,
                    color: "#1a1a1a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  q2kindle
                </span>
              </div>
              {/* Body */}
              <div
                style={{ padding: "32px 40px" }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              {/* Footer */}
              <div
                style={{
                  padding: "24px 40px 32px",
                  borderTop: "1px solid #e8e8e8",
                  fontSize: 12,
                  color: "#999",
                  lineHeight: 1.5,
                }}
              >
                You&apos;re receiving this because you have a q2kindle account.
                <br />
                <span style={{ textDecoration: "underline" }}>Unsubscribe</span>{" "}
                from marketing emails
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send logs */}
      <div style={{ animation: "fadeUp 0.6s ease 0.2s both" }}>
        <h2
          className="text-lg mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            letterSpacing: "-0.01em",
          }}
        >
          Recent Sends
        </h2>

        {logs.length === 0 ? (
          <div
            className="text-center py-12 border rounded-xl"
            style={{
              borderColor: "var(--color-border-light)",
              background: "var(--color-surface)",
            }}
          >
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-dim)",
              }}
            >
              No emails sent yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border px-4 py-3 rounded-xl"
                style={{
                  borderColor: "var(--color-border-light)",
                  background: "var(--color-surface)",
                }}
              >
                <div className="min-w-0">
                  <p
                    className="text-sm truncate"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text)",
                      fontWeight: 500,
                    }}
                  >
                    {log.subject}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dim)",
                    }}
                  >
                    {log.success_count}/{log.recipient_count} delivered
                    {log.failure_count > 0 && (
                      <span style={{ color: "var(--color-danger)" }}>
                        {" "}
                        · {log.failure_count} failed
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={log.status} />
                  <span
                    className="text-xs hidden sm:inline"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dim)",
                    }}
                  >
                    {formatDate(log.sent_at || log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className="border rounded-xl px-4 py-4 text-center"
      style={{
        borderColor: accent
          ? "rgba(45,95,45,0.2)"
          : "var(--color-border-light)",
        background: accent ? "var(--color-accent-pale)" : "var(--color-surface)",
      }}
    >
      <p
        className="text-2xl mb-1"
        style={{
          fontFamily: "var(--font-heading)",
          color: accent ? "var(--color-accent)" : "var(--color-text)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        className="text-xs"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-dim)",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === "completed";
  const isFailed = status === "failed";
  const isSending = status === "sending";

  let bg: string;
  let color: string;
  let label: string;

  if (isSuccess) {
    bg = "var(--color-success-pale)";
    color = "var(--color-success)";
    label = "Sent";
  } else if (isFailed) {
    bg = "var(--color-danger-pale)";
    color = "var(--color-danger)";
    label = "Failed";
  } else if (isSending) {
    bg = "rgba(180,83,9,0.06)";
    color = "var(--color-warning)";
    label = "Sending";
  } else {
    bg = "rgba(136,136,136,0.08)";
    color = "var(--color-text-dim)";
    label = status;
  }

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  );
}
