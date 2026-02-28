"use client";

import { useState, useEffect, useRef } from "react";

const DAY_OPTIONS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

function getTimezoneList(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers
    return [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Anchorage",
      "Pacific/Honolulu",
      "Europe/London",
      "Europe/Berlin",
      "Europe/Paris",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Australia/Sydney",
      "UTC",
    ];
  }
}

function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    const offset = offsetPart?.value || "";
    // Turn "America/New_York" into "New York"
    const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;
    return `${city} (${offset})`;
  } catch {
    return tz;
  }
}

export default function SettingsPage() {
  // Email config
  const [kindleEmail, setKindleEmail] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Delivery schedule
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const [minArticleCount, setMinArticleCount] = useState("");

  // EPUB formatting
  const [epubIncludeImages, setEpubIncludeImages] = useState(true);
  const [epubShowAuthor, setEpubShowAuthor] = useState(true);
  const [epubShowReadTime, setEpubShowReadTime] = useState(true);
  const [epubShowPublishedDate, setEpubShowPublishedDate] = useState(true);

  // Daily send usage
  const [dailySendsUsed, setDailySendsUsed] = useState(0);
  const [dailySendLimit, setDailySendLimit] = useState(10);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const timezones = useRef(getTimezoneList());

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();

        // Load daily send usage
        setDailySendsUsed(data.dailySendsUsed ?? 0);
        setDailySendLimit(data.dailySendLimit ?? 10);

        if (data.settings) {
          setKindleEmail(data.settings.kindle_email || "");
          setSettingsSaved(!!data.settings.kindle_email);
          setScheduleDays(data.settings.schedule_days || []);
          // Normalize to hour-only (e.g., "19:30" → "19:00")
          const rawTime = data.settings.schedule_time || "";
          if (rawTime && rawTime.includes(":")) {
            const hour = rawTime.split(":")[0].padStart(2, "0");
            setScheduleTime(`${hour}:00`);
          } else {
            setScheduleTime(rawTime);
          }
          setTimezone(data.settings.timezone || getLocalTimezone());
          setMinArticleCount(
            data.settings.min_article_count
              ? String(data.settings.min_article_count)
              : ""
          );
          setEpubIncludeImages(data.settings.epub_include_images ?? true);
          setEpubShowAuthor(data.settings.epub_show_author ?? true);
          setEpubShowReadTime(data.settings.epub_show_read_time ?? true);
          setEpubShowPublishedDate(data.settings.epub_show_published_date ?? true);
        } else {
          // No settings yet — auto-detect timezone
          setTimezone(getLocalTimezone());
        }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function toggleDay(day: string) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!kindleEmail.trim()) {
      setError("Kindle email is required");
      return;
    }

    // Validate min article count if set
    if (minArticleCount) {
      const n = Number(minArticleCount);
      if (isNaN(n) || n < 1 || n > 50) {
        setError("Minimum article count must be between 1 and 50");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kindle_email: kindleEmail.trim(),
          min_article_count: minArticleCount ? Number(minArticleCount) : null,
          schedule_days: scheduleDays.length > 0 ? scheduleDays : null,
          schedule_time: scheduleTime || null,
          timezone: timezone || null,
          epub_include_images: epubIncludeImages,
          epub_show_author: epubShowAuthor,
          epub_show_read_time: epubShowReadTime,
          epub_show_published_date: epubShowPublishedDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
        setSaving(false);
        return;
      }

      setSuccess("Settings saved");
      setSettingsSaved(true);
      setSaving(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch {
      setError("Failed to save settings");
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/send/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "settings_not_configured") {
          setError("Please save your email settings first");
        } else {
          setError(data.message || "Test email failed");
        }
        setTesting(false);
        return;
      }

      setSuccess("Test EPUB sent — check your Kindle in a few minutes");
      setTesting(false);
      setTimeout(() => setSuccess(null), 8000);
    } catch {
      setError("Failed to send test email");
      setTesting(false);
    }
  }

  const inputStyle = {
    fontFamily: "var(--font-body)",
    background: "var(--color-surface-inset)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--color-accent)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(45,95,45,0.12)";
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "var(--color-border)";
    e.currentTarget.style.boxShadow = "none";
  }

  if (loading) {
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
            Settings
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
          >
            Configure your Kindle email and delivery preferences
          </p>
        </div>
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
      </div>
    );
  }

  const hasSchedule = scheduleDays.length > 0;

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
          Settings
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
        >
          Configure your Kindle email and delivery preferences.
        </p>
      </div>

      {/* Daily Usage */}
      <div
        className="rounded-xl border px-5 py-4 mb-4 flex items-center justify-between"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          animation: "fadeUp 0.6s ease 0.05s both",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background:
                dailySendsUsed >= dailySendLimit
                  ? "var(--color-danger-pale)"
                  : "rgba(90,81,73,0.06)",
              border:
                dailySendsUsed >= dailySendLimit
                  ? "1px solid var(--color-danger-border)"
                  : "1px solid rgba(90,81,73,0.08)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                style={{
                  stroke:
                    dailySendsUsed >= dailySendLimit
                      ? "var(--color-danger)"
                      : "var(--color-text-muted)",
                }}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color:
                  dailySendsUsed >= dailySendLimit
                    ? "var(--color-danger)"
                    : "var(--color-text)",
              }}
            >
              {dailySendsUsed} of {dailySendLimit} sends used today
            </p>
            <p
              className="text-xs"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-dim)",
              }}
            >
              {dailySendsUsed >= dailySendLimit
                ? "Limit resets tomorrow"
                : `${dailySendLimit - dailySendsUsed} remaining`}
            </p>
          </div>
        </div>

        <div
          className="w-24 h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((dailySendsUsed / dailySendLimit) * 100, 100)}%`,
              background:
                dailySendsUsed >= dailySendLimit
                  ? "var(--color-danger)"
                  : "var(--color-accent)",
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Email Configuration */}
        <div
          className="rounded-xl border p-6 mb-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            animation: "fadeUp 0.6s ease 0.1s both",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "rgba(45,95,45,0.07)",
                border: "1px solid rgba(45,95,45,0.12)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  style={{ stroke: "var(--color-accent)" }}
                  strokeWidth="1.5"
                />
                <path
                  d="M2 7l10 7 10-7"
                  style={{ stroke: "var(--color-accent)" }}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2
                className="text-base"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                }}
              >
                Email Configuration
              </h2>
              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Required to send articles to your Kindle
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Kindle Email
              </label>
              <input
                type="email"
                value={kindleEmail}
                onChange={(e) => {
                  setKindleEmail(e.target.value);
                  setError(null);
                }}
                placeholder="yourname@kindle.com"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p
                className="text-xs mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dim)",
                }}
              >
                Found in{" "}
                <a
                  href="https://www.amazon.com/hz/mycd/myx#/home/settings/pdoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-accent)")
                  }
                >
                  Amazon → Manage Content &amp; Devices → Preferences →
                  Personal Document Settings
                </a>
              </p>
            </div>

            <div
              className="rounded-lg px-4 py-3"
              style={{
                background: "var(--color-accent-pale)",
                border: "1px solid rgba(45,95,45,0.12)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  lineHeight: "1.5",
                }}
              >
                Add{" "}
                <span
                  className="font-medium"
                  style={{ color: "var(--color-accent)" }}
                >
                  kindle@q2kindle.com
                </span>{" "}
                to your{" "}
                <a
                  href="https://www.amazon.com/hz/mycd/myx#/home/settings/pdoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-accent)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-accent)")
                  }
                >
                  Amazon Approved Senders list
                </a>{" "}
                so your Kindle accepts articles from q2kindle.
              </p>
            </div>
          </div>

          {/* Test email button */}
          <div
            className="mt-5 pt-5"
            style={{ borderTop: "1px solid var(--color-border-light)" }}
          >
            <button
              type="button"
              disabled={testing || !settingsSaved}
              onClick={handleTestEmail}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => {
                if (!testing && settingsSaved) {
                  e.currentTarget.style.borderColor = "var(--color-border-hover)";
                  e.currentTarget.style.color = "var(--color-text)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-muted)";
              }}
            >
              {testing ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending test…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Send test EPUB to Kindle
                </>
              )}
            </button>
            {!settingsSaved && (
              <p
                className="text-xs mt-2"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dim)",
                }}
              >
                Save your Kindle email first to enable testing
              </p>
            )}
          </div>
        </div>

        {/* Automatic Delivery */}
        <div
          className="rounded-xl border p-6 mb-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            animation: "fadeUp 0.6s ease 0.15s both",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "rgba(90,81,73,0.06)",
                border: "1px solid rgba(90,81,73,0.08)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  style={{ stroke: "var(--color-text-muted)" }}
                  strokeWidth="1.5"
                />
                <path
                  d="M12 7v5l3 3"
                  style={{ stroke: "var(--color-text-muted)" }}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2
                className="text-base"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                }}
              >
                Automatic Delivery
              </h2>
              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Schedule when queued articles are automatically sent to your Kindle
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Day picker */}
            <div>
              <label
                className="block text-xs mb-2.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Delivery days
              </label>
              <div className="flex gap-2">
                {DAY_OPTIONS.map((day) => {
                  const isSelected = scheduleDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className="flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200 cursor-pointer"
                      style={{
                        fontFamily: "var(--font-body)",
                        background: isSelected
                          ? "rgba(45,95,45,0.12)"
                          : "var(--color-surface-inset)",
                        border: isSelected
                          ? "1px solid rgba(45,95,45,0.3)"
                          : "1px solid var(--color-border)",
                        color: isSelected
                          ? "var(--color-accent)"
                          : "var(--color-text-muted)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "var(--color-border-hover)";
                          e.currentTarget.style.color = "var(--color-text)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "var(--color-border)";
                          e.currentTarget.style.color = "var(--color-text-muted)";
                        }
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p
                className="text-xs mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dim)",
                }}
              >
                {hasSchedule
                  ? `Delivery on ${scheduleDays.length} day${scheduleDays.length !== 1 ? "s" : ""} per week`
                  : "Select days to enable automatic delivery"}
              </p>
            </div>

            {/* Time + Timezone row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  className="block text-xs mb-1.5"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Delivery time
                </label>
                <select
                  value={scheduleTime}
                  onChange={(e) => {
                    setScheduleTime(e.target.value);
                    setError(null);
                  }}
                  disabled={!hasSchedule}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select time</option>
                  {Array.from({ length: 24 }, (_, h) => {
                    const value = `${String(h).padStart(2, "0")}:00`;
                    const label = new Date(2000, 0, 1, h).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    });
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-1">
                <label
                  className="block text-xs mb-1.5"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    setError(null);
                  }}
                  disabled={!hasSchedule}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  {timezones.current.map((tz) => (
                    <option key={tz} value={tz}>
                      {formatTimezoneLabel(tz)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minimum articles */}
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Minimum articles to send
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={minArticleCount}
                onChange={(e) => {
                  setMinArticleCount(e.target.value);
                  setError(null);
                }}
                disabled={!hasSchedule}
                placeholder="1"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p
                className="text-xs mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dim)",
                }}
              >
                {hasSchedule
                  ? "Skips delivery if your queue has fewer articles than this"
                  : "Select delivery days first to configure"}
              </p>
            </div>
          </div>
        </div>

        {/* EPUB Formatting */}
        <div
          className="rounded-xl border p-6 mb-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            animation: "fadeUp 0.6s ease 0.2s both",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "rgba(45,95,45,0.07)",
                border: "1px solid rgba(45,95,45,0.12)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  style={{ stroke: "var(--color-accent)" }}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  style={{ stroke: "var(--color-accent)" }}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h2
                className="text-base"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-text)",
                }}
              >
                EPUB Formatting
              </h2>
              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Customize how articles appear on your Kindle
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Include images toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="block text-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Include images
                </label>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-dim)",
                  }}
                >
                  When off, images are stripped from articles
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={epubIncludeImages}
                onClick={() => setEpubIncludeImages(!epubIncludeImages)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
                style={{
                  background: epubIncludeImages
                    ? "rgba(45,95,45,0.3)"
                    : "var(--color-border)",
                  border: epubIncludeImages
                    ? "1px solid rgba(45,95,45,0.5)"
                    : "1px solid var(--color-border-hover)",
                }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full transition-transform duration-200"
                  style={{
                    background: epubIncludeImages
                      ? "var(--color-accent)"
                      : "var(--color-text-dim)",
                    transform: epubIncludeImages
                      ? "translateX(20px)"
                      : "translateX(0px)",
                    marginTop: "0.5px",
                  }}
                />
              </button>
            </div>

            {/* Article metadata toggles */}
            <div>
              <label
                className="block text-xs mb-2.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                Show in article headers
              </label>
              <div className="flex gap-2">
                {([
                  { label: "Author", value: epubShowAuthor, setter: setEpubShowAuthor },
                  { label: "Read time", value: epubShowReadTime, setter: setEpubShowReadTime },
                  { label: "Published date", value: epubShowPublishedDate, setter: setEpubShowPublishedDate },
                ] as const).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className="flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-200 cursor-pointer"
                    style={{
                      fontFamily: "var(--font-body)",
                      background: item.value
                        ? "rgba(45,95,45,0.12)"
                        : "var(--color-surface-inset)",
                      border: item.value
                        ? "1px solid rgba(45,95,45,0.3)"
                        : "1px solid var(--color-border)",
                      color: item.value
                        ? "var(--color-accent)"
                        : "var(--color-text-muted)",
                    }}
                    onMouseEnter={(e) => {
                      if (!item.value) {
                        e.currentTarget.style.borderColor = "var(--color-border-hover)";
                        e.currentTarget.style.color = "var(--color-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.value) {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.color = "var(--color-text-muted)";
                      }
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p
                className="text-xs mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-dim)",
                }}
              >
                Metadata shown below each article title in the EPUB
              </p>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div
            className="mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5"
            style={{
              background: "var(--color-danger-pale)",
              border: "1px solid var(--color-danger-border)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="mt-0.5 shrink-0"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                style={{ stroke: "var(--color-danger)" }}
                strokeWidth="1.5"
                opacity="0.7"
              />
              <path
                d="M8 5v3.5M8 10.5v.5"
                style={{ stroke: "var(--color-danger)" }}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              className="text-sm"
              style={{ color: "var(--color-danger)", fontFamily: "var(--font-body)" }}
            >
              {error}
            </span>
          </div>
        )}

        {success && (
          <div
            className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{
              background: "var(--color-success-pale)",
              border: "1px solid var(--color-success-border)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                style={{ stroke: "var(--color-accent)" }}
                strokeWidth="1.5"
              />
              <path
                d="M5.5 8l2 2 3-4"
                style={{ stroke: "var(--color-accent)" }}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-sm"
              style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}
            >
              {success}
            </span>
          </div>
        )}

        {/* Save button */}
        <div
          className="flex justify-end"
          style={{ animation: "fadeUp 0.6s ease 0.25s both" }}
        >
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-body)",
              background: saving
                ? "var(--color-accent-hover)"
                : "var(--color-accent)",
              color: "var(--color-accent-text)",
              boxShadow: "var(--shadow-button)",
            }}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.background = "var(--color-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.background = "var(--color-accent)";
            }}
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving…
              </span>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
