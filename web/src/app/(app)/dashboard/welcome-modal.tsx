"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [kindleEmail, setKindleEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSaveAndNext() {
    const trimmed = kindleEmail.trim();
    if (!trimmed) {
      setError("Please enter your Kindle email");
      return;
    }

    if (!trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kindle_email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }

      setSaving(false);
      setStep(3);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTesting(true);
    setError(null);

    try {
      const res = await fetch("/api/send/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Test email failed");
        setTesting(false);
        return;
      }

      setTestSuccess(true);
      setTesting(false);
    } catch {
      setError("Failed to send test email");
      setTesting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText("kindle@q2kindle.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const inputStyle = {
    fontFamily: "var(--font-body)",
    background: "var(--color-surface-inset)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  // Shared error block
  const errorBlock = error && (
    <div
      className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
      style={{ background: "var(--color-danger-pale)", border: "1px solid var(--color-danger-border)" }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
        <circle cx="8" cy="8" r="7" stroke="var(--color-danger)" strokeWidth="1.5" opacity="0.7"/>
        <path d="M8 5v3.5M8 10.5v.5" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span className="text-sm" style={{ color: "var(--color-danger)", fontFamily: "var(--font-body)" }}>
        {error}
      </span>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-[calc(56px+env(safe-area-inset-bottom,0px))] sm:pb-0"
      style={{ background: "rgba(0, 0, 0, 0.4)" }}
    >
      <div
        className="w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        style={{
          background: "var(--color-surface)",
          maxHeight: "90vh",
          animation: "modalSlideUp 0.4s ease both",
        }}
      >
        {/* X close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: "var(--color-text-dim)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.background = "var(--color-surface-inset)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-dim)";
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-8 sm:px-10 pb-10">
          {/* ============ STEP 1: Welcome ============ */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <h2
                className="text-3xl mb-5"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Hi 👋
              </h2>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  lineHeight: "1.7",
                }}
              >
                I built <strong style={{ color: "var(--color-text)" }}>q2Kindle</strong> to make it easier to send articles to your Kindle.
              </p>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  lineHeight: "1.7",
                }}
              >
                After a quick <strong style={{ color: "var(--color-text)" }}>one-minute setup</strong>, you can queue articles and we&apos;ll
                bundle them into an ebook and deliver it to your Kindle
                on your schedule.
              </p>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  lineHeight: "1.7",
                }}
              >
                I hope it gives you a quieter, distraction-free way to read the internet.
              </p>
              <p
                className="text-sm mb-8"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                All the best,
                <br />
                <span style={{ fontFamily: "var(--font-heading)", fontStyle: "italic" }}>
                  — Irfan
                </span>
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                  boxShadow: "var(--shadow-button)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
              >
                Send My First Article
              </button>
            </div>
          )}

          {/* ============ STEP 2: Kindle Email ============ */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <p
                className="text-xs mb-1"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)" }}
              >
                Step 1 of 3
              </p>
              <h2
                className="text-xl mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Add your Kindle email
              </h2>
              <p
                className="text-xs mb-5"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)", lineHeight: "1.5" }}
              >
                Find it in your{" "}
                <a
                  href="https://www.amazon.com/hz/mycd/myx#/home/settings/pdoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)" }}
                >
                  Amazon account
                </a>
                {" "}under <strong>Send-to-Kindle E-Mail Settings</strong>.
              </p>

              {/* Kindle email input */}
              <div className="mb-5">
                <label
                  className="block text-xs mb-1.5"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
                >
                  Kindle Email
                </label>
                <input
                  type="email"
                  value={kindleEmail}
                  onChange={(e) => { setKindleEmail(e.target.value); setError(null); }}
                  placeholder="yourname@kindle.com"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,95,45,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  autoFocus
                />
              </div>

              {errorBlock}

              {/* Next button */}
              <button
                onClick={handleSaveAndNext}
                disabled={saving}
                className="w-full rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                style={{
                  fontFamily: "var(--font-body)",
                  background: saving ? "var(--color-accent-hover)" : "var(--color-accent)",
                  color: "var(--color-accent-text)",
                  boxShadow: "var(--shadow-button)",
                }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--color-accent-hover)"; }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--color-accent)"; }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Next"
                )}
              </button>
            </div>
          )}

          {/* ============ STEP 3: Approve Sender ============ */}
          {step === 3 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <p
                className="text-xs mb-1"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)" }}
              >
                Step 2 of 3
              </p>
              <h2
                className="text-xl mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Approve our sender address
              </h2>
              <p
                className="text-xs mb-5"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)", lineHeight: "1.5" }}
              >
                On the same{" "}
                <a
                  href="https://www.amazon.com/hz/mycd/myx#/home/settings/pdoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)" }}
                >
                  Amazon settings page
                </a>
                , find <strong>Approved Personal Document E-mail List</strong> and add the address below.
              </p>

              {/* Address to add with copy button */}
              <div
                className="rounded-xl px-4 py-4 mb-6 flex items-center justify-between gap-3"
                style={{
                  background: "var(--color-accent-pale)",
                  border: "1px solid rgba(45,95,45,0.12)",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-accent)" }}
                >
                  kindle@q2kindle.com
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer shrink-0"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: copied ? "var(--color-accent)" : "var(--color-surface)",
                    color: copied ? "var(--color-accent-text)" : "var(--color-text-muted)",
                    border: copied ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                    minHeight: "36px",
                  }}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p
                className="text-xs mb-5"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)", lineHeight: "1.5" }}
              >
                This lets your Kindle accept articles from Q2Kindle. Without it, Amazon will silently block deliveries.
              </p>

              {/* I've Added It button */}
              <button
                onClick={() => { setError(null); setStep(4); }}
                className="w-full rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  background: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                  boxShadow: "var(--shadow-button)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
              >
                I&apos;ve Added It
              </button>
            </div>
          )}

          {/* ============ STEP 4: Test Email ============ */}
          {step === 4 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <p
                className="text-xs mb-1"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)" }}
              >
                Step 3 of 3
              </p>
              <h2
                className="text-xl mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Verify it works
              </h2>
              <p
                className="text-sm mb-6"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  lineHeight: "1.6",
                }}
              >
                Send a test ebook to your Kindle to make sure everything is connected.
              </p>

              {errorBlock}

              {!testSuccess ? (
                <button
                  onClick={handleTestEmail}
                  disabled={testing}
                  className="w-full rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: testing ? "var(--color-accent-hover)" : "var(--color-accent)",
                    color: "var(--color-accent-text)",
                    boxShadow: "var(--shadow-button)",
                  }}
                  onMouseEnter={(e) => { if (!testing) e.currentTarget.style.background = "var(--color-accent-hover)"; }}
                  onMouseLeave={(e) => { if (!testing) e.currentTarget.style.background = "var(--color-accent)"; }}
                >
                  {testing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending test…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Send Test Email
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-5"
                    style={{ background: "var(--color-success-pale)", border: "1px solid var(--color-success-border)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <circle cx="8" cy="8" r="7" stroke="var(--color-accent)" strokeWidth="1.5"/>
                      <path d="M5.5 8l2 2 3-4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>
                      Test sent! Check your Kindle in a few minutes.
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: "var(--color-accent)",
                      color: "var(--color-accent-text)",
                      boxShadow: "var(--shadow-button)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
                  >
                    Start Adding Articles
                  </button>
                </div>
              )}

              {!testSuccess && (
                <button
                  onClick={onClose}
                  className="w-full mt-3 text-xs cursor-pointer"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dim)",
                    background: "none",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-text-muted)";
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-dim)";
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  Skip for now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
