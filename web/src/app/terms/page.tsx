import Link from "next/link";

export const metadata = {
  title: "Terms of Service — q2kindle",
  description: "Terms of service for using q2kindle",
};

export default function TermsPage() {
  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-12 transition-colors duration-200"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
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
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>

        <p
          className="text-sm mb-12"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-dim)",
          }}
        >
          Last updated: March 14, 2026
        </p>

        {/* Content */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            lineHeight: 1.8,
          }}
        >
          <Section title="The basics">
            <p>
              q2kindle is a free tool that lets you save articles, bundle them
              into an ebook, and send them to your Kindle. By using it, you
              agree to these terms. They&apos;re written in plain English because
              we think that&apos;s how terms should be.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              You sign in with your email address via a magic link — no
              passwords. You&apos;re responsible for keeping access to your email
              secure, since that&apos;s how you log in. One account per person,
              please.
            </p>
          </Section>

          <Section title="What you can do">
            <ul className="list-disc pl-6 space-y-2">
              <li>Queue articles from the web and send them to your Kindle.</li>
              <li>Set up automatic delivery on a schedule you choose.</li>
              <li>Use any tools we provide to save articles while browsing.</li>
            </ul>
          </Section>

          <Section title="What we ask you not to do">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Don&apos;t use q2kindle to send content to anyone other than
                yourself.
              </li>
              <li>
                Don&apos;t abuse the service — automated scraping, spamming, or
                anything that could degrade the experience for others.
              </li>
              <li>
                Don&apos;t use it for anything illegal.
              </li>
            </ul>
          </Section>

          <Section title="Content and copyright">
            <p>
              q2kindle extracts article content from URLs you provide so it can
              be formatted for your Kindle. We don&apos;t host, redistribute, or
              publish that content — it&apos;s sent only to your personal
              device. You&apos;re responsible for ensuring you have the right to
              read the content you queue (in practice, if you can read it in
              your browser, you&apos;re fine).
            </p>
          </Section>

          <Section title="The service itself">
            <p>
              q2kindle is provided as-is. We do our best to keep it running and
              reliable, but we&apos;re a small project and can&apos;t guarantee
              100% uptime or that every article will extract perfectly. We
              reserve the right to modify, suspend, or discontinue the service
              at any time.
            </p>
          </Section>

          <Section title="Limits">
            <p>
              To keep things fair and sustainable, there&apos;s a daily limit of
              10 deliveries per account. We may adjust this as the service
              grows.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You can stop using q2kindle at any time. We may also close
              accounts that violate these terms or abuse the service. If you
              want your data deleted, just reach out.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms occasionally. If we make significant
              changes, we&apos;ll note it here with an updated date. Continued
              use of q2kindle after changes means you accept the new terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Open an issue on{" "}
              <a
                href="https://github.com/irfanb22/q2kindle/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                GitHub
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
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
          fontFamily: "var(--font-heading)",
          color: "var(--color-text)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
