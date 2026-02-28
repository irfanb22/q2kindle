"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LandingC() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      <style jsx>{`
        :global(:root) {
          --bg: #f4f4f6;
          --surface: #ffffff;
          --surface-alt: #eeeef1;
          --border: #d8d8dd;
          --border-light: #e8e8ec;
          --text: #111113;
          --text-secondary: #60606b;
          --text-dim: #9d9da8;
          --accent: #5b5bd6;
          --accent-light: #6e6ede;
          --accent-pale: rgba(91,91,214,0.06);
          --accent-border: rgba(91,91,214,0.15);
          --mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
          --sans: 'IBM Plex Sans', -apple-system, sans-serif;
        }

        :global(html) { scroll-behavior: smooth; }

        :global(body) {
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          margin: 0;
        }

        /* REVEAL */
        [data-reveal] {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-reveal].in-view {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal="d1"] { transition-delay: 0.1s; }
        [data-reveal="d2"] { transition-delay: 0.2s; }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 14px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(16px) saturate(1.2);
          -webkit-backdrop-filter: blur(16px) saturate(1.2);
          background: rgba(244,244,246,0.8);
          border-bottom: 1px solid var(--border-light);
        }

        .nav-logo {
          font-family: var(--mono);
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--text); }

        .nav-cta {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 20px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .nav-cta:hover {
          background: var(--accent-light);
          box-shadow: 0 2px 12px rgba(91,91,214,0.2);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 140px 24px 100px;
          position: relative;
          overflow: hidden;
          background: var(--bg);
        }

        /* Dot grid */
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse 55% 50% at 50% 45%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 55% 50% at 50% 45%, black 30%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 680px;
        }

        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          padding: 5px 14px;
          border: 1px solid var(--accent-border);
          border-radius: 6px;
          background: var(--accent-pale);
          margin-bottom: 32px;
          letter-spacing: 0.02em;
          opacity: 0;
          animation: chipIn 0.5s ease 0.15s forwards;
        }

        @keyframes chipIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .hero h1 {
          font-family: var(--sans);
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 600;
          line-height: 1.06;
          letter-spacing: -0.04em;
          margin: 0 0 24px;
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards;
        }

        .hero h1 .accent {
          color: var(--accent);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-sub {
          font-family: var(--sans);
          font-size: 18px;
          font-weight: 300;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto 40px;
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards;
        }

        .btn-primary {
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 500;
          padding: 14px 32px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: var(--accent-light);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(91,91,214,0.2);
        }

        .btn-outline {
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 500;
          padding: 14px 28px;
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
        }
        .btn-outline:hover {
          border-color: var(--accent-border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .hero-proof {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 24px;
          letter-spacing: 0.01em;
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
        }

        .hero-proof span {
          margin: 0 8px;
          opacity: 0.4;
        }

        /* FEATURES */
        .features {
          padding: 100px 24px 80px;
          position: relative;
          background: var(--surface);
        }

        .section-tag {
          display: block;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          text-align: center;
          margin-bottom: 14px;
          letter-spacing: 0.04em;
        }

        .section-heading {
          font-family: var(--sans);
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 600;
          text-align: center;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
          line-height: 1.15;
        }

        .section-sub {
          font-family: var(--sans);
          font-size: 16px;
          font-weight: 300;
          color: var(--text-secondary);
          text-align: center;
          max-width: 440px;
          margin: 0 auto 72px;
          line-height: 1.6;
        }

        /* Feature rows */
        .feature-row {
          max-width: 1020px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
          padding: 56px 0;
          border-top: 1px solid var(--border-light);
        }

        .feature-row:first-of-type { border-top: none; padding-top: 0; }

        .feature-row.flip { direction: rtl; }
        .feature-row.flip > * { direction: ltr; }

        .feature-step-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--accent-pale);
          border: 1px solid var(--accent-border);
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .feature-title {
          font-family: var(--sans);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .feature-desc {
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 300;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* Visual cards */
        .v-card {
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg);
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        /* Queue visual */
        .q-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border-light);
          margin-bottom: 6px;
        }
        .q-item:last-child { margin-bottom: 0; }

        .q-check {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.5px solid var(--border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .q-check-inner {
          width: 8px;
          height: 8px;
          border-radius: 2px;
          background: var(--accent);
        }

        .q-lines { flex: 1; }

        .q-title-line {
          height: 10px;
          border-radius: 5px;
          background: var(--border);
          margin-bottom: 5px;
        }

        .q-meta-line {
          height: 7px;
          border-radius: 4px;
          background: var(--border-light);
          width: 50%;
        }

        /* Kindle visual */
        .kindle-wrap {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .kindle-frame {
          width: 260px;
          background: #333;
          border-radius: 18px;
          padding: 14px 12px 30px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
          position: relative;
        }

        .kindle-frame::after {
          content: '';
          position: absolute;
          bottom: 11px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #444;
        }

        .kindle-screen {
          background: #f5f1e8;
          border-radius: 3px;
          padding: 24px 18px;
          min-height: 320px;
          font-family: Georgia, serif;
          color: #1a1a1a;
          filter: grayscale(1);
        }

        .ks-brand {
          font-family: var(--mono);
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #999;
          text-align: center;
          margin-bottom: 26px;
        }

        .ks-issue {
          font-size: 17px;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 3px;
        }

        .ks-date {
          font-size: 10px;
          text-align: center;
          color: #888;
          margin-bottom: 22px;
        }

        .ks-rule {
          width: 18px;
          height: 1px;
          background: #ccc;
          margin: 0 auto 16px;
        }

        .ks-toc { list-style: none; padding: 0; margin: 0; }

        .ks-toc li {
          font-size: 10px;
          color: #444;
          padding: 5.5px 0;
          border-bottom: 1px solid #e8e4db;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          line-height: 1.4;
        }
        .ks-toc li:last-child { border-bottom: none; }
        .ks-toc li span {
          font-size: 8px;
          color: #aaa;
          flex-shrink: 0;
          margin-left: 8px;
        }

        /* Schedule visual */
        .sched-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
        }

        .sched-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--accent-pale);
          border: 1px solid var(--accent-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .sched-label {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .sched-days {
          display: flex;
          gap: 5px;
          margin-bottom: 20px;
        }

        .sched-pill {
          width: 38px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--border-light);
          background: var(--surface);
          color: var(--text-dim);
          transition: all 0.3s;
        }

        .sched-pill.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(91,91,214,0.15);
        }

        .sched-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid var(--border-light);
        }

        .sched-row-label {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 400;
          color: var(--text-secondary);
        }

        .sched-row-val {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text);
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          background: var(--surface);
        }

        /* BOTTOM CTA */
        .bottom-cta {
          padding: 140px 24px;
          text-align: center;
          position: relative;
          background: var(--bg);
        }

        /* Dot grid subtle */
        .bottom-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse 50% 60% at 50% 50%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 50% 60% at 50% 50%, black 20%, transparent 70%);
          pointer-events: none;
        }

        .bottom-inner {
          position: relative;
          z-index: 1;
        }

        .bottom-cta h2 {
          font-family: var(--sans);
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 600;
          letter-spacing: -0.035em;
          line-height: 1.08;
          margin-bottom: 14px;
        }

        .bottom-cta h2 .accent {
          color: var(--accent);
        }

        .bottom-sub {
          font-family: var(--sans);
          font-size: 17px;
          font-weight: 300;
          color: var(--text-secondary);
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .bottom-fine {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 22px;
        }

        /* FOOTER */
        .landing-footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid var(--border-light);
          background: var(--surface);
        }

        .landing-footer p {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 300;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .feature-row {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .feature-row.flip { direction: ltr; }
          .kindle-frame { width: 220px; }
        }

        @media (max-width: 768px) {
          .nav { padding: 12px 20px; }
          .nav-links { gap: 14px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">q2kindle</Link>
        <div className="nav-links">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/login" className="nav-cta">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            article-to-kindle pipeline
          </div>
          <h1>Your articles,<br />on your Kindle.<br /><span className="accent">Automatically.</span></h1>
          <p className="hero-sub">
            Queue articles. We compile them into a formatted ebook and deliver it to your Kindle — on your schedule.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">Send your first article</Link>
            <a href="#features" className="btn-outline">How it works</a>
          </div>
          <p className="hero-proof">Free forever<span>&middot;</span>Any Kindle<span>&middot;</span>30s setup</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div data-reveal>
          <span className="section-tag">how it works</span>
          <h2 className="section-heading">Three steps to focused reading</h2>
          <p className="section-sub">No apps to install. No browser extensions. Just your articles, typeset and delivered.</p>
        </div>

        {/* Feature 1 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-step-badge">1</div>
            <h3 className="feature-title">Queue articles from anywhere</h3>
            <p className="feature-desc">Found something worth reading? Paste the URL. We extract the title, author, and full content. It joins your queue instantly.</p>
          </div>
          <div data-reveal="d1">
            <div className="v-card">
              <div className="q-item">
                <div className="q-check"><div className="q-check-inner" /></div>
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '86%'}} />
                  <div className="q-meta-line" style={{width: '48%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-check"><div className="q-check-inner" /></div>
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '70%'}} />
                  <div className="q-meta-line" style={{width: '40%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-check"><div className="q-check-inner" /></div>
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '78%'}} />
                  <div className="q-meta-line" style={{width: '54%'}} />
                </div>
              </div>
              <div className="q-item" style={{opacity: 0.5}}>
                <div className="q-check" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '60%'}} />
                  <div className="q-meta-line" style={{width: '34%'}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 — flipped */}
        <div className="feature-row flip">
          <div data-reveal>
            <div className="feature-step-badge">2</div>
            <h3 className="feature-title">We build your ebook</h3>
            <p className="feature-desc">Your articles become a properly formatted ebook — cover page, table of contents, clean typography. A real book, not a web page.</p>
          </div>
          <div data-reveal="d1">
            <div className="kindle-wrap">
              <div className="kindle-frame">
                <div className="kindle-screen">
                  <div className="ks-brand">q2kindle</div>
                  <div className="ks-issue">Issue #14</div>
                  <div className="ks-date">February 21, 2026</div>
                  <div className="ks-rule" />
                  <ul className="ks-toc">
                    <li>The Arc of the Practical Creator <span>12 min</span></li>
                    <li>Why We Can&apos;t Have Nice Software <span>8 min</span></li>
                    <li>Reflections on a Year of Building <span>6 min</span></li>
                    <li>The Tyranny of the Marginal User <span>15 min</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-step-badge">3</div>
            <h3 className="feature-title">Set your schedule.<br />We handle the rest.</h3>
            <p className="feature-desc">Pick your delivery days and time. q2kindle bundles your queue and sends it — no button to press, nothing to remember.</p>
          </div>
          <div data-reveal="d1">
            <div className="v-card">
              <div className="sched-header">
                <div className="sched-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="sched-label">Delivery schedule</div>
              </div>
              <div className="sched-days">
                <div className="sched-pill active">M</div>
                <div className="sched-pill">T</div>
                <div className="sched-pill">W</div>
                <div className="sched-pill active">T</div>
                <div className="sched-pill">F</div>
                <div className="sched-pill active">S</div>
                <div className="sched-pill">S</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Time</div>
                <div className="sched-row-val">07:00</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Min. articles</div>
                <div className="sched-row-val">3</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Timezone</div>
                <div className="sched-row-val">US/Eastern</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <div className="bottom-inner" data-reveal>
          <h2>Stop saving.<br />Start <span className="accent">reading.</span></h2>
          <p className="bottom-sub">Your articles deserve better than a browser tab.</p>
          <Link href="/login" className="btn-primary">Send your first article</Link>
          <p className="bottom-fine">Free forever &middot; Any Kindle &middot; 30-second setup</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>q2kindle &mdash; Queue articles. Get a beautiful ebook. Read distraction-free.</p>
      </footer>
    </>
  );
}
