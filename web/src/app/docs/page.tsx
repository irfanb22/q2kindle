"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./docs.css";

const SECTIONS = [
  { id: "getting-started", title: "Getting Started" },
  { id: "kindle-setup", title: "Setting Up Your Kindle" },
  { id: "adding-articles", title: "Adding Articles" },
  { id: "sending", title: "Sending to Kindle" },
  { id: "automatic-delivery", title: "Automatic Delivery" },
  { id: "epub-formatting", title: "EPUB Formatting" },
  { id: "chrome-extension", title: "Chrome Extension" },
  { id: "limits", title: "Limits & Quotas" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "roadmap", title: "Roadmap" },
] as const;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [showBackTop, setShowBackTop] = useState(false);
  const mobileTocRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
            history.replaceState(null, "", `#${id}`);
          }
        },
        { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Back-to-top visibility
  useEffect(() => {
    function onScroll() {
      setShowBackTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll mobile TOC active item into view
  useEffect(() => {
    if (!mobileTocRef.current) return;
    const activeEl = mobileTocRef.current.querySelector(".active");
    if (activeEl) {
      (activeEl as HTMLElement).scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeSection]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Back link */}
      <div className="px-6 pt-8 lg:pt-10" style={{ maxWidth: 1024, margin: "0 auto" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Mobile TOC */}
      <div
        ref={mobileTocRef}
        className="docs-mobile-toc"
        style={{ background: "rgba(252,250,248,0.85)" }}
      >
        {SECTIONS.map(({ id, title }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`docs-mobile-toc-link ${activeSection === id ? "active" : ""}`}
            style={{
              fontFamily: "var(--font-body)",
              background: activeSection === id ? undefined : "rgba(0,0,0,0.04)",
              color: activeSection === id ? undefined : "var(--color-text-dim)",
            }}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="docs-layout px-6 pt-8 lg:pt-2" style={{ maxWidth: 1024, margin: "0 auto" }}>
        {/* Sidebar */}
        <nav className="docs-sidebar">
          <p className="docs-sidebar-title" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dim)" }}>
            Documentation
          </p>
          <ul className="docs-toc-list">
            {SECTIONS.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(id);
                  }}
                  className={`docs-toc-link ${activeSection === id ? "active" : ""}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    color: activeSection === id ? undefined : "var(--color-text-dim)",
                  }}
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="docs-content" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
          <h1
            className="text-4xl tracking-tight mb-3"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            How q2Kindle works
          </h1>
          <p className="mb-12" style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Everything you need to know about sending articles to your Kindle.
          </p>

          {/* ── Getting Started ── */}
          <section id="getting-started" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Getting Started
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              q2Kindle turns web articles into a formatted ebook and delivers it straight to your Kindle.
              Here&apos;s how it works:
            </p>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>1</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Save articles.</strong>{" "}
                  Paste a URL into your dashboard or use the Chrome extension to save the page you&apos;re reading. q2Kindle
                  extracts the article content, title, author, and read time automatically.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>2</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Queue them up.</strong>{" "}
                  Your articles sit in a queue until you&apos;re ready. Add as many as you like &mdash; they&apos;ll all be bundled
                  into a single ebook.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>3</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Send to Kindle.</strong>{" "}
                  Hit send (or set up automatic delivery) and q2Kindle creates an EPUB with a cover page, table of contents, and
                  all your articles &mdash; then emails it to your Kindle. It shows up in your library like any other book.
                </p>
              </div>
            </div>
          </section>

          {/* ── Setting Up Your Kindle ── */}
          <section id="kindle-setup" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Setting Up Your Kindle
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Two things need to happen before articles can reach your Kindle:
            </p>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>1</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Find your Kindle email address.</strong>{" "}
                  Go to{" "}
                  <a href="https://www.amazon.com/hz/mycd/myx#/home/settings/payment" target="_blank" rel="noopener noreferrer">
                    Amazon &rarr; Manage Your Content and Devices &rarr; Preferences
                  </a>
                  . Scroll down to &ldquo;Personal Document Settings&rdquo; and find your Send-to-Kindle email (it looks like{" "}
                  <code>something@kindle.com</code>). Enter this in your q2Kindle{" "}
                  <a href="/settings">settings</a>.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>2</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Approve the sender.</strong>{" "}
                  On the same Amazon page, find the &ldquo;Approved Personal Document E-mail List&rdquo; section and add{" "}
                  <code>kindle@q2kindle.com</code>. This tells Amazon it&apos;s safe to deliver emails from q2Kindle to your device.
                </p>
              </div>
            </div>
            <div className="docs-step">
              <div className="docs-step-num" style={{ background: "rgba(45,95,45,0.1)", color: "var(--color-accent)" }}>3</div>
              <div className="docs-step-body">
                <p style={{ color: "var(--color-text-muted)" }}>
                  <strong style={{ color: "var(--color-text)" }}>Send a test email.</strong>{" "}
                  Go to your <a href="/settings">settings page</a> and click the test button. If everything is set up correctly,
                  a small test ebook will appear on your Kindle within a few minutes.
                </p>
              </div>
            </div>
          </section>

          {/* ── Adding Articles ── */}
          <section id="adding-articles" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Adding Articles
            </h2>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              From the dashboard
            </h3>
            <p style={{ color: "var(--color-text-muted)" }}>
              Paste any article URL into the input field on your <a href="/dashboard">dashboard</a> and hit Add.
              q2Kindle will fetch the page, extract the readable content, and add it to your queue. You&apos;ll see the
              title, author, and estimated read time appear on the card.
            </p>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              From the Chrome extension
            </h3>
            <p style={{ color: "var(--color-text-muted)" }}>
              The{" "}
              <a href="https://chromewebstore.google.com/detail/q2kindle-%E2%80%94-save-to-queue/pjicihhhplcnbnjbhnklldmibgidkmon" target="_blank" rel="noopener noreferrer">
                Chrome extension
              </a>{" "}
              lets you save the page you&apos;re currently reading straight to your queue. It captures the page as you see it,
              which means it works even for articles behind paywalls.
            </p>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              When extraction fails
            </h3>
            <p style={{ color: "var(--color-text-muted)" }}>
              Some websites block automated content extraction. When this happens, the article stays in your queue with a
              warning badge. It won&apos;t be included when you send to Kindle, but you can still see the original URL
              and try again later. The Chrome extension can often capture content that URL extraction can&apos;t.
            </p>
          </section>

          {/* ── Sending to Kindle ── */}
          <section id="sending" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Sending to Kindle
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              When you click &ldquo;Send to Kindle,&rdquo; q2Kindle bundles all your queued articles into a single EPUB ebook.
              Each article becomes a chapter with its own entry in the table of contents. The ebook gets a branded
              cover page showing the date, issue number, article count, and total read time.
            </p>
            <p style={{ color: "var(--color-text-muted)" }}>
              The EPUB is emailed to your Kindle address and typically appears in your library within a few minutes.
              On success, your queue is cleared and the send is logged in your <a href="/history">history</a>.
            </p>
            <p style={{ color: "var(--color-text-muted)" }}>
              If any articles in your queue had failed extraction, they&apos;re silently skipped &mdash; you&apos;ll see a note
              telling you how many were skipped.
            </p>
          </section>

          {/* ── Automatic Delivery ── */}
          <section id="automatic-delivery" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Automatic Delivery
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Instead of sending manually, you can schedule automatic delivery from your{" "}
              <a href="/settings">settings</a>. Pick which days of the week you want delivery (any combination of
              Monday through Sunday), choose an hour, and set your timezone.
            </p>
            <p style={{ color: "var(--color-text-muted)" }}>
              You can also set a <strong style={{ color: "var(--color-text)" }}>minimum article count</strong>.
              If your queue has fewer articles than the minimum when the scheduled time comes, the send is skipped
              and your articles stay in the queue for next time.
            </p>
            <p style={{ color: "var(--color-text-muted)" }}>
              Scheduled sends count toward your daily send limit, just like manual sends.
            </p>
          </section>

          {/* ── EPUB Formatting ── */}
          <section id="epub-formatting" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              EPUB Formatting
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Every ebook q2Kindle creates includes a cover page, a table of contents, and individually
              formatted article chapters. The cover shows a <strong style={{ color: "var(--color-text)" }}>volume
              and issue number</strong> to help you track your reading over time &mdash; the volume is the year
              (Volume 1 = 2026, Volume 2 = 2027, and so on), and the issue increments with each send. So if
              you&apos;ve sent 12 ebooks this year, your next one will be Volume 1, Issue 13.
            </p>
            <p style={{ color: "var(--color-text-muted)" }}>
              You can customize what&apos;s included in your <a href="/settings">settings</a>:
            </p>
            <ul style={{ color: "var(--color-text-muted)" }}>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Include images</strong> &mdash; on by default. Turn off for
                faster downloads and smaller file sizes.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Show author</strong> &mdash; displays the article author at the
                top of each chapter.
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Show read time</strong> &mdash; estimated reading time (calculated
                at 238 words per minute).
              </li>
              <li>
                <strong style={{ color: "var(--color-text)" }}>Show published date</strong> &mdash; the original publication date,
                if available.
              </li>
            </ul>
          </section>

          {/* ── Chrome Extension ── */}
          <section id="chrome-extension" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Chrome Extension
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              The{" "}
              <a href="https://chromewebstore.google.com/detail/q2kindle-%E2%80%94-save-to-queue/pjicihhhplcnbnjbhnklldmibgidkmon" target="_blank" rel="noopener noreferrer">
                q2Kindle Chrome extension
              </a>{" "}
              is an easy way to save articles you&apos;re viewing on the web directly to your queue.
            </p>
            <ul style={{ color: "var(--color-text-muted)" }}>
              <li>Click the extension icon on any article page, then hit save</li>
              <li>Uses the same account as the web app &mdash; sign in once with your email</li>
              <li>Captures the full page HTML, so it works behind paywalls and login walls</li>
              <li>Saved articles appear in your dashboard queue immediately</li>
            </ul>
            <p style={{ color: "var(--color-text-muted)" }}>
              <a href="https://chromewebstore.google.com/detail/q2kindle-%E2%80%94-save-to-queue/pjicihhhplcnbnjbhnklldmibgidkmon" target="_blank" rel="noopener noreferrer">
                Install from the Chrome Web Store &rarr;
              </a>
            </p>
          </section>

          {/* ── Limits & Quotas ── */}
          <section id="limits" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Limits & Quotas
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              q2Kindle is free to use. To keep the service running smoothly, there are a few daily limits:
            </p>
            <div className="docs-stats-grid">
              <div className="docs-stat-card" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-stat-number" style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent)" }}>10</div>
                <div className="docs-stat-label" style={{ color: "var(--color-text-muted)" }}>sends per day</div>
              </div>
              <div className="docs-stat-card" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-stat-number" style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent)" }}>50</div>
                <div className="docs-stat-label" style={{ color: "var(--color-text-muted)" }}>articles extracted per day</div>
              </div>
              <div className="docs-stat-card" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-stat-number" style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent)" }}>~4 MB</div>
                <div className="docs-stat-label" style={{ color: "var(--color-text-muted)" }}>max email size</div>
              </div>
            </div>
            <ul style={{ color: "var(--color-text-muted)" }}>
              <li>Each &ldquo;send&rdquo; bundles all your queued articles into one email &mdash; so 10 sends can deliver hundreds of articles.</li>
              <li>Limits reset at midnight in your configured timezone.</li>
              <li>Text-only EPUBs are well under the size limit. If you&apos;re hitting it, try disabling images in your EPUB settings.</li>
              <li>You can see your current usage on the <a href="/settings">settings page</a>.</li>
            </ul>
          </section>

          {/* ── Troubleshooting ── */}
          <section id="troubleshooting" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Troubleshooting
            </h2>

            <div className="docs-faq-item">
              <p className="docs-faq-q" style={{ color: "var(--color-text)" }}>
                Articles aren&apos;t arriving on my Kindle
              </p>
              <p className="docs-faq-a" style={{ color: "var(--color-text-muted)" }}>
                The most common cause is a missing approved sender. Make sure you&apos;ve added{" "}
                <code>kindle@q2kindle.com</code> to your{" "}
                <a href="https://www.amazon.com/hz/mycd/myx#/home/settings/payment" target="_blank" rel="noopener noreferrer">
                  Amazon approved senders list
                </a>
                . Also double-check that your Kindle email address is spelled correctly in{" "}
                <a href="/settings">settings</a>. Try sending a test email to verify the full pipeline.
              </p>
            </div>

            <div className="docs-faq-item">
              <p className="docs-faq-q" style={{ color: "var(--color-text)" }}>
                An article failed to extract
              </p>
              <p className="docs-faq-a" style={{ color: "var(--color-text-muted)" }}>
                Some websites actively block automated content extraction. The article will stay in your queue with a
                warning badge but won&apos;t be included when you send to Kindle. Try using the{" "}
                <a href="https://chromewebstore.google.com/detail/q2kindle-%E2%80%94-save-to-queue/pjicihhhplcnbnjbhnklldmibgidkmon" target="_blank" rel="noopener noreferrer">
                  Chrome extension
                </a>{" "}
                instead &mdash; it captures the page as you see it, which often works when URL extraction can&apos;t.
              </p>
            </div>

            <div className="docs-faq-item">
              <p className="docs-faq-q" style={{ color: "var(--color-text)" }}>
                I&apos;ve hit the daily send limit
              </p>
              <p className="docs-faq-a" style={{ color: "var(--color-text-muted)" }}>
                The limit resets at midnight in your timezone. To make the most of each send, queue up more articles
                before sending &mdash; each send bundles everything in your queue into one ebook, so you rarely need
                more than one or two sends per day.
              </p>
            </div>

            <div className="docs-faq-item">
              <p className="docs-faq-q" style={{ color: "var(--color-text)" }}>
                The ebook looks different from the article preview
              </p>
              <p className="docs-faq-a" style={{ color: "var(--color-text-muted)" }}>
                The article preview on q2Kindle is an approximation. Your Kindle applies its own fonts, margins, and
                formatting. The content will be the same, but the visual presentation depends on your device settings.
              </p>
            </div>

            <p className="mt-8" style={{ color: "var(--color-text-muted)" }}>
              Still stuck? Email us at{" "}
              <a href="mailto:support@q2kindle.com">support@q2kindle.com</a> and we&apos;ll help you out.
            </p>
          </section>

          {/* ── Roadmap ── */}
          <section id="roadmap" className="mb-16">
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontWeight: 400 }}>
              Roadmap
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Here&apos;s what we&apos;ve built, what we&apos;re working on, and what we&apos;re considering.
            </p>

            <div className="docs-roadmap-board">
              {/* Shipped */}
              <div className="docs-roadmap-col" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-roadmap-header docs-roadmap-header--shipped">Shipped</div>
                <div className="docs-roadmap-items">
                  {[
                    { title: "Chrome extension", desc: "Save articles from your browser" },
                    { title: "Automatic delivery", desc: "Schedule sends on your terms" },
                    { title: "EPUB customization", desc: "Images, metadata, cover pages" },
                    { title: "Article preview", desc: "Kindle mockup before you send" },
                  ].map((item) => (
                    <div key={item.title} className="docs-roadmap-card" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div className="docs-roadmap-card-title" style={{ color: "var(--color-text)" }}>{item.title}</div>
                      <div className="docs-roadmap-card-desc" style={{ color: "var(--color-text-dim)" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actively Working On */}
              <div className="docs-roadmap-col" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-roadmap-header docs-roadmap-header--active">Actively Working On</div>
                <div className="docs-roadmap-items">
                  {[
                    { title: "RSS feed reader", desc: "Subscribe to feeds, browse articles, add to queue" },
                  ].map((item) => (
                    <div key={item.title} className="docs-roadmap-card" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div className="docs-roadmap-card-title" style={{ color: "var(--color-text)" }}>{item.title}</div>
                      <div className="docs-roadmap-card-desc" style={{ color: "var(--color-text-dim)" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maybe */}
              <div className="docs-roadmap-col" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="docs-roadmap-header docs-roadmap-header--maybe">Maybe</div>
                <div className="docs-roadmap-items">
                  {[
                    { title: "Open source", desc: "Make the codebase publicly available" },
                    { title: "Auto-generated articles", desc: "AI-curated articles based on your interests" },
                  ].map((item) => (
                    <div key={item.title} className="docs-roadmap-card" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div className="docs-roadmap-card-title" style={{ color: "var(--color-text)" }}>{item.title}</div>
                      <div className="docs-roadmap-card-desc" style={{ color: "var(--color-text-dim)" }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Back to top */}
      <button
        className={`docs-back-top ${showBackTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
          color: "var(--color-text-muted)",
        }}
        aria-label="Back to top"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
