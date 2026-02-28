"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}>

      {/* Subtle ornamental circles (replacing radial-gradient glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.06)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.04)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.02)' }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-12" style={{ animation: 'fadeUp 0.8s ease both' }}>

          {/* Book icon — minimal open book shape */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-2xl border"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              boxShadow: '0 0 0 1px rgba(45,95,45,0.06), 0 8px 32px rgba(0,0,0,0.08)',
            }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6C14 6 10.5 4 6 4C4.5 4 3.5 4.3 3 4.5V22.5C3.5 22.3 4.5 22 6 22C10.5 22 14 24 14 24" style={{ stroke: 'var(--color-accent)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
              <path d="M14 6C14 6 17.5 4 22 4C23.5 4 24.5 4.3 25 4.5V22.5C24.5 22.3 23.5 22 22 22C17.5 22 14 24 14 24" style={{ stroke: 'var(--color-accent)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              <path d="M14 6V24" style={{ stroke: 'var(--color-accent)' }} strokeWidth="1" opacity="0.3"/>
            </svg>
          </div>

          <h1 className="text-4xl tracking-tight mb-3"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}>
            q2kindle
          </h1>

          <p className="text-base leading-relaxed"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontWeight: 400,
            }}>
            Send articles to your Kindle, from anywhere
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 16px 64px rgba(0,0,0,0.08)',
            animation: 'fadeUp 0.8s ease 0.15s both',
          }}>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <label className="block text-xs uppercase tracking-widest mb-3"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                }}>
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-xl border px-4 py-3.5 text-base outline-none transition-all duration-200"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(45,95,45,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5"
                  style={{ background: 'var(--color-danger-pale)', border: '1px solid var(--color-danger-border)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <circle cx="8" cy="8" r="7" style={{ stroke: 'var(--color-danger)' }} strokeWidth="1.5" opacity="0.7"/>
                    <path d="M8 5v3.5M8 10.5v.5" style={{ stroke: 'var(--color-danger)' }} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}>
                    {error}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full mt-5 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: loading ? 'var(--color-accent-hover)' : 'var(--color-accent)',
                  color: 'var(--color-accent-text)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(45,95,45,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--color-accent-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--color-accent)';
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending link…
                  </span>
                ) : (
                  "Send Magic Link"
                )}
              </button>
            </form>
          ) : (
            /* Success state */
            <div className="text-center py-4" style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'var(--color-accent-pale)', border: '1px solid var(--color-accent-border, rgba(45,95,45,0.15))' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    style={{ stroke: 'var(--color-accent)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 className="text-xl mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Check your email
              </h2>
              <p className="text-sm leading-relaxed mb-5"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                We sent a magic link to<br/>
                <span style={{ color: 'var(--color-text)' }}>{email}</span>
              </p>

              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm transition-colors duration-200 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                Use a different email →
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center mt-8 text-xs"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-dim)',
            animation: 'fadeUp 0.8s ease 0.3s both',
          }}>
          No password needed — we&apos;ll email you a sign-in link
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
