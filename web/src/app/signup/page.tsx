"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

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

  const handleVerifyOtp = useCallback(async (code?: string) => {
    const token = code || otp;
    if (token.length !== 6) return;

    setVerifying(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });

    setVerifying(false);

    if (verifyError) {
      const msg = verifyError.message.toLowerCase();
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
        setError("That code is expired or incorrect. Check your email for the latest code.");
      } else if (msg.includes("rate") || msg.includes("limit")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(verifyError.message);
      }
      setOtp("");
      otpInputRef.current?.focus();
    } else {
      window.location.href = "/dashboard";
    }
  }, [otp, email]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !verifying) {
      handleVerifyOtp(otp);
    }
  }, [otp, verifying, handleVerifyOtp]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
        style={{ background: '#0a0a0a' }}>

        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />

        {/* Faint grid texture */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#ededed 1px, transparent 1px), linear-gradient(90deg, #ededed 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

        <div className="relative z-10 w-full max-w-md">

          {/* Logo & Title */}
          <div className="text-center mb-12" style={{ animation: 'fadeUp 0.8s ease both' }}>

            {/* Book icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-2xl border"
              style={{
                borderColor: '#262626',
                background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
                boxShadow: '0 0 0 1px rgba(34,197,94,0.06), 0 8px 32px rgba(0,0,0,0.4)',
              }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 6C14 6 10.5 4 6 4C4.5 4 3.5 4.3 3 4.5V22.5C3.5 22.3 4.5 22 6 22C10.5 22 14 24 14 24" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                <path d="M14 6C14 6 17.5 4 22 4C23.5 4 24.5 4.3 25 4.5V22.5C24.5 22.3 23.5 22 22 22C17.5 22 14 24 14 24" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <path d="M14 6V24" stroke="#22c55e" strokeWidth="1" opacity="0.3"/>
              </svg>
            </div>

            <h1 className="text-4xl tracking-tight mb-3"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                color: '#ededed',
                letterSpacing: '-0.02em',
              }}>
              q2kindle
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border p-8"
            style={{
              borderColor: '#262626',
              background: '#141414',
              boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 16px 64px rgba(0,0,0,0.5)',
              animation: 'fadeUp 0.8s ease 0.15s both',
            }}>

            {!sent ? (
              <>
                {/* Heading */}
                <h2 className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#ededed',
                  }}>
                  Sign up to q2kindle
                </h2>
                <p className="text-sm leading-relaxed mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#888888',
                  }}>
                  We&apos;ll email you a magic link so we can verify your email address.
                </p>

                <form onSubmit={handleSubmit}>
                  <label className="block text-xs uppercase tracking-widest mb-3"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#888888',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                    }}>
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border px-4 py-3.5 text-base outline-none transition-all duration-200"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: '#0a0a0a',
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

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full mt-5 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: loading ? '#16a34a' : '#22c55e',
                      color: '#0a0a0a',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.background = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.background = '#22c55e';
                    }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* OTP verification state */
              <div className="text-center py-4" style={{ animation: 'fadeUp 0.5s ease both' }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="text-xl mb-2"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed' }}>
                  Check your email
                </h2>
                <p className="text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
                  We sent a verification code to<br/>
                  <span style={{ color: '#ededed' }}>{email}</span>
                </p>

                {/* OTP input */}
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    className="w-full rounded-xl border px-4 py-3.5 text-center outline-none transition-all duration-200"
                    style={{
                      fontFamily: "'DM Sans', monospace",
                      fontSize: '24px',
                      letterSpacing: '0.3em',
                      background: '#0a0a0a',
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

                  <button
                    type="submit"
                    disabled={verifying || otp.length !== 6}
                    className="w-full mt-4 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      background: verifying ? '#16a34a' : '#22c55e',
                      color: '#0a0a0a',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!verifying) e.currentTarget.style.background = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      if (!verifying) e.currentTarget.style.background = '#22c55e';
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
                      "Verify Code"
                    )}
                  </button>
                </form>

                <p className="text-xs mt-4 mb-4"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                  or click the magic link in your email
                </p>

                <button
                  onClick={() => { setSent(false); setOtp(""); setError(null); }}
                  className="text-sm transition-colors duration-200 cursor-pointer"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#888888',
                    background: 'none',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ededed'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                >
                  Use a different email &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-sm"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#888888',
              animation: 'fadeUp 0.8s ease 0.3s both',
            }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
              Log In
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
