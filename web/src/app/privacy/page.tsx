import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — q2kindle",
  description: "How q2kindle handles your data",
};

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500&display=swap');
      `}</style>

      <div
        className="min-h-screen px-6 py-12"
        style={{ background: "#0a0a0a" }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-12 transition-colors duration-200"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#888888",
              textDecoration: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ opacity: 0.7 }}
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to home
          </Link>

          {/* Title */}
          <h1
            className="text-4xl tracking-tight mb-3"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              color: "#ededed",
              letterSpacing: "-0.02em",
            }}
          >
            Privacy Policy
          </h1>

          <p
            className="text-sm mb-12"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#555555",
            }}
          >
            Last updated: February 24, 2026
          </p>

          {/* Content */}
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#b0b0b0",
              lineHeight: 1.8,
            }}
          >
            <Section title="What is q2kindle">
              <p>
                q2kindle is a web application that lets you save articles from
                the web, bundle them into an ebook (EPUB format), and deliver
                them to your Amazon Kindle device via email. We are committed
                to protecting your privacy and being transparent about how we
                handle your data.
              </p>
            </Section>

            <Section title="Information We Collect">
              <p>We collect the minimum data needed to provide the service:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong style={{ color: "#ededed" }}>Email address</strong> —
                  used for account authentication via passwordless magic links.
                  This is the only personal information required to create an
                  account.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Kindle email address</strong> —
                  the Amazon Kindle email you provide in your settings so we can
                  deliver ebooks to your device.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Article URLs and content</strong> —
                  when you add an article, we fetch and extract the readable
                  content (title, author, text) for EPUB generation. This
                  content is stored temporarily while the article is in your
                  queue.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Send history</strong> —
                  a log of when deliveries were made, including article count
                  and delivery status, so you can review past sends.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Delivery preferences</strong> —
                  your chosen schedule, timezone, and EPUB formatting options.
                </li>
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <p>Your data is used solely to provide the q2kindle service:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong style={{ color: "#ededed" }}>Authentication</strong> —
                  your email address is used to send magic link sign-in emails.
                  We never store passwords.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Article extraction</strong> —
                  we fetch article URLs you provide to extract readable content
                  for your ebook.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>EPUB generation</strong> —
                  extracted articles are bundled into an EPUB ebook formatted for
                  Kindle reading.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Email delivery</strong> —
                  the EPUB is sent as an email attachment to your Kindle email
                  address. Each email goes only to your own device — we never
                  send marketing, promotional, or bulk emails.
                </li>
              </ul>
            </Section>

            <Section title="Email Practices">
              <p>
                We take email delivery seriously and maintain strict practices:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Emails are sent only to{" "}
                  <strong style={{ color: "#ededed" }}>
                    your own Kindle email address
                  </strong>{" "}
                  that you explicitly provide.
                </li>
                <li>
                  You must manually add our sender address (
                  <span style={{ color: "#ededed" }}>kindle@q2kindle.com</span>)
                  to your Amazon approved senders list before delivery can work.
                </li>
                <li>
                  We do not send marketing, advertising, or promotional emails.
                </li>
                <li>
                  Each email contains a single EPUB attachment — your bundled
                  articles.
                </li>
                <li>
                  Users are limited to 10 deliveries per day to prevent abuse.
                </li>
              </ul>
            </Section>

            <Section title="Third-Party Services">
              <p>
                We use the following trusted third-party services to operate
                q2kindle:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong style={{ color: "#ededed" }}>Supabase</strong> —
                  authentication and database hosting (stores your account,
                  articles, and settings).
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Amazon SES</strong> —
                  email delivery service for sending EPUBs to your Kindle.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Resend</strong> —
                  delivers authentication emails (magic link sign-in).
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>Netlify</strong> —
                  web application hosting.
                </li>
              </ul>
              <p className="mt-3">
                We do not sell, share, or provide your personal data to any
                third party for advertising or marketing purposes.
              </p>
            </Section>

            <Section title="Data Storage & Retention">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  All data is stored securely in a Supabase-hosted PostgreSQL
                  database with row-level security (RLS) policies — each user
                  can only access their own data.
                </li>
                <li>
                  Article content is stored while in your queue and marked as
                  sent after delivery. You can delete articles from your queue at
                  any time.
                </li>
                <li>
                  Send history is retained so you can review past deliveries.
                </li>
                <li>
                  If you wish to delete your account and all associated data,
                  please contact us.
                </li>
              </ul>
            </Section>

            <Section title="Security">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong style={{ color: "#ededed" }}>
                    Passwordless authentication
                  </strong>{" "}
                  — we use magic links sent to your email. No passwords are ever
                  stored or transmitted.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>HTTPS everywhere</strong>{" "}
                  — all connections to q2kindle.com are encrypted via TLS/SSL.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>
                    No sensitive credentials stored
                  </strong>{" "}
                  — we do not store any email passwords, API keys, or financial
                  information from users.
                </li>
                <li>
                  <strong style={{ color: "#ededed" }}>
                    Row-level security
                  </strong>{" "}
                  — database access is scoped per user via Supabase RLS
                  policies.
                </li>
              </ul>
            </Section>

            <Section title="Contact">
              <p>
                If you have questions about this privacy policy or how your data
                is handled, please reach out at{" "}
                <a
                  href="mailto:privacy@q2kindle.com"
                  style={{ color: "#22c55e", textDecoration: "none" }}
                >
                  privacy@q2kindle.com
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2
        className="text-2xl tracking-tight mb-4"
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          color: "#ededed",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
