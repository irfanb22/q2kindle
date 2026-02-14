"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [kindleEmail, setKindleEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [hasExistingPassword, setHasExistingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabaseRef = useRef(createClient());

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        if (data.settings) {
          setKindleEmail(data.settings.kindle_email || "");
          setSenderEmail(data.settings.sender_email || "");
          setHasExistingPassword(!!data.settings.smtp_password);
        }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!kindleEmail.trim() || !senderEmail.trim()) {
      setError("Kindle email and Gmail address are required");
      return;
    }

    if (!smtpPassword && !hasExistingPassword) {
      setError("Gmail app password is required");
      return;
    }

    setSaving(true);

    try {
      const body: Record<string, string> = {
        kindle_email: kindleEmail.trim(),
        sender_email: senderEmail.trim(),
      };

      // Only send password if the user entered a new one
      if (smtpPassword) {
        body.smtp_password = smtpPassword;
      } else if (hasExistingPassword) {
        // Need to fetch the current password from the server to preserve it
        // Since we don't expose it to the client, we use a special flag
        // Actually, the POST handler requires smtp_password, so we need to
        // send a sentinel value and handle it server-side, OR fetch current
        // For simplicity: if user hasn't changed password, we re-fetch and re-send
        const supabase = supabaseRef.current;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setSaving(false);
          return;
        }
        // We can't get the password from GET (it's masked), so we'll
        // just skip password in the upsert by calling a different approach
        // Simplest fix: require password field to be non-empty OR already saved
        // Let's handle this by making the API accept a missing password when one exists
        // For now, let the API handle it — we won't send smtp_password at all
      }

      // If no new password and one exists, we need to handle this
      // The cleanest approach: send all three, API requires all three
      // So if password is empty and one exists, user keeps existing password
      if (!body.smtp_password && hasExistingPassword) {
        // Call a special update that doesn't touch smtp_password
        const supabase = supabaseRef.current;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Not authenticated"); setSaving(false); return; }

        const { error: updateError } = await supabase
          .from("settings")
          .update({
            kindle_email: body.kindle_email,
            sender_email: body.sender_email,
          })
          .eq("user_id", user.id);

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }

        setSuccess(true);
        setSaving(false);
        setTimeout(() => setSuccess(false), 5000);
        return;
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setHasExistingPassword(true);
      setSmtpPassword("");
      setSaving(false);
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError("Failed to save settings");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.6s ease both' }}>
        <div className="mb-8">
          <h1 className="text-3xl mb-1"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed', letterSpacing: '-0.02em' }}>
            Settings
          </h1>
          <p className="text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
            Configure your Kindle email and sending preferences
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#888888" strokeWidth="3"/>
            <path className="opacity-75" fill="#888888" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <style jsx>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.6s ease both' }}>
      <div className="mb-8">
        <h1 className="text-3xl mb-1"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p className="text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
          Configure your Kindle email and sending preferences
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Email Configuration */}
        <div className="rounded-xl border p-6 mb-6"
          style={{ background: '#141414', borderColor: '#262626', animation: 'fadeUp 0.6s ease 0.1s both' }}>
          <h2 className="text-lg mb-1"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed' }}>
            Email Configuration
          </h2>
          <p className="text-xs mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
            Required to send articles to your Kindle
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
                Kindle Email
              </label>
              <input
                type="email"
                value={kindleEmail}
                onChange={(e) => { setKindleEmail(e.target.value); setError(null); }}
                placeholder="yourname@kindle.com"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
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
              <p className="text-xs mt-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                Found in Amazon → Manage Content &amp; Devices → Preferences → Personal Document Settings
              </p>
            </div>

            <div>
              <label className="block text-xs mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
                Gmail Address
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => { setSenderEmail(e.target.value); setError(null); }}
                placeholder="you@gmail.com"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
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
              <p className="text-xs mt-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                Must be added to your Amazon approved sender list
              </p>
            </div>

            <div>
              <label className="block text-xs mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
                Gmail App Password
              </label>
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => { setSmtpPassword(e.target.value); setError(null); }}
                placeholder={hasExistingPassword ? "••••••••••••••••" : "16-character app password"}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
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
              <p className="text-xs mt-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                Not your Gmail password.{" "}
                <a
                  href="https://support.google.com/accounts/answer/185833"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#22c55e' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#22c55e'}
                >
                  How to create an app password →
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Send Preferences — coming soon */}
        <div className="rounded-xl border p-6 mb-6 opacity-50"
          style={{ background: '#141414', borderColor: '#262626', animation: 'fadeUp 0.6s ease 0.15s both' }}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#ededed' }}>
              Auto-Send
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888', background: 'rgba(136,136,136,0.1)', border: '1px solid rgba(136,136,136,0.15)' }}>
              Coming soon
            </span>
          </div>
          <p className="text-xs mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#888888' }}>
            Automatically send articles on a schedule or when queue reaches a threshold
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                Auto-send after N articles
              </label>
              <input
                type="number"
                disabled
                placeholder="e.g. 5"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-not-allowed"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: '#0a0a0a',
                  borderColor: '#1a1a1a',
                  color: '#555555',
                }}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs mb-1.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                  Schedule day
                </label>
                <select
                  disabled
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-not-allowed appearance-none"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: '#0a0a0a',
                    borderColor: '#1a1a1a',
                    color: '#555555',
                  }}
                >
                  <option>Sunday</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1.5"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#555555' }}>
                  Schedule time
                </label>
                <input
                  type="time"
                  disabled
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none cursor-not-allowed"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    background: '#0a0a0a',
                    borderColor: '#1a1a1a',
                    color: '#555555',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
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

        {/* Success message */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M5.5 8l2 2 3-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm" style={{ color: '#22c55e', fontFamily: "'DM Sans', sans-serif" }}>
              Settings saved successfully
            </span>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end" style={{ animation: 'fadeUp 0.6s ease 0.2s both' }}>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: saving ? '#16a34a' : '#22c55e',
              color: '#0a0a0a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.3)',
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#16a34a'; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#22c55e'; }}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </span>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
