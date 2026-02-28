"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LandingA() {
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

    // Staggered kindle lines animation
    const lineEls = document.querySelectorAll(".kindle-line");
    lineEls.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${1.2 + i * 0.12}s`;
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      <style jsx>{`
        :global(:root) {
          --bg: #0b0f1a;
          --surface: #111827;
          --surface-raised: #1a2236;
          --border: #1e293b;
          --border-subtle: rgba(148,163,184,0.08);
          --text: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-dim: #475569;
          --accent: #d4a574;
          --accent-light: #e8c9a0;
          --accent-deep: #b8864e;
          --accent-glow: rgba(212,165,116,0.12);
          --heading: 'Fraunces', 'Georgia', serif;
          --body: 'Outfit', -apple-system, sans-serif;
        }

        :global(html) { scroll-behavior: smooth; }

        :global(body) {
          background: var(--bg);
          color: var(--text);
          font-family: var(--body);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          margin: 0;
        }

        /* REVEAL SYSTEM */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-reveal].in-view {
          opacity: 1;
          transform: translateY(0);
        }
        [data-reveal="delay-1"] { transition-delay: 0.1s; }
        [data-reveal="delay-2"] { transition-delay: 0.22s; }
        [data-reveal="delay-3"] { transition-delay: 0.34s; }

        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          background: rgba(11,15,26,0.78);
          border-bottom: 1px solid var(--border-subtle);
        }

        .nav-logo {
          font-family: var(--heading);
          font-size: 21px;
          font-weight: 400;
          color: var(--accent);
          text-decoration: none;
          letter-spacing: -0.01em;
          font-optical-sizing: auto;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-link {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.25s;
          letter-spacing: 0.01em;
        }
        .nav-link:hover { color: var(--text); }

        .nav-cta {
          font-family: var(--body);
          font-size: 13px;
          font-weight: 500;
          padding: 9px 24px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          letter-spacing: 0.02em;
        }
        .nav-cta:hover {
          background: var(--accent-light);
          box-shadow: 0 0 24px var(--accent-glow);
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
        }

        /* Ambient background — layered radials */
        .hero::before {
          content: '';
          position: absolute;
          top: -10%;
          right: -15%;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 55%);
          pointer-events: none;
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: -5%;
          left: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100,130,200,0.04) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Diagonal grid lines */
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(135deg, rgba(148,163,184,0.018) 1px, transparent 1px),
            linear-gradient(225deg, rgba(148,163,184,0.018) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--body);
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          padding: 6px 16px;
          border: 1px solid rgba(212,165,116,0.2);
          border-radius: 100px;
          background: rgba(212,165,116,0.06);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 36px;
          opacity: 0;
          animation: fadeDown 0.6s ease 0.2s forwards;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero h1 {
          font-family: var(--heading);
          font-size: clamp(46px, 6.5vw, 78px);
          font-weight: 300;
          line-height: 1.06;
          letter-spacing: -0.03em;
          margin: 0 0 28px;
          font-optical-sizing: auto;
          opacity: 0;
          animation: heroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }

        .hero h1 em {
          font-style: italic;
          font-weight: 300;
          color: var(--accent);
        }

        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-sub {
          font-family: var(--body);
          font-size: 18px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 44px;
          opacity: 0;
          animation: heroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: heroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
        }

        .btn-primary {
          font-family: var(--body);
          font-size: 15px;
          font-weight: 500;
          padding: 15px 36px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover {
          background: var(--accent-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212,165,116,0.2), 0 0 0 1px rgba(212,165,116,0.15);
        }

        .btn-secondary {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 400;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 15px 8px;
          transition: color 0.25s;
        }
        .btn-secondary:hover { color: var(--accent-light); }

        .hero-proof {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 28px;
          letter-spacing: 0.02em;
          opacity: 0;
          animation: heroReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.85s forwards;
        }

        .hero-proof span {
          margin: 0 10px;
          opacity: 0.3;
        }

        /* FEATURES */
        .features {
          padding: 100px 24px 80px;
          position: relative;
        }

        .features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-deep), transparent);
          opacity: 0.15;
        }

        .section-label {
          display: block;
          font-family: var(--body);
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 16px;
        }

        .section-heading {
          font-family: var(--heading);
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 300;
          text-align: center;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
          line-height: 1.15;
        }

        .section-sub {
          font-family: var(--body);
          font-size: 16px;
          color: var(--text-secondary);
          text-align: center;
          max-width: 480px;
          margin: 0 auto 72px;
          line-height: 1.6;
          font-weight: 300;
        }

        /* Feature rows */
        .feature-row {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          padding: 60px 0;
          border-top: 1px solid var(--border-subtle);
        }

        .feature-row:first-of-type { border-top: none; padding-top: 0; }

        .feature-row.flip { direction: rtl; }
        .feature-row.flip > * { direction: ltr; }

        .feature-num {
          font-family: var(--heading);
          font-size: 48px;
          font-weight: 300;
          color: var(--accent);
          opacity: 0.35;
          line-height: 1;
          margin-bottom: 16px;
          font-style: italic;
        }

        .feature-title {
          font-family: var(--heading);
          font-size: 28px;
          font-weight: 400;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .feature-desc {
          font-family: var(--body);
          font-size: 16px;
          font-weight: 300;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* Visual cards */
        .v-card {
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 28px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.02) inset;
        }

        /* Queue visual */
        .q-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          background: var(--bg);
          border: 1px solid var(--border-subtle);
          margin-bottom: 8px;
        }
        .q-item:last-child { margin-bottom: 0; }

        .q-marker {
          width: 3px;
          height: 32px;
          border-radius: 2px;
          background: var(--accent);
          flex-shrink: 0;
        }

        .q-lines { flex: 1; }

        .q-title-line {
          height: 11px;
          border-radius: 6px;
          background: #2a3550;
          margin-bottom: 7px;
        }

        .q-meta-line {
          height: 8px;
          border-radius: 4px;
          background: #1c2538;
          width: 50%;
        }

        /* Kindle visual */
        .kindle-wrap {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .kindle-ambient {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 60%);
          pointer-events: none;
        }

        .kindle-frame {
          width: 270px;
          background: linear-gradient(180deg, #2a2a2a, #222);
          border-radius: 20px;
          padding: 16px 14px 34px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
          position: relative;
        }

        .kindle-frame::after {
          content: '';
          position: absolute;
          bottom: 13px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3a3a3a;
        }

        .kindle-screen {
          background: #f5f1e8;
          border-radius: 4px;
          padding: 26px 20px;
          min-height: 340px;
          font-family: Georgia, serif;
          color: #1a1a1a;
          filter: grayscale(1);
        }

        .ks-brand {
          font-family: var(--body);
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #999;
          text-align: center;
          margin-bottom: 28px;
        }

        .ks-issue {
          font-size: 18px;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 4px;
        }

        .ks-date {
          font-size: 10px;
          text-align: center;
          color: #888;
          margin-bottom: 24px;
        }

        .ks-rule {
          width: 20px;
          height: 1px;
          background: #ccc;
          margin: 0 auto 18px;
        }

        .ks-toc { list-style: none; padding: 0; margin: 0; }

        .ks-toc li {
          font-size: 10.5px;
          color: #444;
          padding: 6px 0;
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

        /* Kindle lines animation */
        .kindle-line {
          opacity: 0;
          animation: lineSlide 0.5s ease forwards;
        }
        @keyframes lineSlide {
          from { opacity: 0; transform: translateX(-6px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Schedule visual */
        .sched-label {
          font-family: var(--body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .sched-days {
          display: flex;
          gap: 6px;
          margin-bottom: 24px;
        }

        .sched-pill {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--body);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text-dim);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .sched-pill.active {
          background: var(--accent);
          color: var(--bg);
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .sched-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-top: 1px solid var(--border-subtle);
        }

        .sched-row-label {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 300;
          color: var(--text-secondary);
        }

        .sched-row-val {
          font-family: var(--body);
          font-size: 14px;
          font-weight: 400;
          color: var(--text);
          padding: 5px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
        }

        /* BOTTOM CTA */
        .bottom-cta {
          padding: 140px 24px;
          text-align: center;
          position: relative;
        }

        .bottom-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,165,116,0.2), transparent);
        }

        .bottom-cta::after {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(212,165,116,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .bottom-inner {
          position: relative;
          z-index: 1;
        }

        .bottom-cta h2 {
          font-family: var(--heading);
          font-size: clamp(38px, 5.5vw, 62px);
          font-weight: 300;
          letter-spacing: -0.03em;
          line-height: 1.08;
          margin-bottom: 16px;
        }

        .bottom-cta h2 em {
          font-style: italic;
          color: var(--accent);
        }

        .bottom-sub {
          font-family: var(--body);
          font-size: 17px;
          font-weight: 300;
          color: var(--text-secondary);
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .bottom-fine {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 24px;
          letter-spacing: 0.02em;
        }

        /* FOOTER */
        .landing-footer {
          padding: 44px 24px;
          text-align: center;
          border-top: 1px solid var(--border-subtle);
        }

        .landing-footer p {
          font-family: var(--body);
          font-size: 13px;
          color: var(--text-dim);
          font-weight: 300;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .feature-row {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .feature-row.flip { direction: ltr; }
          .kindle-frame { width: 230px; }
        }

        @media (max-width: 768px) {
          .nav { padding: 14px 20px; }
          .nav-links { gap: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">q2kindle</Link>
        <div className="nav-links">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/login" className="nav-cta">Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Your personal reading digest
          </div>
          <h1>Articles deserve<br />a quieter place<br />to be <em>read.</em></h1>
          <p className="hero-sub">
            Queue the articles you find. We compile them into a beautiful ebook and deliver it straight to your Kindle.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">Start reading on Kindle</Link>
            <a href="#features" className="btn-secondary">How it works &darr;</a>
          </div>
          <p className="hero-proof">Free forever<span>&middot;</span>Works with any Kindle<span>&middot;</span>30-second setup</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div data-reveal>
          <span className="section-label">How it works</span>
          <h2 className="section-heading">Three steps to focused reading</h2>
          <p className="section-sub">No apps to install. No accounts to sync. Just your articles, beautifully typeset on your Kindle.</p>
        </div>

        {/* Feature 1 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-num">01</div>
            <h3 className="feature-title">Queue articles from anywhere</h3>
            <p className="feature-desc">Found a longread worth saving? Paste the URL. We extract the title, author, and content automatically. It joins your queue.</p>
          </div>
          <div data-reveal="delay-1">
            <div className="v-card">
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '88%'}} />
                  <div className="q-meta-line" style={{width: '48%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '72%'}} />
                  <div className="q-meta-line" style={{width: '40%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '80%'}} />
                  <div className="q-meta-line" style={{width: '55%'}} />
                </div>
              </div>
              <div className="q-item">
                <div className="q-marker" style={{opacity: 0.35}} />
                <div className="q-lines">
                  <div className="q-title-line" style={{width: '62%', opacity: 0.5}} />
                  <div className="q-meta-line" style={{width: '35%', opacity: 0.5}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 — flipped */}
        <div className="feature-row flip">
          <div data-reveal>
            <div className="feature-num">02</div>
            <h3 className="feature-title">We craft your ebook</h3>
            <p className="feature-desc">Your articles become a properly formatted ebook — cover page, table of contents, clean typography. A real book, not a web page.</p>
          </div>
          <div data-reveal="delay-1">
            <div className="kindle-wrap">
              <div className="kindle-ambient" />
              <div className="kindle-frame">
                <div className="kindle-screen">
                  <div className="ks-brand">q2kindle</div>
                  <div className="ks-issue kindle-line">Issue #14</div>
                  <div className="ks-date kindle-line">February 21, 2026</div>
                  <div className="ks-rule" />
                  <ul className="ks-toc">
                    <li className="kindle-line">The Arc of the Practical Creator <span>12 min</span></li>
                    <li className="kindle-line">Why We Can&apos;t Have Nice Software <span>8 min</span></li>
                    <li className="kindle-line">Reflections on a Year of Building <span>6 min</span></li>
                    <li className="kindle-line">The Tyranny of the Marginal User <span>15 min</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div data-reveal>
            <div className="feature-num">03</div>
            <h3 className="feature-title">Set your schedule.<br />We handle the rest.</h3>
            <p className="feature-desc">Pick your days and time. q2kindle bundles your queue and delivers it — no button to press, nothing to remember.</p>
          </div>
          <div data-reveal="delay-1">
            <div className="v-card">
              <div className="sched-label">Delivery schedule</div>
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
                <div className="sched-row-label">Delivery time</div>
                <div className="sched-row-val">7:00 AM</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Minimum articles</div>
                <div className="sched-row-val">3</div>
              </div>
              <div className="sched-row">
                <div className="sched-row-label">Timezone</div>
                <div className="sched-row-val">America / New York</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta">
        <div className="bottom-inner" data-reveal>
          <h2>Stop saving.<br />Start <em>reading.</em></h2>
          <p className="bottom-sub">Your articles deserve better than a browser tab.</p>
          <Link href="/login" className="btn-primary">Start reading on Kindle</Link>
          <p className="bottom-fine">Free forever &middot; Works with any Kindle &middot; 30-second setup</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>q2kindle &mdash; Queue articles. Get a beautiful ebook. Read distraction-free.</p>
      </footer>
    </>
  );
}
