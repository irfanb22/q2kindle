"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [linkFailedMessage, setLinkFailedMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth") {
      setError("Authentication failed. Please try again.");
    } else if (errorParam === "link_failed") {
      setLinkFailedMessage("That sign-in link has expired or was already used. Enter your email to get a new one.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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
      setResendCooldown(30);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--color-bg)' }}>

      {/* Subtle ornamental circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.06)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.04)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ border: '1px solid rgba(45,95,45,0.02)' }} />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-12" style={{ animation: 'fadeUp 0.8s ease both' }}>

          {/* App icon */}
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8 mx-auto block"
            style={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <rect width="32" height="32" rx="7" fill="#2d5f2d"/>
            <rect x="8" y="4" width="16" height="24" rx="3" stroke="#f4f4f4" strokeWidth="2" fill="none"/>
            <rect x="11" y="8" width="10" height="2.5" rx="1" fill="#f4f4f4"/>
            <rect x="11" y="13" width="10" height="2.5" rx="1" fill="#f4f4f4" opacity="0.65"/>
            <rect x="11" y="18" width="10" height="2.5" rx="1" fill="#f4f4f4" opacity="0.35"/>
          </svg>

          <h1 className="text-4xl tracking-tight mb-3"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}>
            q2Kindle
          </h1>

          {!sent && (
            <>
              <h2 className="text-2xl tracking-tight mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--color-text)',
                  letterSpacing: '-0.01em',
                }}>
                {isSignup ? "Sign up" : "Welcome back."}
              </h2>

              <p className="text-base leading-relaxed"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 400,
                }}>
                {isSignup
                  ? "We'll email you a magic link so we can verify your email address."
                  : "Enter the email that you signed up with and we'll email you a magic link to log in."}
              </p>
            </>
          )}
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
              {/* Cross-browser magic link error */}
              {linkFailedMessage && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg px-3.5 py-3"
                  style={{ background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.2)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <circle cx="8" cy="8" r="7" stroke="#b45309" strokeWidth="1.5" opacity="0.7"/>
                    <path d="M8 5v3.5M8 10.5v.5" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                    {linkFailedMessage}
                  </span>
                </div>
              )}

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
            /* Success state — check email + OTP entry */
            <div className="py-4" style={{ animation: 'fadeUp 0.5s ease both' }}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                  style={{ background: 'var(--color-accent-pale)', border: '1px solid rgba(45,95,45,0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      style={{ stroke: 'var(--color-accent)' }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="text-xl mb-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  Check your email
                </h2>
                <p className="text-sm leading-relaxed mb-6"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                  We sent a sign-in link and code to<br/>
                  <span style={{ color: 'var(--color-text)' }}>{email}</span>
                </p>
              </div>

              {/* OTP code entry */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-light)' }}>
                <label className="block text-xs uppercase tracking-widest mb-3 text-center"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                  }}>
                  Or enter the 6-digit code
                </label>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (otp.length !== 6) return;
                  setVerifying(true);
                  setError(null);
                  const supabase = createClient();
                  const { error: otpError } = await supabase.auth.verifyOtp({
                    email: email.trim(),
                    token: otp.trim(),
                    type: "email",
                  });
                  setVerifying(false);
                  if (otpError) {
                    setError(otpError.message);
                  } else {
                    window.location.href = "/dashboard";
                  }
                }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl border px-4 py-3.5 text-center text-2xl tracking-[0.3em] outline-none transition-all duration-200"
                    style={{
                      fontFamily: 'var(--font-body)',
                      background: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      fontWeight: 500,
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
                    disabled={verifying || otp.length !== 6}
                    className="w-full mt-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--font-body)',
                      background: verifying ? 'var(--color-accent-hover)' : 'var(--color-accent)',
                      color: 'var(--color-accent-text)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(45,95,45,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!verifying) e.currentTarget.style.background = 'var(--color-accent-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!verifying) e.currentTarget.style.background = 'var(--color-accent)';
                    }}
                  >
                    {verifying ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Verifying…
                      </span>
                    ) : (
                      "Verify code"
                    )}
                  </button>
                </form>
              </div>

              {/* Spam hint + resend + different email */}
              <div className="text-center mt-6 space-y-3">
                <p className="text-xs leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-dim)' }}>
                  Didn&apos;t receive an email? Check your spam folder, or{' '}
                  <button
                    onClick={async () => {
                      if (resendCooldown > 0) return;
                      setResendCooldown(30);
                      const supabase = createClient();
                      await supabase.auth.signInWithOtp({
                        email: email.trim(),
                        options: {
                          emailRedirectTo: `${window.location.origin}/auth/callback`,
                        },
                      });
                    }}
                    disabled={resendCooldown > 0}
                    className="transition-colors duration-200 cursor-pointer disabled:cursor-default"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: resendCooldown > 0 ? 'var(--color-text-dim)' : 'var(--color-accent)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 'inherit',
                      textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    {resendCooldown > 0 ? `resend in ${resendCooldown}s` : 'resend email'}
                  </button>
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); setOtp(""); setError(null); setLinkFailedMessage(null); }}
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
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        {!sent && (
          <p className="text-center mt-8 text-xs"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-dim)',
              animation: 'fadeUp 0.8s ease 0.3s both',
            }}>
            {isSignup
              ? "No password needed — just verify your email to get started"
              : "No password needed — we'll email you a sign-in link"}
          </p>
        )}
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
